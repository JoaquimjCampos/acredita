from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, F
from django.db import transaction
from .models import VotingSession, Vote, VotingResult, VotingReport
from .serializers import (
    VotingSessionSerializer, VoteSerializer, VotingResultSerializer, 
    VotingReportSerializer, CastVoteSerializer
)
from mcp_core.decorators import mcp_endpoint
import uuid


class VotingSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing voting sessions"""
    queryset = VotingSession.objects.all()
    serializer_class = VotingSessionSerializer
    permission_classes = [permissions.AllowAny]  # Public access for viewing
    
    def get_permissions(self):
        """Only allow staff to create/update/delete voting sessions"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        queryset = VotingSession.objects.all().select_related('episode')
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get currently active voting sessions"""
        now = timezone.now()
        sessions = VotingSession.objects.filter(
            status='active',
            start_date__lte=now,
            end_date__gte=now
        )
        serializer = self.get_serializer(sessions, many=True)
        return Response({
            'sucesso': True,
            'dados': serializer.data
        })
    
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Get voting results for a session"""
        session = self.get_object()
        
        if not session.show_results_live and session.status != 'completed':
            return Response({
                'sucesso': False,
                'mensagem': 'Os resultados não estão disponíveis ainda.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        results = VotingResult.objects.filter(voting_session=session).order_by('-vote_count')
        serializer = VotingResultSerializer(results, many=True)
        
        return Response({
            'sucesso': True,
            'dados': {
                'session': VotingSessionSerializer(session).data,
                'results': serializer.data,
                'total_votes': session.total_votes
            }
        })
    
    @action(detail=True, methods=['post'])
    @mcp_endpoint
    def cast_vote(self, request, pk=None):
        """Cast a vote in the voting session"""
        session = self.get_object()
        
        # Check if voting is active
        if not session.is_active:
            return Response({
                'sucesso': False,
                'mensagem': 'Esta sessão de votação não está ativa.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = CastVoteSerializer(data=request.data)
        if serializer.is_valid():
            participant_id = serializer.validated_data['participant_id']
            voter_email = serializer.validated_data.get('voter_email')
            voter_phone = serializer.validated_data.get('voter_phone')
            comment = serializer.validated_data.get('comment', '')
            
            # Get client IP
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                voter_ip = x_forwarded_for.split(',')[0]
            else:
                voter_ip = request.META.get('REMOTE_ADDR')
            
            try:
                with transaction.atomic():
                    # Create vote
                    vote_data = {
                        'voting_session': session,
                        'participant_id': participant_id,
                        'voter_ip': voter_ip,
                        'comment': comment,
                        'verification_token': str(uuid.uuid4())
                    }
                    
                    if request.user.is_authenticated:
                        vote_data['voter'] = request.user
                    elif voter_email:
                        vote_data['voter_email'] = voter_email
                    elif voter_phone:
                        vote_data['voter_phone'] = voter_phone
                    
                    vote = Vote.objects.create(**vote_data)
                    
                    # Update voting results
                    self._update_voting_results(session)
                    
                    return Response({
                        'sucesso': True,
                        'mensagem': 'Voto registado com sucesso.',
                        'dados': {'vote_id': vote.id}
                    }, status=status.HTTP_201_CREATED)
                    
            except Exception as e:
                return Response({
                    'sucesso': False,
                    'mensagem': 'Erro ao registar o voto. Possível voto duplicado.',
                    'erro': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'sucesso': False,
            'mensagem': 'Dados inválidos.',
            'erros': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def _update_voting_results(self, session):
        """Update voting results for a session"""
        # Get vote counts per participant
        vote_counts = Vote.objects.filter(voting_session=session).values(
            'participant'
        ).annotate(
            count=Count('id'),
            verified_count=Count('id', filter=F('is_verified'))
        )
        
        total_votes = session.total_votes
        
        # Update or create results
        for vote_data in vote_counts:
            participant_id = vote_data['participant']
            vote_count = vote_data['count']
            verified_count = vote_data['verified_count']
            percentage = (vote_count / total_votes * 100) if total_votes > 0 else 0
            
            VotingResult.objects.update_or_create(
                voting_session=session,
                participant_id=participant_id,
                defaults={
                    'vote_count': vote_count,
                    'verified_votes': verified_count,
                    'vote_percentage': percentage,
                    'weighted_score': vote_count  # Can be enhanced with weighting logic
                }
            )
        
        # Update rankings
        results = VotingResult.objects.filter(voting_session=session).order_by('-vote_count')
        for i, result in enumerate(results, 1):
            result.rank = i
            result.save(update_fields=['rank'])


class VoteViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing votes (admin only)"""
    queryset = Vote.objects.all()
    serializer_class = VoteSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = Vote.objects.all().select_related('voting_session', 'participant', 'voter')
        
        # Filter by voting session if provided
        session_id = self.request.query_params.get('session', None)
        if session_id:
            queryset = queryset.filter(voting_session_id=session_id)
        
        return queryset


class VotingResultViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing voting results"""
    queryset = VotingResult.objects.all()
    serializer_class = VotingResultSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = VotingResult.objects.all().select_related(
            'voting_session', 'participant', 'participant__user'
        )
        
        # Filter by voting session if provided
        session_id = self.request.query_params.get('session', None)
        if session_id:
            queryset = queryset.filter(voting_session_id=session_id)
        
        return queryset.order_by('rank')


class VotingReportViewSet(viewsets.ModelViewSet):
    """ViewSet for managing voting reports"""
    queryset = VotingReport.objects.all()
    serializer_class = VotingReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """Only allow staff to view all reports"""
        if self.action in ['list', 'retrieve', 'update', 'partial_update']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    @mcp_endpoint
    def create(self, request, *args, **kwargs):
        """Create a voting report"""
        # Get client IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            reporter_ip = x_forwarded_for.split(',')[0]
        else:
            reporter_ip = request.META.get('REMOTE_ADDR')
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(reporter_ip=reporter_ip)
            return Response({
                'sucesso': True,
                'mensagem': 'Relatório submetido com sucesso. Será analisado pela nossa equipa.',
                'dados': serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'sucesso': False,
            'mensagem': 'Dados inválidos no relatório.',
            'erros': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
