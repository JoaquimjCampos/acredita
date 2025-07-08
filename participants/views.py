from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import Participant, ParticipantTask
from .serializers import ParticipantSerializer, ParticipantTaskSerializer, ParticipantApplicationSerializer
from mcp_core.decorators import mcp_endpoint


class ParticipantViewSet(viewsets.ModelViewSet):
    """ViewSet for managing participants"""
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ParticipantApplicationSerializer
        return ParticipantSerializer
    
    def get_queryset(self):
        queryset = Participant.objects.all()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by season if provided
        season_id = self.request.query_params.get('season', None)
        if season_id:
            queryset = queryset.filter(season_id=season_id)
        
        # Filter by category if provided
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(business_category=category)
        
        return queryset.select_related('user', 'season')
    
    @mcp_endpoint
    def create(self, request, *args, **kwargs):
        """Apply to become a participant"""
        # Check if user already has a participant profile
        if hasattr(request.user, 'participant_profile'):
            return Response({
                'sucesso': False,
                'mensagem': 'O utilizador já possui uma candidatura registada.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            participant = serializer.save(user=request.user)
            return Response({
                'sucesso': True,
                'mensagem': 'Candidatura submetida com sucesso. Aguarde pela aprovação.',
                'dados': ParticipantSerializer(participant).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'sucesso': False,
            'mensagem': 'Dados inválidos na candidatura.',
            'erros': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    @mcp_endpoint
    def my_application(self, request):
        """Get current user's participant application"""
        try:
            participant = request.user.participant_profile
            serializer = self.get_serializer(participant)
            return Response({
                'sucesso': True,
                'dados': serializer.data
            })
        except Participant.DoesNotExist:
            return Response({
                'sucesso': False,
                'mensagem': 'O utilizador não possui candidatura registada.'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    @mcp_endpoint
    def approve(self, request, pk=None):
        """Approve a participant application (admin only)"""
        if not request.user.is_staff:
            return Response({
                'sucesso': False,
                'mensagem': 'Permissão negada.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        participant = self.get_object()
        participant.status = 'approved'
        participant.approved_at = timezone.now()
        participant.save()
        
        return Response({
            'sucesso': True,
            'mensagem': 'Candidatura aprovada com sucesso.',
            'dados': self.get_serializer(participant).data
        })
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def leaderboard(self, request):
        """Get participants leaderboard"""
        season_id = request.query_params.get('season', None)
        queryset = Participant.objects.all()  # Use base queryset for public access
        
        if season_id:
            queryset = queryset.filter(season_id=season_id)
        
        # Order by mentor score and public votes
        queryset = queryset.filter(status='active').order_by(
            '-mentor_score', '-public_votes'
        )[:10]
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'sucesso': True,
            'dados': serializer.data
        })


class ParticipantTaskViewSet(viewsets.ModelViewSet):
    """ViewSet for managing participant tasks"""
    queryset = ParticipantTask.objects.all()
    serializer_class = ParticipantTaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own tasks unless they're staff
        if self.request.user.is_staff:
            return ParticipantTask.objects.all()
        
        try:
            participant = self.request.user.participant_profile
            return ParticipantTask.objects.filter(participant=participant)
        except Participant.DoesNotExist:
            return ParticipantTask.objects.none()
    
    @action(detail=True, methods=['post'])
    @mcp_endpoint
    def submit(self, request, pk=None):
        """Submit a task"""
        task = self.get_object()
        
        # Check if this is the participant's task
        if not hasattr(request.user, 'participant_profile') or task.participant != request.user.participant_profile:
            return Response({
                'sucesso': False,
                'mensagem': 'Permissão negada.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        submission = request.FILES.get('submission')
        submission_notes = request.data.get('submission_notes', '')
        
        if not submission:
            return Response({
                'sucesso': False,
                'mensagem': 'É necessário anexar um ficheiro para a submissão.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        task.submission = submission
        task.submission_notes = submission_notes
        task.status = 'completed'
        task.submitted_at = timezone.now()
        task.save()
        
        return Response({
            'sucesso': True,
            'mensagem': 'Tarefa submetida com sucesso.',
            'dados': self.get_serializer(task).data
        })
