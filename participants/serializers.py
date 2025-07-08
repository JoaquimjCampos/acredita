from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Participant, ParticipantTask
from accounts.serializers import UserSerializer

User = get_user_model()


class ParticipantSerializer(serializers.ModelSerializer):
    """Serializer for participant details"""
    user = UserSerializer(read_only=True)
    funding_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Participant
        fields = [
            'id', 'user', 'participant_number', 'status', 'business_name',
            'business_category', 'business_description', 'pitch_video', 
            'pitch_document', 'season', 'episode_joined', 'episode_eliminated',
            'mentor_score', 'public_votes', 'funding_goal', 'funding_received',
            'funding_percentage', 'created_at', 'updated_at', 'approved_at'
        ]
        read_only_fields = [
            'id', 'participant_number', 'status', 'mentor_score', 
            'public_votes', 'funding_received', 'created_at', 
            'updated_at', 'approved_at'
        ]


class ParticipantApplicationSerializer(serializers.ModelSerializer):
    """Serializer for participant applications"""
    
    class Meta:
        model = Participant
        fields = [
            'business_name', 'business_category', 'business_description',
            'pitch_video', 'pitch_document', 'season', 'funding_goal'
        ]
        
    def validate_season(self, value):
        """Validate that the season accepts applications"""
        if not value.is_accepting_applications:
            raise serializers.ValidationError(
                'Esta temporada não está a aceitar candidaturas.'
            )
        return value


class ParticipantTaskSerializer(serializers.ModelSerializer):
    """Serializer for participant tasks"""
    participant_name = serializers.CharField(source='participant.business_name', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = ParticipantTask
        fields = [
            'id', 'participant', 'participant_name', 'title', 'description',
            'due_date', 'status', 'submission', 'submission_notes',
            'score', 'feedback', 'created_at', 'submitted_at', 'is_overdue'
        ]
        read_only_fields = [
            'id', 'participant_name', 'score', 'feedback', 
            'created_at', 'submitted_at', 'is_overdue'
        ]
    
    def get_is_overdue(self, obj):
        """Check if task is overdue"""
        from django.utils import timezone
        return obj.due_date < timezone.now() and obj.status != 'completed'


class ParticipantListSerializer(serializers.ModelSerializer):
    """Simplified serializer for participant lists"""
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    funding_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = Participant
        fields = [
            'id', 'participant_number', 'user_name', 'business_name',
            'business_category', 'status', 'mentor_score', 'public_votes',
            'funding_goal', 'funding_received', 'funding_percentage'
        ]
