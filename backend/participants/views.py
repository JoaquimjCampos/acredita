# Basic dashboard view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import models
from backend.seasons.models import Season, Episode
from django.utils import timezone

# --- Dashboard View ---

class ParticipantDashboardView(APIView):
    permission_classes = [AllowAny]  # Métricas públicas para HomePage

    def get(self, request, *args, **kwargs):
        user = request.user if request.user.is_authenticated else None
        # Example: get participant profile if exists
        participant = getattr(user, 'participant_profile', None) if user else None
        # Example stats (replace with real queries as needed)
        from .models import Participant

        total_participants = Participant.objects.count()
        total_votes = Participant.objects.aggregate(total=models.Sum('public_votes'))['total'] or 0
        current_season = Season.objects.order_by('-start_date').first()
        user_votes = participant.public_votes if participant else 0
        favorite_participant = participant.business_name if participant else None
        # Next episode (mocked)
        next_episode = None
        if current_season:
            next_ep = Episode.objects.filter(season=current_season, air_date__gte=timezone.now()).order_by('air_date').first()
            next_episode = next_ep.air_date.isoformat() if next_ep else None

        # Build leaderboard for RankingPage
        participants = Participant.objects.filter(
            status__in=['active', 'approved']
        ).select_related('user', 'season').order_by('-public_votes')

        leaderboard = []
        for idx, p in enumerate(participants, start=1):
            leaderboard.append({
                'id': p.id,
                'posicao': idx,
                'nome': p.user.full_name if hasattr(p.user, 'full_name') else p.user.username,
                'provincia': getattr(p.user, 'province', 'N/A'),
                'idade': getattr(p.user, 'age', 0),
                'foto_perfil': p.user.profile_picture.url if hasattr(p.user, 'profile_picture') and p.user.profile_picture else None,
                'total_votos': p.public_votes,
                'votos_semana': 0,  # TODO: implement weekly votes tracking
                'variacao_posicao': 0,  # TODO: implement position change tracking
                'percentual_votos': round((p.public_votes / total_votes * 100), 2) if total_votes > 0 else 0,
            })

        data = {
            "totalParticipants": total_participants,
            "totalVotes": total_votes,
            "currentSeason": str(current_season) if current_season else "",
            "userVotes": user_votes,
            "favoriteParticipant": favorite_participant,
            "nextEpisode": next_episode,
            "leaderboard": leaderboard,
        }
        return Response(data)


# --- Recent Activity View ---
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import datetime
from backend.seasons.models import Season, Episode

class RecentActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Mocked recent activity data (replace with real queries)
        now = datetime.datetime.now()
        activity = [
            {
                "id": "1",
                "type": "vote",
                "description": "Você votou em Maria Silva.",
                "timestamp": (now - datetime.timedelta(hours=2)).isoformat(),
                "participantName": "Maria Silva"
            },
            {
                "id": "2",
                "type": "donation",
                "description": "Você doou 5000 Kz para João Pedro.",
                "timestamp": (now - datetime.timedelta(days=1)).isoformat(),
                "participantName": "João Pedro"
            },
            {
                "id": "3",
                "type": "episode",
                "description": "Novo episódio disponível!",
                "timestamp": (now - datetime.timedelta(days=2)).isoformat(),
            },
        ]
        return Response({"results": activity}, status=status.HTTP_200_OK)

from rest_framework import viewsets
from .models import Participant
from .serializers import ParticipantSerializer

from rest_framework import generics, status
from rest_framework.response import Response

class ParticipantViewSet(viewsets.ModelViewSet):
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer


# Basic registration view
class ParticipantRegistrationView(generics.CreateAPIView):
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
