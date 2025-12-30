"""
Views for Kixikila integration with Participants
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Q, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Participant
from backend.kixikila.models import KixikilaGroup, KixikilaMembership, KixikilaContribution, KixikilaPayout
from .serializers_kixikila import (
    KixikilaFundingDashboardSerializer,
    ParticipantWithKixikilaSerializer,
    KixikilaGroupWithMembersSerializer
)


class ParticipantFundingViewSet(viewsets.ViewSet):
    """API endpoints for participant Kixikila funding integration"""
    
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='my-funding')
    def my_funding(self, request):
        """Get current user's funding dashboard"""
        try:
            participant = Participant.objects.get(user=request.user)
            serializer = KixikilaFundingDashboardSerializer(participant)
            return Response(serializer.data)
        except Participant.DoesNotExist:
            # Return an empty dashboard instead of 404 to avoid breaking the UI
            empty_dashboard = {
                'total_raised': 0,
                'total_contributed': 0,
                'active_group_id': None,
                'active_group_name': None,
                'next_payout_date': None,
                'next_payout_amount': None,
                'reputation_score': 50,  # neutral baseline
                'groups_count': 0,
                'has_participant': False,
                'message': 'User is not a participant; showing empty dashboard'
            }
            return Response(empty_dashboard, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='funding-leaderboard')
    def funding_leaderboard(self, request):
        """Get leaderboard of participants by total funding raised"""
        participants = Participant.objects.filter(
            user__participant_profile__isnull=False,
            status__in=['active', 'winner']
        ).annotate(
            total_raised=Sum('user__received_payouts__net_amount', 
                           filter=Q(user__received_payouts__status='completed'))
        ).order_by('-total_raised')[:20]
        
        data = []
        for participant in participants:
            serializer = KixikilaFundingDashboardSerializer(participant)
            data.append({
                'rank': len(data) + 1,
                'participant_id': participant.id,
                'business_name': participant.business_name,
                **serializer.data
            })
        
        return Response(data)

    @action(detail=False, methods=['get'], url_path='kixikila-groups')
    def my_kixikila_groups(self, request):
        """Get all Kixikila groups for current user"""
        memberships = KixikilaMembership.objects.filter(
            member=request.user
        ).select_related('group')
        
        groups_data = []
        for membership in memberships:
            groups_data.append({
                'group_id': membership.group.id,
                'group_name': membership.group.name,
                'group_type': membership.group.group_type,
                'position': membership.position,
                'status': membership.group.status,
                'is_active': membership.is_active,
                'contributions_made': membership.contributions_made,
                'payout_received': membership.payout_received,
                'payout_date': membership.payout_date,
            })
        
        return Response(groups_data)

    @action(detail=False, methods=['post'], url_path='create-group')
    def create_kixikila_group(self, request):
        """Create a new Kixikila group as initiator"""
        try:
            participant = Participant.objects.get(user=request.user)
            
            # Validate participant is eligible
            if participant.status not in ['approved', 'active', 'winner']:
                return Response(
                    {'error': f'Participant status "{participant.status}" not eligible for group creation'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create group
            group_data = {
                'name': request.data.get('name', f'{participant.business_name} - Kixikila'),
                'group_type': request.data.get('group_type', 'business'),
                'monthly_contribution': request.data.get('monthly_contribution', 5000),
                'max_members': request.data.get('max_members', 10),
                'duration_months': request.data.get('duration_months', 10),
                'start_date': timezone.now().date(),
                'created_by': request.user,
                'province': participant.user.profile.province if hasattr(participant.user, 'profile') else '',
            }
            
            group = KixikilaGroup.objects.create(**group_data)
            
            # Add creator as first member
            membership = KixikilaMembership.objects.create(
                group=group,
                member=request.user,
                position=1
            )
            
            # Set as primary group
            participant.primary_savings_group = group
            participant.save()
            
            serializer = KixikilaGroupWithMembersSerializer(group)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Participant.DoesNotExist:
            return Response(
                {'error': 'User is not a participant'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'], url_path='join-group/<int:group_id>')
    def join_kixikila_group(self, request, group_id=None):
        """Join an existing Kixikila group"""
        group = get_object_or_404(KixikilaGroup, id=group_id)
        
        try:
            participant = Participant.objects.get(user=request.user)
            
            # Validate eligibility
            if participant.status not in ['approved', 'active', 'winner']:
                return Response(
                    {'error': f'Participant status not eligible'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not request.user.is_verified:
                return Response(
                    {'error': 'User must be verified to join'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if already member
            if KixikilaMembership.objects.filter(group=group, member=request.user).exists():
                return Response(
                    {'error': 'Already a member of this group'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check capacity
            if group.current_members >= group.max_members:
                return Response(
                    {'error': 'Group is full'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create membership
            next_position = group.current_members + 1
            membership = KixikilaMembership.objects.create(
                group=group,
                member=request.user,
                position=next_position
            )
            
            group.current_members = next_position
            group.save()
            
            # Set as primary if not already set
            if not participant.primary_savings_group:
                participant.primary_savings_group = group
                participant.save()
            
            return Response(
                {'message': f'Successfully joined group {group.name}'},
                status=status.HTTP_201_CREATED
            )
            
        except Participant.DoesNotExist:
            return Response(
                {'error': 'User is not a participant'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'], url_path='leave-group/<int:group_id>')
    def leave_kixikila_group(self, request, group_id=None):
        """Leave a Kixikila group (with penalties if not completed)"""
        group = get_object_or_404(KixikilaGroup, id=group_id)
        
        try:
            membership = KixikilaMembership.objects.get(group=group, member=request.user)
            
            # Check if can leave (penalties apply if group not completed)
            if group.status != 'completed':
                # Log penalty to reputation system
                # TODO: Implement reputation penalties
                pass
            
            membership.is_active = False
            membership.save()
            
            # Decrement group member count
            group.current_members = max(0, group.current_members - 1)
            group.save()
            
            # Unset as primary if this is the primary group
            participant = Participant.objects.get(user=request.user)
            if participant.primary_savings_group == group:
                participant.primary_savings_group = None
                participant.save()
            
            return Response({'message': f'Left group {group.name}'})
            
        except KixikilaMembership.DoesNotExist:
            return Response(
                {'error': 'Not a member of this group'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Participant.DoesNotExist:
            return Response(
                {'error': 'User is not a participant'},
                status=status.HTTP_404_NOT_FOUND
            )
