from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Sponsor
from .serializers import SponsorSerializer


class SponsorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar e visualizar patrocinadores.
    - GET /api/sponsors/ - Lista todos os patrocinadores ativos
    - GET /api/sponsors/{id}/ - Detalhes de um patrocinador específico
    
    Permite filtrar por tipo (sponsor, partner, supporter).
    """
    # Public endpoint: skip auth to avoid 401 when stale/invalid tokens are sent
    authentication_classes = []
    permission_classes = [AllowAny]
    serializer_class = SponsorSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['sponsor_type', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['order', 'name', 'created_at']
    ordering = ['order', 'name']

    def get_queryset(self):
        """
        Retorna apenas patrocinadores ativos por padrão.
        Admins podem ver todos usando query param ?is_active=false
        """
        queryset = Sponsor.objects.all()
        is_active = self.request.query_params.get('is_active', 'true')
        
        if is_active.lower() == 'true':
            queryset = queryset.filter(is_active=True)
        
        return queryset
