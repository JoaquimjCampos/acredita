
from rest_framework import serializers
from .models import Game



class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'title', 'description', 'type', 'instructions', 'assets', 'ranking_enabled', 'feedback_enabled', 'max_score']
