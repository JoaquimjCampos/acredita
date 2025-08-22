
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Ad
from .serializers import AdSerializer

class AdViewSet(viewsets.ModelViewSet):
    queryset = Ad.objects.all()
    serializer_class = AdSerializer

# Endpoint customizado para listar apenas publicidades ativas
class ActiveAdsView(APIView):
    def get(self, request, *args, **kwargs):
        page = request.query_params.get('page')
        ads = Ad.objects.filter(active=True)
        if page and page != 'all':
            ads = ads.filter(page__in=['all', page])
        serializer = AdSerializer(ads, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
