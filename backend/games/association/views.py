from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from django.db.models import Avg, Count
from django.utils import timezone
from .models import Association, AssociationSession
from .serializers import AssociationSerializer, AssociationSessionSerializer


class AssociationViewSet(viewsets.ModelViewSet):
    queryset = Association.objects.filter(is_active=True)
    serializer_class = AssociationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Filter associations"""
        return Association.objects.filter(is_active=True).order_by('-created_at')

    @action(detail=True, methods=['post'], url_path='submit-answers')
    def submit_answers(self, request, pk=None):
        """Submit association matches and calculate score"""
        association = self.get_object()
        matches = request.data.get('matches', {})
        time_taken = request.data.get('time_taken', 0)
        
        # Calculate score based on correct matches
        pairs = association.pairs.all()
        correct_pairs = {p.left_item: p.right_item for p in pairs}
        correct_count = sum(1 for left, right in matches.items() if correct_pairs.get(left) == right)
        total_pairs = len(correct_pairs)
        score = int((correct_count / total_pairs * 100)) if total_pairs > 0 else 0
        
        session = AssociationSession.objects.create(
            association=association,
            user=request.user,
            matches=matches,
            score=score,
            time_taken=time_taken,
            finished_at=timezone.now()
        )
        
        return Response({
            'session_id': session.id,
            'score': score,
            'correct': correct_count,
            'total': total_pairs,
            'xp_earned': score,
            'message': f'Parabéns! Acertou {correct_count} de {total_pairs} pares!'
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='leaderboard')
    def leaderboard(self, request, pk=None):
        """Get top 10 scores for this association"""
        association = self.get_object()
        
        top_sessions = (
            AssociationSession.objects
            .filter(association=association, finished_at__isnull=False)
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


class AssociationSessionViewSet(viewsets.ModelViewSet):
    queryset = AssociationSession.objects.all()
    serializer_class = AssociationSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter sessions for authenticated user"""
        return AssociationSession.objects.filter(user=self.request.user).order_by('-started_at')
