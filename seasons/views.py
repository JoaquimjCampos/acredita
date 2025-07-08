from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Avg
from .models import Season, Episode, EpisodeParticipant
from .serializers import SeasonSerializer, EpisodeSerializer, EpisodeParticipantSerializer, SeasonDetailSerializer
from mcp_core.decorators import mcp_endpoint


class SeasonViewSet(viewsets.ModelViewSet):
    """ViewSet for managing seasons"""
    queryset = Season.objects.all()
    serializer_class = SeasonSerializer
    permission_classes = [permissions.AllowAny]  # Public access for viewing
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SeasonDetailSerializer
        return SeasonSerializer
    
    def get_permissions(self):
        """Only allow staff to create/update/delete seasons"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        queryset = Season.objects.all()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.prefetch_related('episodes', 'participants')
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get the current active season"""
        try:
            current_season = Season.objects.get(is_current=True)
            serializer = SeasonDetailSerializer(current_season)
            return Response({
                'sucesso': True,
                'dados': serializer.data
            })
        except Season.DoesNotExist:
            return Response({
                'sucesso': False,
                'mensagem': 'Nenhuma temporada ativa encontrada.'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def accepting_applications(self, request):
        """Get seasons accepting applications"""
        now = timezone.now()
        seasons = Season.objects.filter(
            registration_start__lte=now,
            registration_end__gte=now,
            status='registration_open'
        )
        serializer = self.get_serializer(seasons, many=True)
        return Response({
            'sucesso': True,
            'dados': serializer.data
        })
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get season statistics"""
        season = self.get_object()
        
        stats = {
            'total_participants': season.participants.count(),
            'total_episodes': season.episodes.count(),
            'completed_episodes': season.episodes.filter(status='completed').count(),
            'total_votes': 0,  # This would come from voting app
            'average_funding': season.participants.aggregate(
                avg_funding=Avg('funding_received')
            )['avg_funding'] or 0,
        }
        
        return Response({
            'sucesso': True,
            'dados': stats
        })


class EpisodeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing episodes"""
    queryset = Episode.objects.all()
    serializer_class = EpisodeSerializer
    permission_classes = [permissions.AllowAny]  # Public access for viewing
    
    def get_permissions(self):
        """Only allow staff to create/update/delete episodes"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
    
    def get_queryset(self):
        queryset = Episode.objects.all().select_related('season')
        
        # Filter by season if provided
        season_id = self.request.query_params.get('season', None)
        if season_id:
            queryset = queryset.filter(season_id=season_id)
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming episodes"""
        now = timezone.now()
        episodes = Episode.objects.filter(
            air_date__gt=now,
            status='upcoming'
        ).order_by('air_date')[:5]
        
        serializer = self.get_serializer(episodes, many=True)
        return Response({
            'sucesso': True,
            'dados': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def live(self, request):
        """Get currently live episodes"""
        episodes = Episode.objects.filter(status='live')
        serializer = self.get_serializer(episodes, many=True)
        return Response({
            'sucesso': True,
            'dados': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    @mcp_endpoint
    def watch(self, request, pk=None):
        """Increment view count when episode is watched"""
        episode = self.get_object()
        episode.view_count += 1
        episode.save(update_fields=['view_count'])
        
        return Response({
            'sucesso': True,
            'mensagem': 'Visualização registada.',
            'dados': {'view_count': episode.view_count}
        })
    
    @action(detail=True, methods=['post'])
    @mcp_endpoint
    def like(self, request, pk=None):
        """Increment like count for episode"""
        episode = self.get_object()
        episode.like_count += 1
        episode.save(update_fields=['like_count'])
        
        return Response({
            'sucesso': True,
            'mensagem': 'Like registado.',
            'dados': {'like_count': episode.like_count}
        })


class EpisodeParticipantViewSet(viewsets.ModelViewSet):
    """ViewSet for managing episode participants"""
    queryset = EpisodeParticipant.objects.all()
    serializer_class = EpisodeParticipantSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """Only allow staff to manage episode participants"""
        return [permissions.IsAdminUser()]
    
    def get_queryset(self):
        queryset = EpisodeParticipant.objects.all().select_related(
            'episode', 'participant', 'participant__user'
        )
        
        # Filter by episode if provided
        episode_id = self.request.query_params.get('episode', None)
        if episode_id:
            queryset = queryset.filter(episode_id=episode_id)
        
        return queryset
