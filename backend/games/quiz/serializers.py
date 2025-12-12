from rest_framework import serializers
from .models import Quiz, Question, Answer, GameSession, UserAnswer
# Quiz serializer
class QuizSerializer(serializers.ModelSerializer):
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'category', 'difficulty', 'author', 'time_limit', 'is_public', 'start_date', 'end_date', 'created_at', 'season_number']

from rest_framework import serializers
from .models import Question, Answer, GameSession, UserAnswer

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = '__all__'


class QuestionSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()
    quiz = QuizSerializer(read_only=True)
    quiz_id = serializers.PrimaryKeyRelatedField(queryset=Quiz.objects.all(), source='quiz', write_only=True, required=False)
    class Meta:
        model = Question
        fields = ['id', 'text', 'category', 'created_at', 'options', 'quiz', 'quiz_id', 'explanation', 'hint', 'difficulty', 'is_multi_select']

    def get_options(self, obj):
        return [a.text for a in obj.answers.all()]

class GameSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameSession
        fields = ['id', 'user', 'started_at', 'finished_at', 'score', 'feedback', 'season_number']

class UserAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAnswer
        fields = '__all__'
