
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Game
from .serializers import GameSerializer

from rest_framework import status

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer

class FeaturedGameView(APIView):
    def get(self, request, *args, **kwargs):
        # Placeholder: return empty featured list
        return Response({"featured_games": []})


# Endpoint para /api/games/simulator/
class SimulatorGameListView(APIView):
    def get(self, request, *args, **kwargs):
        games = Game.objects.filter(type='simulator')
        data = [
            {
                'id': game.id,
                'title': game.title,
                'description': game.description
            }
            for game in games
        ]
        return Response(data, status=status.HTTP_200_OK)


# Endpoint para /api/games/association/
class AssociationGameListView(APIView):
    def get(self, request, *args, **kwargs):
        games = Game.objects.filter(type='association')
        data = [
            {
                'id': game.id,
                'title': game.title,
                'description': game.description
            }
            for game in games
        ]
        return Response(data, status=status.HTTP_200_OK)
