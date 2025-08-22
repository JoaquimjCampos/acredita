from rest_framework.decorators import action
from rest_framework.response import Response
import random

from rest_framework import viewsets
from .models import Quiz, Question, Answer, GameSession, UserAnswer
from .serializers import QuizSerializer, QuestionSerializer, AnswerSerializer, GameSessionSerializer, UserAnswerSerializer

# Quiz CRUD API
class QuizViewSet(viewsets.ModelViewSet):
    @action(detail=True, methods=['get'], url_path='analytics')
    def analytics(self, request, pk=None):
        quiz = self.get_object()
        from .models import GameSession, UserAnswer, Question, Answer
        question_ids = list(quiz.questions.values_list('id', flat=True))
        sessions = GameSession.objects.filter(useranswer__question_id__in=question_ids).distinct()
        total_sessions = sessions.count()
        # Most missed questions
        missed_stats = {}
        for q in quiz.questions.all():
            total = UserAnswer.objects.filter(question=q).count()
            correct = UserAnswer.objects.filter(question=q, answer__is_correct=True).count()
            missed = total - correct
            missed_stats[q.id] = {
                'text': q.text,
                'missed': missed,
                'total': total,
                'correct': correct,
            }
        most_missed = sorted(missed_stats.values(), key=lambda x: x['missed'], reverse=True)[:5]
        # Average score and time
        avg_score = sessions.aggregate(avg=models.Avg('score'))['avg'] or 0
        avg_time = sessions.aggregate(avg=models.Avg(models.F('finished_at') - models.F('started_at')))['avg']
        avg_time_sec = None
        if avg_time:
            avg_time_sec = avg_time.total_seconds() if hasattr(avg_time, 'total_seconds') else None
        # User progress (if authenticated)
        user_progress = None
        if request.user.is_authenticated:
            user_sessions = sessions.filter(user=request.user).order_by('-started_at')
            user_progress = [
                {'score': s.score, 'started_at': s.started_at, 'finished_at': s.finished_at}
                for s in user_sessions
            ]
        # Per-question answer distribution
        answer_distribution = {}
        for q in quiz.questions.all():
            dist = {}
            for a in q.answers.all():
                dist[a.text] = UserAnswer.objects.filter(question=q, answer=a).count()
            answer_distribution[q.id] = {'text': q.text, 'distribution': dist}
        # Completion rate
        completion_rate = 0
        if total_sessions:
            completed = sessions.filter(finished_at__isnull=False).count()
            completion_rate = completed / total_sessions
        return Response({
            'most_missed_questions': most_missed,
            'average_score': avg_score,
            'average_time_seconds': avg_time_sec,
            'user_progress': user_progress,
            'answer_distribution': answer_distribution,
            'completion_rate': completion_rate,
        })
    @action(detail=True, methods=['get'], url_path='leaderboard')
    def leaderboard(self, request, pk=None):
        quiz = self.get_object()
        from .models import GameSession, UserAnswer
        question_ids = quiz.questions.values_list('id', flat=True)
        sessions = GameSession.objects.filter(useranswer__question_id__in=question_ids).distinct()
        top_sessions = sessions.order_by('-score', '-started_at')[:10]
        data = []
        for s in top_sessions:
            user_answers = UserAnswer.objects.filter(session=s, question_id__in=question_ids)
            correct_count = user_answers.filter(answer__is_correct=True).count()
            total_count = user_answers.count()
            time_taken = None
            if s.started_at and s.finished_at:
                time_taken = (s.finished_at - s.started_at).total_seconds()
            data.append({
                'user': str(s.user),
                'score': s.score,
                'started_at': s.started_at,
                'finished_at': s.finished_at,
                'time_taken': time_taken,
                'correct_answers': correct_count,
                'total_answers': total_count,
            })
        return Response({'leaderboard': data})
    @action(detail=True, methods=['post'], url_path='submit-answers')
    def submit_answers(self, request, pk=None):
        quiz = self.get_object()
        user = request.user
        answers = request.data.get('answers', [])  # [{question_id, answer_id}]
        started_at = request.data.get('started_at')
        finished_at = request.data.get('finished_at')
        # Time limit enforcement
        import datetime
        if quiz.time_limit and started_at and finished_at:
            try:
                start_dt = datetime.datetime.fromisoformat(started_at)
                finish_dt = datetime.datetime.fromisoformat(finished_at)
                elapsed = (finish_dt - start_dt).total_seconds()
                if elapsed > quiz.time_limit:
                    return Response({'error': 'Tempo limite excedido.'}, status=400)
            except Exception:
                pass
        # Score calculation
        score = 0
        for ans in answers:
            qid = ans.get('question_id')
            aid = ans.get('answer_id')
            try:
                question = quiz.questions.get(id=qid)
                answer = question.answers.get(id=aid)
                if answer.is_correct:
                    score += 1
            except Exception:
                continue
        # Store session
        from .models import GameSession
        session = GameSession.objects.create(user=user, score=score)
        return Response({'score': score, 'session_id': session.id})
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    @action(detail=True, methods=['get'], url_path='random-questions')
    def random_questions(self, request, pk=None):
        quiz = self.get_object()
        count = int(request.query_params.get('count', 10))
        questions = list(quiz.questions.all())
        random.shuffle(questions)
        selected = questions[:count]
        data = QuestionSerializer(selected, many=True).data
        return Response({'quiz': QuizSerializer(quiz).data, 'questions': data})

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer

class GameSessionViewSet(viewsets.ModelViewSet):
    queryset = GameSession.objects.all()
    serializer_class = GameSessionSerializer

class UserAnswerViewSet(viewsets.ModelViewSet):
    queryset = UserAnswer.objects.all()
    serializer_class = UserAnswerSerializer
