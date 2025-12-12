from rest_framework import serializers
from .models import Sponsor


class SponsorSerializer(serializers.ModelSerializer):
    type = serializers.CharField(source='sponsor_type', read_only=True)

    class Meta:
        model = Sponsor
        fields = [
            'id',
            'name',
            'description',
            'logo',
            'url',
            'type',
            'order',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
