from rest_framework import serializers
from .models import Season, Episode, EpisodeParticipant


class EpisodeSerializer(serializers.ModelSerializer):
    """Serializer for episodes"""
    is_voting_active = serializers.ReadOnlyField()
    
    class Meta:
        model = Episode
        fields = [
            'id', 'season', 'episode_number', 'title', 'description',
            'air_date', 'duration_minutes', 'video_url', 'thumbnail',
            'view_count', 'like_count', 'has_elimination', 'voting_enabled',
            'voting_end_date', 'status', 'is_voting_active', 'created_at'
        ]
        read_only_fields = ['id', 'view_count', 'like_count', 'created_at']


class SeasonSerializer(serializers.ModelSerializer):
    """Serializer for seasons"""
    is_registration_open = serializers.ReadOnlyField()
    participant_count = serializers.ReadOnlyField()
    episode_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Season
        fields = [
            'id', 'title', 'description', 'season_number', 'registration_start',
            'registration_end', 'start_date', 'end_date', 'max_participants',
            'prize_amount', 'poster_image', 'trailer_video', 'status',
            'is_current', 'is_registration_open', 'participant_count',
            'episode_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_episode_count(self, obj):
        return obj.episodes.count()


class SeasonDetailSerializer(SeasonSerializer):
    """Detailed serializer for seasons with episodes"""
    episodes = EpisodeSerializer(many=True, read_only=True)
    recent_episodes = serializers.SerializerMethodField()
    
    class Meta(SeasonSerializer.Meta):
        fields = SeasonSerializer.Meta.fields + ['episodes', 'recent_episodes']
    
    def get_recent_episodes(self, obj):
        recent = obj.episodes.filter(status='completed').order_by('-air_date')[:3]
        return EpisodeSerializer(recent, many=True).data


class EpisodeParticipantSerializer(serializers.ModelSerializer):
    """Serializer for episode participants"""
    participant_name = serializers.CharField(source='participant.business_name', read_only=True)
    participant_number = serializers.CharField(source='participant.participant_number', read_only=True)
    episode_title = serializers.CharField(source='episode.title', read_only=True)
    
    class Meta:
        model = EpisodeParticipant
        fields = [
            'id', 'episode', 'participant', 'participant_name', 'participant_number',
            'episode_title', 'performance_score', 'mentor_feedback', 'is_featured',
            'is_eliminated', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class EpisodeListSerializer(serializers.ModelSerializer):
    """Simplified serializer for episode lists"""
    season_title = serializers.CharField(source='season.title', read_only=True)
    
    class Meta:
        model = Episode
        fields = [
            'id', 'season', 'season_title', 'episode_number', 'title',
            'air_date', 'duration_minutes', 'status', 'view_count', 'like_count'
        ]
