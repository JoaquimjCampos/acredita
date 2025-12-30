"""
Serializers for Kixikila integration with Participants
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import models
from .models import Participant
from backend.kixikila.models import KixikilaGroup, KixikilaMembership, KixikilaContribution, KixikilaPayout

User = get_user_model()


class KixikilaFundingDashboardSerializer(serializers.Serializer):
    """Dashboard overview of participant's Kixikila funding"""
    
    total_raised = serializers.SerializerMethodField()
    total_contributed = serializers.SerializerMethodField()
    active_group_id = serializers.SerializerMethodField()
    active_group_name = serializers.SerializerMethodField()
    next_payout_date = serializers.SerializerMethodField()
    next_payout_amount = serializers.SerializerMethodField()
    reputation_score = serializers.SerializerMethodField()
    groups_count = serializers.SerializerMethodField()
    
    def get_total_raised(self, obj):
        """Total amount received from all Kixikila groups"""
        payouts = KixikilaPayout.objects.filter(
            recipient=obj.user,
            status='completed'
        )
        total = sum(float(p.net_amount) for p in payouts)
        return round(total, 2)
    
    def get_total_contributed(self, obj):
        """Total amount contributed to all groups"""
        contributions = KixikilaContribution.objects.filter(
            membership__member=obj.user,
            status='confirmed'
        )
        total = sum(float(c.amount) for c in contributions)
        return round(total, 2)
    
    def get_active_group_id(self, obj):
        """Primary savings group ID"""
        if obj.primary_savings_group:
            return obj.primary_savings_group.id
        return None
    
    def get_active_group_name(self, obj):
        """Primary savings group name"""
        if obj.primary_savings_group:
            return obj.primary_savings_group.name
        return None
    
    def get_next_payout_date(self, obj):
        """Next payout date if in active group"""
        if not obj.primary_savings_group:
            return None
        
        try:
            membership = KixikilaMembership.objects.get(
                group=obj.primary_savings_group,
                member=obj.user,
                is_active=True
            )
            # Simplified calculation; adjust based on your payout schedule
            return None  # Would calculate based on rounds and position
        except KixikilaMembership.DoesNotExist:
            return None
    
    def get_next_payout_amount(self, obj):
        """Expected next payout amount"""
        if not obj.primary_savings_group:
            return None
        
        group = obj.primary_savings_group
        expected = float(group.monthly_contribution) * group.current_members * 0.975  # 2.5% fee
        return round(expected, 2)
    
    def get_reputation_score(self, obj):
        """Calculate Kixikila reputation score"""
        base = 50
        
        # Confirmed contributions: +5 each
        confirmed = KixikilaContribution.objects.filter(
            membership__member=obj.user,
            status='confirmed'
        ).count()
        base += confirmed * 5
        
        # Confirmed payouts: +25 each
        payouts = KixikilaPayout.objects.filter(
            recipient=obj.user,
            status='completed'
        ).count()
        base += payouts * 25
        
        # Pending/late contributions: -20 each
        late = KixikilaContribution.objects.filter(
            membership__member=obj.user,
            status='pending',
            payment_date__lt=timezone.now() - timezone.timedelta(days=7)
        ).count()
        base -= late * 20
        
        return max(0, min(100, base))  # Clamp 0-100
    
    def get_groups_count(self, obj):
        """Number of active Kixikila groups"""
        return KixikilaMembership.objects.filter(
            member=obj.user,
            is_active=True
        ).count()


class ParticipantKixikilaInfoSerializer(serializers.ModelSerializer):
    """Minimal Kixikila info embedded in Participant profile"""
    
    primary_group_name = serializers.CharField(source='primary_savings_group.name', read_only=True)
    primary_group_id = serializers.IntegerField(source='primary_savings_group.id', read_only=True)
    
    class Meta:
        model = Participant
        fields = ['primary_group_name', 'primary_group_id']


class ParticipantWithKixikilaSerializer(serializers.ModelSerializer):
    """Participant with full Kixikila integration info"""
    
    kixikila_funding = serializers.SerializerMethodField()
    
    class Meta:
        model = Participant
        fields = ['id', 'user', 'business_name', 'status', 'kixikila_funding']
    
    def get_kixikila_funding(self, obj):
        """Embed full funding dashboard"""
        serializer = KixikilaFundingDashboardSerializer(obj)
        return serializer.data


class KixikilaGroupWithMembersSerializer(serializers.ModelSerializer):
    """Group detail with member list and their funding info"""
    
    members = serializers.SerializerMethodField()
    total_raised_by_group = serializers.SerializerMethodField()
    
    class Meta:
        model = KixikilaGroup
        fields = ['id', 'name', 'group_type', 'monthly_contribution', 'current_round', 'status', 'members', 'total_raised_by_group']
    
    def get_members(self, obj):
        """List members with their Acredita participant info"""
        memberships = KixikilaMembership.objects.filter(group=obj).select_related('member__participant_profile')
        
        data = []
        for membership in memberships:
            try:
                participant = Participant.objects.get(user=membership.member)
                data.append({
                    'member_id': membership.member.id,
                    'username': membership.member.username,
                    'position': membership.position,
                    'business_name': participant.business_name,
                    'total_contributed': participant.kixikila_memberships.filter(
                        membership__status='confirmed'
                    ).aggregate(total=models.Sum('amount'))['total'] or 0,
                })
            except Participant.DoesNotExist:
                # Member not a participant
                data.append({
                    'member_id': membership.member.id,
                    'username': membership.member.username,
                    'position': membership.position,
                    'business_name': None,
                })
        
        return data
    
    def get_total_raised_by_group(self, obj):
        """Total amount disbursed by this group"""
        payouts = KixikilaPayout.objects.filter(
            payout_group=obj,  # Assuming this relationship exists
            status='completed'
        )
        total = sum(float(p.net_amount) for p in payouts)
        return round(total, 2)
