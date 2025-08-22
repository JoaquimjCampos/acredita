from rest_framework import serializers
from .models import DonationCampaign

class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonationCampaign
        fields = '__all__'
