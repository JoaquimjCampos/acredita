"""Marketplace API views (versão inicial)."""

from rest_framework import viewsets, mixins, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import HttpResponse
import io
import csv
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db import models
import logging

from backend.core.feature_flags import check_feature_flag, feature_flag_required, FeatureFlagService
from .models import (
    KixikilaGroup,
    KixikilaMembership,
    KixikilaContribution,
    KixikilaPayout,
    KixikilaRating,
)
from .serializers import (
    KixikilaGroupSerializer,
    KixikilaGroupCreateUpdateSerializer,
    KixikilaMembershipSerializer,
    KixikilaContributionSerializer,
    KixikilaPayoutSerializer,
    # KixikilaRatingSerializer temporarily removed - pending feature completion
)

logger = logging.getLogger(__name__)
User = get_user_model()


class KixikilaStatusView(APIView):
    """Returns kixikila feature flag status for quick health checks."""

    permission_classes = []  # allow anonymous health checks

    def get(self, request, *args, **kwargs):
        enabled = FeatureFlagService.is_enabled("kixikila", user=request.user)
        return Response({
            "feature": "kixikila",
            "enabled": enabled,
        })


@feature_flag_required("kixikila")
class KixikilaGroupViewSet(viewsets.ModelViewSet):
    queryset = KixikilaGroup.objects.select_related("created_by")
    serializer_class = KixikilaGroupSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ["group_type", "status", "province", "municipality"]
    search_fields = ["name", "description"]
    ordering_fields = ["created_at", "current_members", "status"]

    @action(detail=True, methods=["get"], url_path="stats")
    def stats(self, request, pk=None):
        """Return aggregated stats for a group: cash, active members, next cycle amount, participation rate."""
        try:
            group = self.get_object()
            memberships = KixikilaMembership.objects.filter(group=group, is_active=True)
            member_ids = list(memberships.values_list("id", flat=True))
            contribs = KixikilaContribution.objects.filter(membership_id__in=member_ids)

            total_cash = 0
            confirmed_count = 0
            for c in contribs:
                if c.status == "confirmed":
                    total_cash += float(c.amount)
                    confirmed_count += 1
            total_count = contribs.count() or 1
            participation_rate = round((confirmed_count / total_count) * 100, 2)

            return Response({
                "cash": total_cash,
                "active": memberships.count(),
                "next": float(group.monthly_contribution),
                "participation_rate": participation_rate,
            })
        except Exception as e:
            logger.error(f"Error computing stats for group {pk}: {e}", exc_info=True)
            return Response({"detail": "Could not compute stats"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated], url_path="contributions_export")
    def contributions_export(self, request, pk=None):
        """Export all group contributions as CSV (group owner or staff)."""
        group = self.get_object()
        if not (request.user.is_staff or group.created_by_id == request.user.id):
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        memberships = KixikilaMembership.objects.filter(group=group)
        contributions = KixikilaContribution.objects.filter(
            membership__in=memberships
        ).select_related('membership__member').order_by('-payment_date')

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["id", "member", "round", "amount", "status", "payment_method", "payment_date"])
        for c in contributions:
            writer.writerow([
                c.id,
                c.membership.member.username,
                c.round,
                f"{c.amount}",
                c.status,
                c.payment_method,
                c.payment_date.isoformat(),
            ])

        response = HttpResponse(output.getvalue(), content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="kixikila_group_{group.id}_contributions.csv"'
        return response

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def suspend_member(self, request, pk=None):
        """Suspend a group member (make inactive). Only staff or group owner."""
        group = self.get_object()
        if not (request.user.is_staff or group.created_by_id == request.user.id):
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        membership_id = request.data.get("membership_id")
        if not membership_id:
            return Response({"detail": "membership_id é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            membership = KixikilaMembership.objects.get(id=membership_id, group=group)
            membership.is_active = False
            membership.save(update_fields=["is_active"])
            return Response({"id": membership.id, "is_active": membership.is_active})
        except KixikilaMembership.DoesNotExist:
            return Response({"detail": "Membership não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def reactivate_member(self, request, pk=None):
        """Reactivate a suspended member. Only staff or group owner."""
        group = self.get_object()
        if not (request.user.is_staff or group.created_by_id == request.user.id):
            return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)

        membership_id = request.data.get("membership_id")
        if not membership_id:
            return Response({"detail": "membership_id é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            membership = KixikilaMembership.objects.get(id=membership_id, group=group)
            membership.is_active = True
            membership.save(update_fields=["is_active"])
            return Response({"id": membership.id, "is_active": membership.is_active})
        except KixikilaMembership.DoesNotExist:
            return Response({"detail": "Membership não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["get"], url_path="analytics")
    def analytics(self, request, pk=None):
        """Return analytics for a group: participation trends, contribution patterns, member statistics."""
        try:
            group = self.get_object()
            
            # Member statistics
            total_members = KixikilaMembership.objects.filter(group=group).count()
            active_members = KixikilaMembership.objects.filter(group=group, is_active=True).count()
            inactive_members = total_members - active_members
            
            # Contribution statistics
            all_contributions = KixikilaContribution.objects.filter(membership__group=group)
            confirmed_contributions = all_contributions.filter(status='confirmed').count()
            pending_contributions = all_contributions.filter(status='pending').count()
            late_contributions = all_contributions.filter(status='late').count()
            
            # Financial metrics
            total_amount = sum(float(c.amount) for c in all_contributions)
            average_contribution = total_amount / all_contributions.count() if all_contributions.count() > 0 else 0
            
            # Payout statistics
            payouts = KixikilaPayout.objects.filter(group=group)
            completed_payouts = payouts.filter(status='completed').count()
            pending_payouts = payouts.filter(status__in=['scheduled', 'processing']).count()
            
            # Participation rate by round
            rounds_data = []
            for round_num in range(1, group.current_round + 1):
                round_contribs = all_contributions.filter(round=round_num)
                round_confirmed = round_contribs.filter(status='confirmed').count()
                round_participation = (round_confirmed / active_members * 100) if active_members > 0 else 0
                rounds_data.append({
                    'round': round_num,
                    'total_contributions': round_contribs.count(),
                    'confirmed': round_confirmed,
                    'participation_rate': round(round_participation, 2)
                })
            
            return Response({
                'group_id': group.id,
                'group_name': group.name,
                'members': {
                    'total': total_members,
                    'active': active_members,
                    'inactive': inactive_members,
                },
                'contributions': {
                    'total_count': all_contributions.count(),
                    'confirmed': confirmed_contributions,
                    'pending': pending_contributions,
                    'late': late_contributions,
                    'total_amount': float(total_amount),
                    'average': float(average_contribution),
                },
                'payouts': {
                    'total_count': payouts.count(),
                    'completed': completed_payouts,
                    'pending': pending_payouts,
                    'total_disbursed': float(sum(float(p.net_amount) for p in payouts.filter(status='completed'))),
                },
                'rounds': rounds_data,
                'current_round': group.current_round,
                'total_rounds': group.duration_months,
            })
        except Exception as e:
            logger.error(f"Error computing analytics for group {pk}: {e}", exc_info=True)
            return Response({"detail": "Could not compute analytics"}, status=status.HTTP_400_BAD_REQUEST)
        """Return cycle info: current round, next beneficiary, scheduled payouts."""
        try:
            group = self.get_object()
            
            # Get next scheduled payout (upcoming beneficiary)
            next_payout = KixikilaPayout.objects.filter(
                group=group,
                status__in=['scheduled', 'processing']
            ).order_by('scheduled_date').first()
            
            next_beneficiary = None
            if next_payout:
                next_beneficiary = {
                    'id': next_payout.recipient.id,
                    'username': next_payout.recipient.username,
                    'scheduled_date': next_payout.scheduled_date.isoformat(),
                    'amount': float(next_payout.total_amount),
                    'round': next_payout.round,
                }
            
            # Get pending contributions for current round
            current_round_contribs = KixikilaContribution.objects.filter(
                membership__group=group,
                round=group.current_round
            ).aggregate(
                total=models.Sum('amount'),
                confirmed=models.Count('id', filter=models.Q(status='confirmed')),
                pending=models.Count('id', filter=models.Q(status='pending')),
                late=models.Count('id', filter=models.Q(status='late')),
            )
            
            return Response({
                'current_round': group.current_round,
                'total_rounds': group.duration_months,
                'status': group.status,
                'next_beneficiary': next_beneficiary,
                'current_round_contributions': {
                    'total_amount': float(current_round_contribs.get('total') or 0),
                    'confirmed': current_round_contribs.get('confirmed', 0),
                    'pending': current_round_contribs.get('pending', 0),
                    'late': current_round_contribs.get('late', 0),
                }
            })
        except Exception as e:
            logger.error(f"Error computing cycles for group {pk}: {e}", exc_info=True)
            return Response({"detail": "Could not compute cycles"}, status=status.HTTP_400_BAD_REQUEST)

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return KixikilaGroupCreateUpdateSerializer
        return KixikilaGroupSerializer

    def get_permissions(self):
        from backend.core.rbac_permissions import CanCreateKixikila
        if self.action == "create":
            return [CanCreateKixikila()]
        if self.action in ["update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def join(self, request, pk=None):
        """Unirse a um grupo kixikila."""
        group = self.get_object()
        
        if group.current_members >= group.max_members:
            logger.warning(f"User {request.user} tried to join full group {group.id}")
            return Response(
                {"error": "Grupo cheio, não pode aderir"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            membership, created = KixikilaMembership.objects.get_or_create(
                group=group,
                member=request.user,
                defaults={
                    "position": group.current_members + 1,
                    "position_priority": "random",
                    "is_active": True,
                    "contributions_made": 0,
                    "payout_received": False,
                }
            )
            logger.info(f"User {request.user} joined group {group.id}. Created: {created}")
        except Exception as e:
            logger.error(f"Error joining group {group.id}: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Erro ao aderir ao grupo: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not created:
            logger.info(f"User {request.user} already member of group {group.id}")
            return Response(
                {"detail": "Você já é membro deste grupo"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        group.current_members += 1
        group.save()
        logger.info(f"Group {group.id} now has {group.current_members} members")
        
        return Response(
            KixikilaMembershipSerializer(membership).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def membership(self, request, pk=None):
        """Check if user is member of this group and get their membership info."""
        group = self.get_object()
        try:
            membership = KixikilaMembership.objects.get(group=group, member=request.user)
            logger.info(f"User {request.user} is member of group {group.id}")
            return Response(
                {
                    "is_member": True,
                    "membership": KixikilaMembershipSerializer(membership).data
                },
                status=status.HTTP_200_OK
            )
        except KixikilaMembership.DoesNotExist:
            logger.info(f"User {request.user} is NOT member of group {group.id}")
            return Response(
                {"is_member": False},
                status=status.HTTP_200_OK
            )

    @action(detail=True, methods=["get"], permission_classes=[permissions.AllowAny])
    def members(self, request, pk=None):
        """Get all members of a group."""
        group = self.get_object()
        try:
            memberships = KixikilaMembership.objects.filter(
                group=group, is_active=True
            ).select_related('member')
            
            serializer = KixikilaMembershipSerializer(memberships, many=True)
            return Response(
                {
                    "count": memberships.count(),
                    "results": serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Error fetching members for group {pk}: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=["get"], permission_classes=[permissions.AllowAny])
    def contributions(self, request, pk=None):
        """Get all contributions for a group."""
        group = self.get_object()
        try:
            # Get all contributions from members in this group
            memberships = KixikilaMembership.objects.filter(group=group)
            contributions = KixikilaContribution.objects.filter(
                membership__in=memberships
            ).select_related('membership__member').order_by('-payment_date')
            
            serializer = KixikilaContributionSerializer(contributions, many=True)
            return Response(
                {
                    "count": contributions.count(),
                    "results": serializer.data
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Error fetching contributions for group {pk}: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def my_groups(self, request, pk=None):
        """Listar grupos aos quais o user participa."""
        memberships = request.user.kixikila_memberships.filter(is_active=True).select_related("group")
        groups = [m.group for m in memberships]
        serializer = KixikilaGroupSerializer(groups, many=True)
        return Response(serializer.data)


@feature_flag_required("kixikila")
class KixikilaMembershipViewSet(mixins.ListModelMixin,
                                mixins.RetrieveModelMixin,
                                viewsets.GenericViewSet):
    queryset = KixikilaMembership.objects.select_related("group", "member")
    serializer_class = KixikilaMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["group", "is_active"]

    def get_queryset(self):
        # Users can only see their own memberships (unless staff)
        qs = super().get_queryset()
        if not self.request.user.is_staff:
            qs = qs.filter(member=self.request.user)
        return qs


@feature_flag_required("kixikila")
@feature_flag_required("kixikila")
class KixikilaContributionViewSet(mixins.ListModelMixin,
                                  mixins.RetrieveModelMixin,
                                  mixins.CreateModelMixin,
                                  viewsets.GenericViewSet):
    queryset = KixikilaContribution.objects.select_related("membership__group", "membership__member")
    serializer_class = KixikilaContributionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "round", "membership__group"]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(membership__member=self.request.user)

    def perform_create(self, serializer):
        """Create contribution and update membership stats."""
        try:
            # Get the validated data
            validated_data = serializer.validated_data
            membership_id = validated_data.get('membership_id')
            
            logger.info(f"Creating contribution. Request data: {self.request.data}, Validated: {validated_data}")
            
            # Get the membership
            membership = KixikilaMembership.objects.get(
                id=membership_id, 
                member=self.request.user
            )

            # Business guard: block inactive memberships with a clear message
            if not getattr(membership, 'is_active', True):
                raise serializers.ValidationError({
                    "detail": "A sua adesão a este grupo está suspensa. Contacte o administrador do grupo."
                })
            
            # Calculate round: current round + 1 (or 1 if first)
            last_contribution = KixikilaContribution.objects.filter(
                membership=membership
            ).order_by('-round').first()
            current_round = (last_contribution.round + 1) if last_contribution else 1
            
            logger.info(f"Saving contribution for membership {membership_id} with round {current_round}")
            
            # Save with all required fields
            contribution = serializer.save(
                membership=membership,
                round=current_round,
                status='pending'
            )
            
            # Update membership stats
            membership.contributions_made += 1
            membership.save()
            
            logger.info(f"Contribution {contribution.id} created successfully for membership {membership_id}")
            
        except KixikilaMembership.DoesNotExist as e:
            membership_id = self.request.data.get('membership_id')
            logger.error(f"Membership {membership_id} not found for user {self.request.user}: {str(e)}")
            raise serializers.ValidationError(f"Membership with id {membership_id} not found")
        except serializers.ValidationError:
            raise
        except Exception as e:
            logger.error(f"Error creating contribution: {str(e)}", exc_info=True)
            raise serializers.ValidationError(f"Error creating contribution: {str(e)}")

    @action(detail=False, methods=["get"], url_path="my_reputation")
    def my_reputation(self, request):
        """Compute a simple reputation score for the authenticated user based on contributions."""
        user = request.user
        if not user or not user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        qs = KixikilaContribution.objects.filter(membership__member=user)
        total = qs.count()
        confirmed = qs.filter(status="confirmed").count()
        late = qs.filter(status="late").count()
        missed = qs.filter(status="missed").count()

        # Simple scoring: base 50, +50 * on-time ratio, -10 per missed (min 0, max 100)
        score = 50
        if total:
            score += int(50 * (confirmed / total))
        score -= 10 * missed
        score = max(0, min(100, score))

        if score >= 85:
            trust = "champion"
        elif score >= 70:
            trust = "trusted"
        elif score >= 55:
            trust = "reliable"
        else:
            trust = "beginner"

        groups_participated = request.user.kixikila_memberships.values("group").distinct().count()

        return Response({
            "username": user.username,
            "groups_participated": groups_participated,
            "contributions_on_time": confirmed,
            "contributions_late": late,
            "contributions_missed": missed,
            "reputation_score": score,
            "trust_level": trust,
        })

    @action(detail=True, methods=["post"], url_path="confirm")
    def confirm(self, request, pk=None):
        """Confirm a pending contribution (admin or owner action)."""
        try:
            contrib = self.get_object()
            # Only allow the membership member or staff to confirm
            if not (request.user.is_staff or request.user == contrib.membership.member):
                return Response({"detail": "Not allowed"}, status=status.HTTP_403_FORBIDDEN)
            contrib.status = "confirmed"
            contrib.save()
            return Response({"id": contrib.id, "status": contrib.status})
        except Exception as e:
            logger.error(f"Error confirming contribution {pk}: {e}", exc_info=True)
            return Response({"detail": "Could not confirm"}, status=status.HTTP_400_BAD_REQUEST)


@feature_flag_required("kixikila")
class KixikilaPayoutViewSet(mixins.ListModelMixin,
                            mixins.RetrieveModelMixin,
                            mixins.CreateModelMixin,
                            viewsets.GenericViewSet):
    queryset = KixikilaPayout.objects.select_related("group", "recipient")
    serializer_class = KixikilaPayoutSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "group"]

    def get_queryset(self):
        qs = super().get_queryset()
        # Staff pode ver todos, usuários normais só os seus
        if self.request.user.is_staff:
            return qs
        return qs.filter(recipient=self.request.user)

    def get_permissions(self):
        """Apenas staff pode criar payouts."""
        if self.action == "create":
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def process(self, request, pk=None):
        """Processar um payout agendado (admin only)."""
        payout = self.get_object()
        
        try:
            # Validar elegibilidade
            if not payout.is_eligible:
                return Response(
                    {"error": "Payout não está elegível para processamento"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not payout.can_be_disbursed:
                return Response(
                    {"error": "Nem todas as contribuições da ronda foram confirmadas"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            payout.mark_as_processing()
            logger.info(f"Payout {payout.id} marked as processing by {request.user}")
            
            return Response(
                KixikilaPayoutSerializer(payout).data,
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Error processing payout {pk}: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def complete(self, request, pk=None):
        """Marcar payout como concluído após desembolso (admin only)."""
        payout = self.get_object()
        payment_method = request.data.get("payment_method", "")
        
        try:
            payout.mark_as_completed(payment_method)
            logger.info(f"Payout {payout.id} completed by {request.user} via {payment_method}")
            
            return Response(
                KixikilaPayoutSerializer(payout).data,
                status=status.HTTP_200_OK
            )
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error completing payout {pk}: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def fail(self, request, pk=None):
        """Marcar payout como falhou (admin only)."""
        payout = self.get_object()
        reason = request.data.get("reason", "")
        
        try:
            payout.mark_as_failed(reason)
            logger.warning(f"Payout {payout.id} marked as failed by {request.user}: {reason}")
            
            return Response(
                KixikilaPayoutSerializer(payout).data,
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Error failing payout {pk}: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def create_for_round(self, request):
        """Criar payout para uma ronda específica de um grupo."""
        group_id = request.data.get("group_id")
        round_number = request.data.get("round")
        recipient_id = request.data.get("recipient_id")
        
        if not all([group_id, round_number, recipient_id]):
            return Response(
                {"error": "group_id, round e recipient_id são obrigatórios"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # User model already imported at module level
            
            group = KixikilaGroup.objects.get(id=group_id)
            recipient = User.objects.get(id=recipient_id)
            
            # Validar que recipient é membro ativo
            membership = KixikilaMembership.objects.filter(
                group=group, member=recipient, is_active=True
            ).first()
            
            if not membership:
                return Response(
                    {"error": "Recipient não é membro ativo do grupo"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar se já existe payout para esta ronda
            existing = KixikilaPayout.objects.filter(group=group, round=round_number).first()
            if existing:
                return Response(
                    {"error": f"Já existe payout para round {round_number}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Calcular total de contribuições confirmadas da ronda
            contributions = KixikilaContribution.objects.filter(
                membership__group=group,
                round=round_number,
                status="confirmed"
            )
            
            total_amount = sum(float(c.amount) for c in contributions)
            
            if total_amount <= 0:
                return Response(
                    {"error": "Não há contribuições confirmadas para esta ronda"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Calcular taxa da plataforma (exemplo: 2.5%)
            platform_fee_rate = 0.025
            platform_fee = total_amount * platform_fee_rate
            net_amount = total_amount - platform_fee
            
            # Criar payout
            payout = KixikilaPayout.objects.create(
                group=group,
                recipient=recipient,
                round=round_number,
                total_amount=total_amount,
                platform_fee=platform_fee,
                net_amount=net_amount,
                scheduled_date=timezone.now().date(),
                payment_method=request.data.get("payment_method", "transfer"),
                status="scheduled"
            )
            
            logger.info(f"Payout created for group {group.id}, round {round_number}, recipient {recipient.id}")
            
            return Response(
                KixikilaPayoutSerializer(payout).data,
                status=status.HTTP_201_CREATED
            )
            
        except KixikilaGroup.DoesNotExist:
            return Response(
                {"error": "Grupo não encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        except User.DoesNotExist:
            return Response(
                {"error": "Recipient não encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error creating payout: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@feature_flag_required("kixikila")
class KixikilaLeaderboardViewSet(viewsets.ViewSet):
    """Leaderboard for Kixikila members by reputation score."""
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=["get"], url_path="reputation")
    def reputation_leaderboard(self, request):
        """Get leaderboard of top members by reputation score."""
        try:
            limit = int(request.query_params.get('limit', 50))
            
            # Get all users with their reputation computed
            members = KixikilaMembership.objects.select_related('member').filter(
                is_active=True
            ).values('member_id', 'member__username', 'member__email')
            
            leaderboard = []
            for membership in members:
                user_id = membership['member_id']
                
                # Calculate reputation
                confirmed = KixikilaContribution.objects.filter(
                    membership__member_id=user_id,
                    status='confirmed'
                ).count()
                
                late = KixikilaContribution.objects.filter(
                    membership__member_id=user_id,
                    status='late'
                ).count()
                
                missed = KixikilaContribution.objects.filter(
                    membership__member_id=user_id,
                    status='missed'
                ).count()
                
                # Score calculation
                score = 50 + (confirmed * 5) - (late * 10) - (missed * 20)
                score = max(0, min(100, score))
                
                if score >= 85:
                    trust = 'champion'
                elif score >= 70:
                    trust = 'trusted'
                elif score >= 55:
                    trust = 'reliable'
                else:
                    trust = 'beginner'
                
                groups_count = KixikilaMembership.objects.filter(
                    member_id=user_id
                ).count()
                
                leaderboard.append({
                    'member_id': user_id,
                    'username': membership['member__username'],
                    'reputation_score': score,
                    'trust_level': trust,
                    'contributions_confirmed': confirmed,
                    'contributions_late': late,
                    'contributions_missed': missed,
                    'groups_participated': groups_count,
                })
            
            # Sort by reputation score (descending)
            leaderboard = sorted(leaderboard, key=lambda x: x['reputation_score'], reverse=True)
            
            # Add ranking
            for idx, member in enumerate(leaderboard[:limit], 1):
                member['rank'] = idx
            
            return Response({
                'leaderboard': leaderboard[:limit],
                'total_members': len(leaderboard),
            })
        except Exception as e:
            logger.error(f"Error computing reputation leaderboard: {e}", exc_info=True)
            return Response({"detail": "Could not compute leaderboard"}, status=status.HTTP_400_BAD_REQUEST)
    ordering_fields = ["reputation_score", "groups_participated"]

    def get_queryset(self):
        # Return empty queryset - feature disabled
        return KixikilaRating.objects.none()
