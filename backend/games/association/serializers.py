from rest_framework import serializers
from .models import Association, AssociationPair, AssociationSession


class AssociationPairSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssociationPair
        fields = ['id', 'left_item', 'right_item', 'order']


class AssociationSerializer(serializers.ModelSerializer):
    pairs = AssociationPairSerializer(many=True, read_only=True)
    
    class Meta:
        model = Association
        fields = ['id', 'title', 'description', 'difficulty', 'is_active', 'created_at', 'pairs']


class AssociationSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssociationSession
        fields = ['id', 'association', 'user', 'matches', 'score', 'time_taken', 'started_at', 'finished_at']
