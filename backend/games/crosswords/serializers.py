from rest_framework import serializers
from .models import Crossword, CrosswordClue, CrosswordSession


class CrosswordClueSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrosswordClue
        fields = ['id', 'clue_text', 'answer', 'direction', 'number', 'order']
        extra_kwargs = {'answer': {'write_only': False}}  # Include answer for admin, exclude in game view


class CrosswordSerializer(serializers.ModelSerializer):
    clues = CrosswordClueSerializer(many=True, read_only=True)
    
    class Meta:
        model = Crossword
        fields = ['id', 'title', 'description', 'difficulty', 'grid', 'is_active', 'created_at', 'clues']


class CrosswordSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrosswordSession
        fields = ['id', 'crossword', 'user', 'answers', 'score', 'time_taken', 'started_at', 'finished_at']
