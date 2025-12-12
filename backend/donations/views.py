

from django.db import models
from rest_framework import viewsets, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import DonationCampaign
from .serializers import (
    DonationSerializer,
    DonationCampaignListSerializer,
    DonationCampaignDetailSerializer,
)


class DonationCampaignViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar e visualizar campanhas de doações.
    - GET /api/donations/campaigns/ - Lista campanhas ativas
    - GET /api/donations/campaigns/{id}/ - Detalhes de uma campanha
    
    Filtros disponíveis:
    - status: draft, active, paused, completed, cancelled
    - participant_id: ID do participante
    - season_id: ID da temporada
    """
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'participant', 'season']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'start_date', 'raised_amount', 'goal_amount']
    ordering = ['-created_at']

    def get_queryset(self):
        """Retorna campanhas baseado no status"""
        queryset = DonationCampaign.objects.all()
        
        # Por padrão, retorna apenas campanhas ativas (a menos que solicitado)
        status_param = self.request.query_params.get('status')
        if not status_param:
            queryset = queryset.filter(status='active')
        
        return queryset

    def get_serializer_class(self):
        """Usa serializers diferentes para list e retrieve"""
        if self.action == 'retrieve':
            return DonationCampaignDetailSerializer
        return DonationCampaignListSerializer

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Retorna apenas campanhas ativas"""
        campaigns = self.get_queryset().filter(status='active')
        serializer = DonationCampaignListSerializer(campaigns, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """Retorna o progresso de uma campanha específica"""
        campaign = self.get_object()
        return Response({
            'id': campaign.id,
            'title': campaign.title,
            'goal_amount': str(campaign.goal_amount),
            'raised_amount': str(campaign.raised_amount),
            'progress_percentage': float(campaign.progress_percentage),
            'donors_count': campaign.donors_count,
        })


class DonationTotalView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """Retorna o total de doações agregadas"""
        total = DonationCampaign.objects.filter(status='active').aggregate(
            total=models.Sum('raised_amount')
        )['total'] or 0
        return Response({"total": str(total)})


class MakeDonationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        """Placeholder para realizar uma doação (integração com payment gateway)"""
        return Response(
            {"message": "Donation functionality coming soon."},
            status=status.HTTP_501_NOT_IMPLEMENTED
        )


class DonationViewSet(viewsets.ModelViewSet):
    """ViewSet legado para compatibilidade"""
    queryset = DonationCampaign.objects.all()
    serializer_class = DonationSerializer

