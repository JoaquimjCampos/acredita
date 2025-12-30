from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from backend.games.quiz.models import Quiz, Question, Answer
import datetime

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with sample quizzes for the Acredita platform'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting quiz seeding...'))

        # Create a default author (admin user)
        try:
            admin_user = User.objects.filter(is_staff=True).first()
            if not admin_user:
                admin_user = User.objects.create_superuser(
                    username='admin',
                    email='admin@acredita.ao',
                    password='admin123'
                )
                self.stdout.write(self.style.SUCCESS(f'Created admin user: {admin_user.username}'))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f'Could not create admin user: {e}'))
            admin_user = None

        # Quiz 1: Empreendedorismo Básico
        quiz1, created = Quiz.objects.get_or_create(
            title='Empreendedorismo Básico',
            defaults={
                'description': 'Teste seus conhecimentos sobre os fundamentos do empreendedorismo',
                'category': 'Empreendedorismo',
                'difficulty': 'Fácil',
                'author': admin_user,
                'time_limit': 600,  # 10 minutes
                'is_public': True,
                'season_number': 1,
                'start_date': datetime.datetime.now() - datetime.timedelta(days=30),
                'end_date': datetime.datetime.now() + datetime.timedelta(days=60),
            }
        )
        if created:
            # Add questions to Quiz 1
            questions_data = [
                {
                    'text': 'O que é empreendedorismo?',
                    'category': 'Conceitos',
                    'difficulty': 'Fácil',
                    'answers': [
                        {'text': 'Criar e gerenciar um negócio com inovação e risco', 'is_correct': True},
                        {'text': 'Apenas abrir uma loja', 'is_correct': False},
                        {'text': 'Trabalhar para alguém', 'is_correct': False},
                        {'text': 'Nenhuma das anteriores', 'is_correct': False},
                    ]
                },
                {
                    'text': 'Qual é o primeiro passo para começar um negócio?',
                    'category': 'Planejamento',
                    'difficulty': 'Fácil',
                    'answers': [
                        {'text': 'Identificar uma oportunidade de mercado', 'is_correct': True},
                        {'text': 'Gastar todo seu dinheiro', 'is_correct': False},
                        {'text': 'Contratar muitos funcionários', 'is_correct': False},
                        {'text': 'Fazer publicidade sem plano', 'is_correct': False},
                    ]
                },
                {
                    'text': 'O que é um plano de negócios?',
                    'category': 'Planejamento',
                    'difficulty': 'Médio',
                    'answers': [
                        {'text': 'Um documento que descreve a estratégia e objetivos do negócio', 'is_correct': True},
                        {'text': 'Uma lista de compras', 'is_correct': False},
                        {'text': 'Um contrato de trabalho', 'is_correct': False},
                        {'text': 'Uma propaganda', 'is_correct': False},
                    ]
                },
                {
                    'text': 'Qual é a importância do capital inicial?',
                    'category': 'Finanças',
                    'difficulty': 'Médio',
                    'answers': [
                        {'text': 'Financiar operações iniciais e infraestrutura', 'is_correct': True},
                        {'text': 'Não é importante', 'is_correct': False},
                        {'text': 'Apenas para decoração do escritório', 'is_correct': False},
                        {'text': 'Para gastar em festas', 'is_correct': False},
                    ]
                },
                {
                    'text': 'Como medir o sucesso de um negócio?',
                    'category': 'Gestão',
                    'difficulty': 'Difícil',
                    'answers': [
                        {'text': 'Através de lucro, crescimento e satisfação do cliente', 'is_correct': True},
                        {'text': 'Apenas pelo número de funcionários', 'is_correct': False},
                        {'text': 'Apenas pelo tamanho do escritório', 'is_correct': False},
                        {'text': 'Não há forma de medir', 'is_correct': False},
                    ]
                },
            ]

            for q_data in questions_data:
                question = Question.objects.create(
                    quiz=quiz1,
                    text=q_data['text'],
                    category=q_data['category'],
                    difficulty=q_data['difficulty'],
                    explanation='',
                    hint='',
                    is_multi_select=False,
                )
                for a_data in q_data['answers']:
                    Answer.objects.create(
                        question=question,
                        text=a_data['text'],
                        is_correct=a_data['is_correct']
                    )

            self.stdout.write(self.style.SUCCESS(f'✓ Created quiz: {quiz1.title}'))

        # Quiz 2: Finanças Pessoais
        quiz2, created = Quiz.objects.get_or_create(
            title='Finanças Pessoais',
            defaults={
                'description': 'Aprenda a gerir suas finanças de forma inteligente',
                'category': 'Finanças',
                'difficulty': 'Médio',
                'author': admin_user,
                'time_limit': 900,  # 15 minutes
                'is_public': True,
                'season_number': 1,
                'start_date': datetime.datetime.now() - datetime.timedelta(days=20),
                'end_date': datetime.datetime.now() + datetime.timedelta(days=70),
            }
        )
        if created:
            questions_data = [
                {
                    'text': 'O que é orçamento pessoal?',
                    'category': 'Conceitos',
                    'difficulty': 'Fácil',
                    'answers': [
                        {'text': 'Um plano de receitas e despesas', 'is_correct': True},
                        {'text': 'Uma forma de gastar dinheiro', 'is_correct': False},
                        {'text': 'Um empréstimo bancário', 'is_correct': False},
                        {'text': 'Um tipo de investimento', 'is_correct': False},
                    ]
                },
                {
                    'text': 'Qual percentual do orçamento deve ser destinado a poupança?',
                    'category': 'Poupança',
                    'difficulty': 'Médio',
                    'answers': [
                        {'text': 'Pelo menos 10% a 20%', 'is_correct': True},
                        {'text': '1% a 2%', 'is_correct': False},
                        {'text': 'Não é necessário poupar', 'is_correct': False},
                        {'text': 'Mais de 80%', 'is_correct': False},
                    ]
                },
                {
                    'text': 'O que é um investimento de longo prazo?',
                    'category': 'Investimentos',
                    'difficulty': 'Médio',
                    'answers': [
                        {'text': 'Uma aplicação de recursos por vários anos', 'is_correct': True},
                        {'text': 'Emprestar dinheiro a amigos', 'is_correct': False},
                        {'text': 'Comprar loteria', 'is_correct': False},
                        {'text': 'Gastar em férias', 'is_correct': False},
                    ]
                },
                {
                    'text': 'Como reduzir dívidas de forma eficaz?',
                    'category': 'Dívida',
                    'difficulty': 'Difícil',
                    'answers': [
                        {'text': 'Pagar mais do que o mínimo e negociar taxas', 'is_correct': True},
                        {'text': 'Ignorar as dívidas', 'is_correct': False},
                        {'text': 'Fazer mais dívidas', 'is_correct': False},
                        {'text': 'Nunca pagar', 'is_correct': False},
                    ]
                },
            ]

            for q_data in questions_data:
                question = Question.objects.create(
                    quiz=quiz2,
                    text=q_data['text'],
                    category=q_data['category'],
                    difficulty=q_data['difficulty'],
                    explanation='',
                    hint='',
                    is_multi_select=False,
                )
                for a_data in q_data['answers']:
                    Answer.objects.create(
                        question=question,
                        text=a_data['text'],
                        is_correct=a_data['is_correct']
                    )

            self.stdout.write(self.style.SUCCESS(f'✓ Created quiz: {quiz2.title}'))

        # Quiz 3: Cultura e Negócios em Angola
        quiz3, created = Quiz.objects.get_or_create(
            title='Cultura e Negócios em Angola',
            defaults={
                'description': 'Compreenda o contexto cultural dos negócios angolanos',
                'category': 'Cultura',
                'difficulty': 'Médio',
                'author': admin_user,
                'time_limit': 600,  # 10 minutes
                'is_public': True,
                'season_number': 1,
                'start_date': datetime.datetime.now() - datetime.timedelta(days=10),
                'end_date': datetime.datetime.now() + datetime.timedelta(days=80),
            }
        )
        if created:
            questions_data = [
                {
                    'text': 'Qual é a capital de Angola?',
                    'category': 'Geografia',
                    'difficulty': 'Fácil',
                    'answers': [
                        {'text': 'Luanda', 'is_correct': True},
                        {'text': 'Huambo', 'is_correct': False},
                        {'text': 'Benguela', 'is_correct': False},
                        {'text': 'Namibe', 'is_correct': False},
                    ]
                },
                {
                    'text': 'Qual é a moeda de Angola?',
                    'category': 'Economia',
                    'difficulty': 'Fácil',
                    'answers': [
                        {'text': 'Kwanza angolano (AOA)', 'is_correct': True},
                        {'text': 'Dólar americano', 'is_correct': False},
                        {'text': 'Euro', 'is_correct': False},
                        {'text': 'Rand sul-africano', 'is_correct': False},
                    ]
                },
                {
                    'text': 'Qual é o principal recurso econômico de Angola?',
                    'category': 'Economia',
                    'difficulty': 'Médio',
                    'answers': [
                        {'text': 'Petróleo e diamantes', 'is_correct': True},
                        {'text': 'Agricultura apenas', 'is_correct': False},
                        {'text': 'Turismo', 'is_correct': False},
                        {'text': 'Tecnologia', 'is_correct': False},
                    ]
                },
                {
                    'text': 'Como é importante a diversificação econômica para Angola?',
                    'category': 'Desenvolvimento',
                    'difficulty': 'Difícil',
                    'answers': [
                        {'text': 'Muito importante para reduzir dependência do petróleo', 'is_correct': True},
                        {'text': 'Não é importante', 'is_correct': False},
                        {'text': 'Apenas para turismo', 'is_correct': False},
                        {'text': 'Não afeta a economia', 'is_correct': False},
                    ]
                },
            ]

            for q_data in questions_data:
                question = Question.objects.create(
                    quiz=quiz3,
                    text=q_data['text'],
                    category=q_data['category'],
                    difficulty=q_data['difficulty'],
                    explanation='',
                    hint='',
                    is_multi_select=False,
                )
                for a_data in q_data['answers']:
                    Answer.objects.create(
                        question=question,
                        text=a_data['text'],
                        is_correct=a_data['is_correct']
                    )

            self.stdout.write(self.style.SUCCESS(f'✓ Created quiz: {quiz3.title}'))

        self.stdout.write(self.style.SUCCESS('Quiz seeding completed successfully! ✓'))
