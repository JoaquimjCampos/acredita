import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.acredita_backend.settings')
django.setup()

from backend.games.quiz.models import Quiz
from backend.games.quiz.serializers import QuizSerializer

print("Quiz seasons:")
for season in Quiz.objects.values_list('season_number', flat=True).distinct():
    count = Quiz.objects.filter(season_number=season).count()
    print(f'  Season {season}: {count} quizzes')

print("\nTotal quizzes:", Quiz.objects.count())

# Try to serialize the first quiz
if Quiz.objects.exists():
    quiz = Quiz.objects.first()
    print(f"\nFirst quiz: {quiz.title}")
    try:
        serializer = QuizSerializer(quiz)
        print("Serialization successful!")
        print("Data:", serializer.data)
    except Exception as e:
        print(f"Serialization error: {e}")
