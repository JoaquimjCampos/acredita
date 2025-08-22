# Basic dashboard view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


# --- Dashboard View ---

from django.db import models

class ParticipantDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        # Example: get participant profile if exists
        participant = getattr(user, 'participant_profile', None)
        # Example stats (replace with real queries as needed)
        from seasons.models import Season, Episode
        from django.utils import timezone
        from .models import Participant

        total_participants = Participant.objects.count()
        total_votes = Participant.objects.aggregate(total=models.Sum('public_votes'))['total'] or 0
        current_season = Season.objects.order_by('-start_date').first()
        user_votes = participant.public_votes if participant else 0
        favorite_participant = participant.business_name if participant else None
        # Next episode (mocked)
        next_episode = None
        if current_season:
            next_ep = Episode.objects.filter(season=current_season, start_date__gte=timezone.now()).order_by('start_date').first()
            next_episode = next_ep.start_date.isoformat() if next_ep else None

        data = {
            "totalParticipants": total_participants,
            "totalVotes": total_votes,
            "currentSeason": str(current_season) if current_season else "",
            "userVotes": user_votes,
            "favoriteParticipant": favorite_participant,
            "nextEpisode": next_episode,
        }
        return Response(data)


# --- Recent Activity View ---
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import datetime

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
