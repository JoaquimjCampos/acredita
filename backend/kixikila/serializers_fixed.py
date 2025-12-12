"""Serializers para Kixikila (versão inicial)."""

from rest_framework import serializers

from .models import (
    KixikilaGroup,
    KixikilaMembership,
    KixikilaContribution,
    KixikilaPayout,
    KixikilaRating,
)


class KixikilaGroupSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source="created_by.username", read_only=True)
    members_count = serializers.SerializerMethodField()

    class Meta:
        model = KixikilaGroup
        fields = [
            "id",
            "name",
            "group_type",
            "description",
            "monthly_contribution",
            "max_members",
            "members_count",
            "duration_months",
            "start_date",
            "current_round",
            "status",
            "province",
            "municipality",
            "created_by_username",
            "created_at",
        ]

    def get_members_count(self, obj):
        return obj.memberships.filter(is_active=True).count()


class KixikilaGroupCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = KixikilaGroup
        fields = [
            "name",
            "group_type",
            "description",
            "monthly_contribution",
            "max_members",
            "duration_months",
            "start_date",
            "requires_verification",
            "insurance_enabled",
            "province",
            "municipality",
        ]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class KixikilaMembershipSerializer(serializers.ModelSerializer):
    member_username = serializers.CharField(source="member.username", read_only=True)
    group_name = serializers.CharField(source="group.name", read_only=True)

    class Meta:
        model = KixikilaMembership
        fields = [
            "id",
            "group",
            "group_name",
            "member",
            "member_username",
            "position",
            "position_priority",
            "is_active",
            "contributions_made",
            "payout_received",
            "payout_date",
            "joined_at",
        ]


class KixikilaContributionSerializer(serializers.ModelSerializer):
    member_username = serializers.CharField(source="membership.member.username", read_only=True)
    membership_id = serializers.IntegerField(write_only=True, required=True)

    class Meta:
        model = KixikilaContribution
        fields = [
            "id",
            "membership",
            "membership_id",
            "member_username",
            "round",
            "amount",
            "status",
            "payment_method",
            "payment_date",
        ]
        read_only_fields = ["id", "member_username", "round", "status", "payment_date"]
        extra_kwargs = {
            "membership": {"required": False},
        }

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value

    def validate_payment_method(self, value):
        valid_methods = ['transfer', 'cash', 'card']
        if value not in valid_methods:
            raise serializers.ValidationError(f"Payment method must be one of: {', '.join(valid_methods)}")
        return value


class KixikilaPayoutSerializer(serializers.ModelSerializer):
    recipient_username = serializers.CharField(source="recipient.username", read_only=True)
    group_name = serializers.CharField(source="group.name", read_only=True)

    class Meta:
        model = KixikilaPayout
        fields = [
            "id",
            "group",
            "group_name",
            "recipient",
            "recipient_username",
            "round",
            "total_amount",
            "platform_fee",
            "net_amount",
            "status",
            "scheduled_date",
            "disbursed_at",
            "intended_use",
        ]


class KixikilaRatingSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = KixikilaRating
        fields = [
            "id",
            "username",
            "groups_participated",
            "contributions_on_time",
            "contributions_late",
            "contributions_missed",
            "reputation_score",
            "trust_level",
            "warnings",
            "suspended_until",
        ]
