from rest_framework import serializers
from .models import Episode, Season, EpisodeParticipant


class SeasonNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Season
        fields = ['id', 'title', 'season_number', 'status', 'is_current']

class EpisodeSerializer(serializers.ModelSerializer):
    season = SeasonNestedSerializer(read_only=True)
    is_voting_active = serializers.SerializerMethodField()

    class Meta:
        model = Episode
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'updated_by')

    def get_is_voting_active(self, obj):
        return obj.is_voting_active

    def validate(self, data):
        # Garantir que a data de transmissão seja anterior ao fim da votação, se habilitada
        if data.get('voting_enabled') and data.get('voting_end_date'):
            if data['air_date'] > data['voting_end_date']:
                raise serializers.ValidationError('A data de transmissão deve ser anterior ao fim da votação.')
        # Prevent duplicate episode_number per season
        season = data.get('season') or self.instance.season if self.instance else None
        episode_number = data.get('episode_number')
        if season and episode_number:
            exists = Episode.objects.filter(season=season, episode_number=episode_number)
            if self.instance:
                exists = exists.exclude(pk=self.instance.pk)
            if exists.exists():
                raise serializers.ValidationError('Já existe um episódio com esse número nesta temporada.')
        return data

class EpisodeParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = EpisodeParticipant
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'updated_by')

class SeasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Season
        fields = '__all__'

    def validate(self, data):
        # Garantir que datas estejam em ordem lógica
        if data['registration_start'] >= data['registration_end']:
            raise serializers.ValidationError('A data de início das inscrições deve ser anterior ao fim.')
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError('A data de início da temporada deve ser anterior ao fim.')
        if not (data['registration_start'] <= data['start_date'] <= data['end_date']):
            raise serializers.ValidationError('A data de início da temporada deve estar entre o início e o fim das inscrições.')
        return data
