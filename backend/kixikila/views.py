"""Marketplace API views (versão inicial)."""

from rest_framework import viewsets, mixins, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

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
    KixikilaRatingSerializer,
)


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

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return KixikilaGroupCreateUpdateSerializer
        return KixikilaGroupSerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def join(self, request, pk=None):
        """Unirse a um grupo kixikila."""
        group = self.get_object()
        
        if group.current_members >= group.max_members:
            return Response(
                {"error": "Grupo cheio, não pode aderir"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        membership, created = KixikilaMembership.objects.get_or_create(
            group=group,
            member=request.user,
            defaults={"position": group.current_members + 1, "position_priority": "random"}
        )
        
        if not created:
            return Response(
                {"error": "Já é membro deste grupo"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        group.current_members += 1
        group.save()
        
        return Response(
            KixikilaMembershipSerializer(membership).data,
            status=status.HTTP_201_CREATED
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
class KixikilaContributionViewSet(mixins.ListModelMixin,
                                  mixins.RetrieveModelMixin,
                                  viewsets.GenericViewSet):
    queryset = KixikilaContribution.objects.select_related("membership")
    serializer_class = KixikilaContributionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "round"]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(membership__member=self.request.user)


@feature_flag_required("kixikila")
class KixikilaPayoutViewSet(mixins.ListModelMixin,
                            mixins.RetrieveModelMixin,
                            viewsets.GenericViewSet):
    queryset = KixikilaPayout.objects.select_related("group", "recipient")
    serializer_class = KixikilaPayoutSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["status", "group"]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(recipient=self.request.user)


@feature_flag_required("kixikila")
class KixikilaRatingViewSet(mixins.ListModelMixin,
                            mixins.RetrieveModelMixin,
                            viewsets.GenericViewSet):
    queryset = KixikilaRating.objects.all()
    serializer_class = KixikilaRatingSerializer
    permission_classes = [permissions.AllowAny]
    ordering_fields = ["reputation_score", "groups_participated"]
