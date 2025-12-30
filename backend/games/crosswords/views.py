from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from django.utils import timezone
from .models import Crossword, CrosswordSession
from .serializers import CrosswordSerializer, CrosswordSessionSerializer


class CrosswordViewSet(viewsets.ModelViewSet):
    queryset = Crossword.objects.filter(is_active=True)
    serializer_class = CrosswordSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Filter crosswords"""
        return Crossword.objects.filter(is_active=True).order_by('-created_at')

    @action(detail=True, methods=['post'], url_path='submit-answers')
    def submit_answers(self, request, pk=None):
        """Submit answers to a crossword and calculate score"""
        crossword = self.get_object()
        answers = request.data.get('answers', {})
        time_taken = request.data.get('time_taken', 0)
        
        # Calculate score based on correct answers
        clues = crossword.clues.all()
        correct_count = 0
        for clue in clues:
            user_answer = answers.get(str(clue.id), '').strip().upper()
            if user_answer == clue.answer.upper():
                correct_count += 1
        
        total_clues = clues.count()
        score = int((correct_count / total_clues * 100)) if total_clues > 0 else 0
        
        session = CrosswordSession.objects.create(
            crossword=crossword,
            user=request.user,
            answers=answers,
            score=score,
            time_taken=time_taken,
            finished_at=timezone.now()
        )
        
        return Response({
            'session_id': session.id,
            'score': score,
            'correct': correct_count,
            'total': total_clues,
            'xp_earned': score,
            'message': f'Parabéns! Acertou {correct_count} de {total_clues} pistas!'
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='leaderboard')
    def leaderboard(self, request, pk=None):
        """Get top 10 scores for this crossword"""
        crossword = self.get_object()
        
        top_sessions = (
            CrosswordSession.objects
            .filter(crossword=crossword, finished_at__isnull=False)
            .select_related('user')
            .order_by('-score', 'time_taken')[:10]
        )
        
        leaderboard_data = [
            {
                'rank': idx + 1,
                'username': session.user.username,
                'score': session.score,
                'time_taken': session.time_taken,
                'finished_at': session.finished_at
            }
            for idx, session in enumerate(top_sessions)
        ]
        
        return Response({'leaderboard': leaderboard_data})


class CrosswordSessionViewSet(viewsets.ModelViewSet):
    queryset = CrosswordSession.objects.all()
    serializer_class = CrosswordSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter sessions for authenticated user"""
        return CrosswordSession.objects.filter(user=self.request.user).order_by('-started_at')
