from django.core.management.base import BaseCommand
from backend.games.models import Game


class Command(BaseCommand):
    help = 'Seed database with sample games'

    def handle(self, *args, **options):
        games_data = [
            {
                'title': 'Quiz de Conhecimentos Gerais',
                'description': 'Teste seus conhecimentos em uma variedade de tópicos interessantes.',
                'type': 'quiz',
                'instructions': 'Responda corretamente a todas as perguntas para ganhar pontos.',
                'max_score': 100,
            },
            {
                'title': 'Simulador de Decisões',
                'description': 'Simule decisões empresariais e veja o impacto nos resultados.',
                'type': 'simulator',
                'instructions': 'Faça escolhas estratégicas e monitore os KPIs.',
                'max_score': 50,
            },
            {
                'title': 'Jogo de Associações',
                'description': 'Associe conceitos, imagens e palavras corretamente.',
                'type': 'association',
                'instructions': 'Clique nos pares corretos para ganhar pontos.',
                'max_score': 75,
            },
            {
                'title': 'Palavras Cruzadas',
                'description': 'Resolva palavras cruzadas e aprenda novos termos.',
                'type': 'crosswords',
                'instructions': 'Complete as palavras cruzadas preenchendo as respostas corretas.',
                'max_score': 100,
            },
        ]

        for game_data in games_data:
            game, created = Game.objects.get_or_create(
                title=game_data['title'],
                defaults=game_data
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created game: {game.title}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Game already exists: {game.title}')
                )

        self.stdout.write(self.style.SUCCESS('Games seeded successfully!'))
