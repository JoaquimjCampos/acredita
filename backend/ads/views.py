
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Ad
from .serializers import AdSerializer

class AdViewSet(viewsets.ModelViewSet):
    """CRUD de publicidades; leitura aberta, escrita autenticada."""
    queryset = Ad.objects.all()
    serializer_class = AdSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Permite filtrar ativos; padrão entrega apenas ads ativos em GET."""
        queryset = Ad.objects.all()
        if self.request.method.lower() == 'get':
            active = self.request.query_params.get('active', 'true').lower()
            if active == 'true':
                queryset = queryset.filter(active=True)
        return queryset

class ActiveAdsView(APIView):
    """Endpoint dedicado para listar publicidades ativas, público."""
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        page = request.query_params.get('page')
        ads = Ad.objects.filter(active=True)
        if page and page != 'all':
            ads = ads.filter(page__in=['all', page])
        serializer = AdSerializer(ads, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
