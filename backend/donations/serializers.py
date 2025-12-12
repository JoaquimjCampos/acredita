from rest_framework import serializers
from .models import DonationCampaign


class DonationCampaignListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem de campanhas"""
    progress_percentage = serializers.DecimalField(
        source='progress_percentage',
        max_digits=5,
        decimal_places=2,
        read_only=True
    )
    donors_count = serializers.SerializerMethodField()

    class Meta:
        model = DonationCampaign
        fields = [
            'id',
            'title',
            'description',
            'goal_amount',
            'raised_amount',
            'progress_percentage',
            'donors_count',
            'start_date',
            'end_date',
            'image',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'raised_amount', 'created_at']

    def get_donors_count(self, obj):
        return obj.donors_count


class DonationCampaignDetailSerializer(serializers.ModelSerializer):
    """Serializer completo para detalhes de campanha"""
    progress_percentage = serializers.DecimalField(
        source='progress_percentage',
        max_digits=5,
        decimal_places=2,
        read_only=True
    )
    donors_count = serializers.SerializerMethodField()
    participant_name = serializers.CharField(
        source='participant.business_name',
        read_only=True
    )
    season_name = serializers.CharField(
        source='season.season_name',
        read_only=True
    )

    class Meta:
        model = DonationCampaign
        fields = [
            'id',
            'title',
            'description',
            'goal_amount',
            'raised_amount',
            'progress_percentage',
            'donors_count',
            'start_date',
            'end_date',
            'image',
            'video_url',
            'min_donation',
            'max_donation',
            'anonymous_allowed',
            'participant_name',
            'season_name',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'raised_amount',
            'donors_count',
            'participant_name',
            'season_name',
            'created_at',
            'updated_at',
        ]

    def get_donors_count(self, obj):
        return obj.donors_count


class DonationSerializer(serializers.ModelSerializer):
    """Serializer legado para compatibilidade"""
    class Meta:
        model = DonationCampaign
        fields = '__all__'
