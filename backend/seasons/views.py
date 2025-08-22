from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from .models import Season, Episode, EpisodeParticipant
from .serializers import SeasonSerializer, EpisodeSerializer

# Basic CurrentSeasonView for API
class CurrentSeasonView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        current = Season.objects.filter(is_current=True).first()
        if current:
            data = SeasonSerializer(current).data
        else:
            data = {"detail": "No current season found."}
        return Response(data)


# Endpoint global de votação
class GlobalVoteAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        episode_id = request.data.get('episode_id')
        participant_id = request.data.get('participant_id')
        if not episode_id or not participant_id:
            return Response({'detail': 'episode_id e participant_id são obrigatórios.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            episode = Episode.objects.get(id=episode_id)
        except Episode.DoesNotExist:
            return Response({'detail': 'Episódio não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        if not episode.is_voting_active:
            return Response({'detail': 'Votação não está ativa para este episódio.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ep_part = EpisodeParticipant.objects.get(episode=episode, participant_id=participant_id)
        except EpisodeParticipant.DoesNotExist:
            return Response({'detail': 'Participante não está vinculado ao episódio.'}, status=status.HTTP_404_NOT_FOUND)

        # Incrementa votos (pode ser expandido para tracking por usuário/IP)
        if not hasattr(ep_part, 'vote_count'):
            ep_part.vote_count = 1
        else:
            ep_part.vote_count += 1
        ep_part.save()

        return Response({'detail': 'Voto registrado com sucesso.'}, status=status.HTTP_200_OK)



from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend

class EpisodeViewSet(viewsets.ModelViewSet):
    from rest_framework.decorators import action

    @action(detail=True, methods=['get'], url_path='votes', permission_classes=[AllowAny])
    def votes(self, request, pk=None):
        try:
            episode = Episode.objects.get(pk=pk)
        except Episode.DoesNotExist:
            return Response({'detail': 'Episódio não encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        participants = EpisodeParticipant.objects.filter(episode=episode)
        result = [
            {
                'participant_id': str(ep_part.participant_id),
                'vote_count': ep_part.vote_count,
            }
            for ep_part in participants
        ]
        return Response({'votes': result}, status=status.HTTP_200_OK)
    from rest_framework.decorators import action

    @action(detail=False, methods=['post'], url_path='bulk_soft_delete', permission_classes=[IsAdminUser])
    def bulk_soft_delete(self, request):
        ids = request.data.get('ids', [])
        user = request.user if request.user.is_authenticated else None
        updated = Episode.objects.filter(pk__in=ids).update(is_deleted=True)
        import logging
        logger = logging.getLogger('django')
        logger.info(f"User {user} performed bulk soft delete on episodes: {ids}")
        return Response({'updated': updated}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='bulk_restore', permission_classes=[IsAdminUser])
    def bulk_restore(self, request):
        ids = request.data.get('ids', [])
        user = request.user if request.user.is_authenticated else None
        updated = Episode.objects.filter(pk__in=ids).update(is_deleted=False)
        import logging
        logger = logging.getLogger('django')
        logger.info(f"User {user} performed bulk restore on episodes: {ids}")
        return Response({'updated': updated}, status=status.HTTP_200_OK)
    from django.utils.decorators import method_decorator
    from django.views.decorators.cache import cache_page

    @method_decorator(cache_page(60*5), name='list')
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def bulk_soft_delete(self, request):
        ids = request.data.get('ids', [])
        updated = Episode.objects.filter(pk__in=ids).update(is_deleted=True)
        return Response({'updated': updated}, status=status.HTTP_200_OK)

    def bulk_restore(self, request):
        ids = request.data.get('ids', [])
        updated = Episode.objects.filter(pk__in=ids).update(is_deleted=False)
        return Response({'updated': updated}, status=status.HTTP_200_OK)
    def get_permissions(self):
        if self.action in ['create', 'destroy', 'perform_bulk_create']:
            return [IsAdminUser()]
        return [IsAuthenticated()]
    queryset = Episode.objects.select_related('season').filter(is_deleted=False)
    serializer_class = EpisodeSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = {
        'season': ['exact'],
        'status': ['exact'],
        'voting_enabled': ['exact'],
        'air_date': ['exact', 'gte', 'lte'],
    }
    ordering_fields = ['air_date', 'episode_number', 'view_count', 'like_count']
    search_fields = ['title', 'description']
    throttle_scope = 'episodes'

    def create(self, request, *args, **kwargs):
        if isinstance(request.data, list):
            serializer = self.get_serializer(data=request.data, many=True)
            serializer.is_valid(raise_exception=True)
            self.perform_bulk_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        return super().create(request, *args, **kwargs)

    def perform_bulk_create(self, serializer):
        serializer.save()

class SeasonViewSet(viewsets.ModelViewSet):
    queryset = Season.objects.all()
    serializer_class = SeasonSerializer
