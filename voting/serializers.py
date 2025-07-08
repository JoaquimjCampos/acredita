from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import VotingSession, Vote, VotingResult, VotingReport
from participants.models import Participant

User = get_user_model()


class VotingSessionSerializer(serializers.ModelSerializer):
    """Serializer for voting sessions"""
    is_active = serializers.ReadOnlyField()
    total_votes = serializers.ReadOnlyField()
    episode_title = serializers.CharField(source='episode.title', read_only=True)
    
    class Meta:
        model = VotingSession
        fields = [
            'id', 'episode', 'episode_title', 'title', 'description',
            'start_date', 'end_date', 'max_votes_per_user', 'requires_registration',
            'show_results_live', 'status', 'is_active', 'total_votes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class VoteSerializer(serializers.ModelSerializer):
    """Serializer for votes"""
    participant_name = serializers.CharField(source='participant.business_name', read_only=True)
    voter_name = serializers.CharField(source='voter.full_name', read_only=True)
    session_title = serializers.CharField(source='voting_session.title', read_only=True)
    
    class Meta:
        model = Vote
        fields = [
            'id', 'voting_session', 'session_title', 'participant', 'participant_name',
            'voter', 'voter_name', 'voter_email', 'voter_phone', 'voter_ip',
            'weight', 'comment', 'created_at', 'is_verified', 'verification_token'
        ]
        read_only_fields = [
            'id', 'voter_ip', 'created_at', 'is_verified', 'verification_token'
        ]


class CastVoteSerializer(serializers.Serializer):
    """Serializer for casting votes"""
    participant_id = serializers.IntegerField()
    voter_email = serializers.EmailField(required=False, allow_blank=True)
    voter_phone = serializers.CharField(max_length=15, required=False, allow_blank=True)
    comment = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_participant_id(self, value):
        try:
            Participant.objects.get(id=value)
        except Participant.DoesNotExist:
            raise serializers.ValidationError('Participante não encontrado.')
        return value
    
    def validate(self, data):
        # For anonymous voting, either email or phone is required
        if not data.get('voter_email') and not data.get('voter_phone'):
            # This will be handled by checking if user is authenticated
            pass
        return data


class VotingResultSerializer(serializers.ModelSerializer):
    """Serializer for voting results"""
    participant_name = serializers.CharField(source='participant.business_name', read_only=True)
    participant_number = serializers.CharField(source='participant.participant_number', read_only=True)
    participant_image = serializers.ImageField(source='participant.user.profile_image', read_only=True)
    session_title = serializers.CharField(source='voting_session.title', read_only=True)
    
    class Meta:
        model = VotingResult
        fields = [
            'id', 'voting_session', 'session_title', 'participant', 'participant_name',
            'participant_number', 'participant_image', 'vote_count', 'vote_percentage',
            'rank', 'verified_votes', 'weighted_score', 'last_updated'
        ]
        read_only_fields = ['id', 'last_updated']


class VotingReportSerializer(serializers.ModelSerializer):
    """Serializer for voting reports"""
    vote_details = VoteSerializer(source='vote', read_only=True)
    session_title = serializers.CharField(source='voting_session.title', read_only=True)
    
    class Meta:
        model = VotingReport
        fields = [
            'id', 'voting_session', 'session_title', 'vote', 'vote_details',
            'report_type', 'description', 'reporter_email', 'reporter_ip',
            'is_reviewed', 'is_valid', 'admin_notes', 'created_at', 'reviewed_at'
        ]
        read_only_fields = [
            'id', 'reporter_ip', 'is_reviewed', 'is_valid', 'admin_notes',
            'created_at', 'reviewed_at'
        ]


class VotingStatsSerializer(serializers.Serializer):
    """Serializer for voting statistics"""
    total_sessions = serializers.IntegerField()
    active_sessions = serializers.IntegerField()
    total_votes = serializers.IntegerField()
    unique_voters = serializers.IntegerField()
    top_participant = serializers.CharField()
    participation_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
