#!/usr/bin/env python
"""Create test data for games module"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.acredita_backend.settings')
django.setup()

from backend.games.models import Game
from backend.games.quiz.models import Quiz, Question, Answer
from backend.games.models import Simulator

# Create additional test games
test_games = [
    {
        "title": "Simulador de Finanças",
        "description": "Gerencie suas finanças pessoais em diferentes cenários econômicos",
        "type": "simulator",
        "category": "Finanças",
        "difficulty": "Intermediário",
        "is_active": True,
        "max_score": 100,
    },
    {
        "title": "Associação de Conceitos",
        "description": "Conecte conceitos relacionados de negócios em Angola",
        "type": "association",
        "category": "Conceitos",
        "difficulty": "Fácil",
        "is_active": True,
        "max_score": 50,
    },
    {
        "title": "Palavras Cruzadas: Negócios",
        "description": "Complete as palavras cruzadas com termos empresariais",
        "type": "crosswords",
        "category": "Vocabulário",
        "difficulty": "Médio",
        "is_active": True,
        "max_score": 75,
    },
]

print("Creating test games...")
created_count = 0
for game_data in test_games:
    if not Game.objects.filter(title=game_data["title"]).exists():
        Game.objects.create(**game_data)
        created_count += 1
        print(f"✓ Created: {game_data['title']}")
    else:
        print(f"→ Already exists: {game_data['title']}")

print(f"\n{created_count} new games created")

# Verify all games
all_games = Game.objects.all()
print(f"\nTotal games in database: {all_games.count()}")
for game in all_games:
    print(f"  - {game.title} (Type: {game.type}, Active: {game.is_active}, Category: {game.category})")

# Verify quizzes with season_number=2
quizzes = Quiz.objects.filter(season_number=2)
print(f"\nQuizzes for Season 2: {quizzes.count()}")
for quiz in quizzes[:3]:
    print(f"  - {quiz.title} ({quiz.questions.count()} questions)")

print("\n✓ Test data setup complete!")
