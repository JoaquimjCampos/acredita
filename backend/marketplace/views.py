"""Marketplace API views (versão inicial)."""

from rest_framework import viewsets, mixins, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from backend.core.feature_flags import check_feature_flag, feature_flag_required, FeatureFlagService
from .models import (
    ServiceCategory,
    ServiceProvider,
    ServiceListing,
    ServiceOrder,
    MarketplaceReview,
)
from .serializers import (
    ServiceCategorySerializer,
    ServiceProviderSerializer,
    ServiceListingSerializer,
    ServiceListingCreateUpdateSerializer,
    ServiceOrderSerializer,
    MarketplaceReviewSerializer,
)


@feature_flag_required("marketplace")
class MarketplaceStatusView(APIView):
    """Returns marketplace feature flag status for quick health checks."""

    permission_classes = []  # allow anonymous health checks

    def get(self, request, *args, **kwargs):
        enabled = FeatureFlagService.is_enabled("marketplace", user=request.user)
        return Response({
            "feature": "marketplace",
            "enabled": enabled,
        })


@feature_flag_required("marketplace")
class ServiceCategoryViewSet(mixins.ListModelMixin,
                             mixins.RetrieveModelMixin,
                             viewsets.GenericViewSet):
    queryset = ServiceCategory.objects.filter(is_active=True)
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.AllowAny]


@feature_flag_required("marketplace")
class ServiceProviderViewSet(mixins.ListModelMixin,
                             mixins.RetrieveModelMixin,
                             viewsets.GenericViewSet):
    queryset = ServiceProvider.objects.select_related("user", "professional_category").prefetch_related("categories")
    serializer_class = ServiceProviderSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = [
        "provider_type",
        "province",
        "municipality",
        "verified",
        "professional_category",
    ]
    search_fields = ["business_name", "description", "professional_category__name"]
    ordering_fields = ["-verified", "-rating", "business_name"]
    
    @action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
    def certified(self, request):
        """List INEFOB-certified providers."""
        certified = self.queryset.filter(professional_category__isnull=False, verified=True)
        serializer = self.get_serializer(certified, many=True)
        return Response(serializer.data)


@feature_flag_required("marketplace")
class ServiceListingViewSet(viewsets.ModelViewSet):
    """
    ServiceListing ViewSet com RBAC
    
    Permissões:
    - GET: AllowAny (público)
    - POST: CanCreateMarketplaceListing (Participant ou Admin)
    - PUT/PATCH: Proprietário ou Admin
    - DELETE: Proprietário ou Admin
    """
    queryset = ServiceListing.objects.select_related("provider", "category").prefetch_related("provider__categories")
    serializer_class = ServiceListingSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = [
        "category",
        "provider",
        "price_type",
        "available",
        "listing_type",
        "provider__professional_category",
    ]
    search_fields = ["title", "description", "tags", "sku", "provider__business_name"]
    ordering_fields = ["-featured", "-views", "created_at", "base_price"]

    def get_serializer_class(self):
        """Use write serializer for create/update actions."""
        if self.action in ["create", "update", "partial_update"]:
            return ServiceListingCreateUpdateSerializer
        return ServiceListingSerializer

    def get_permissions(self):
        """Permissões dinâmicas por método com RBAC"""
        from backend.core.rbac_permissions import (
            CanCreateMarketplaceListing,
            IsOwnerOrReadOnly,
            IsOwnerOrAdmin,
        )
        from rest_framework.permissions import IsAuthenticated
        
        if self.action == 'create':
            # Apenas Participants + Admins podem criar
            return [CanCreateMarketplaceListing()]
        elif self.action in ['update', 'partial_update']:
            # Apenas proprietário ou admin pode editar
            return [IsOwnerOrReadOnly()]
        elif self.action == 'destroy':
            # Apenas proprietário ou admin pode deletar
            return [IsOwnerOrAdmin()]
        elif self.action in ['mark_featured', 'unmark_featured']:
            # Admin only
            return [permissions.IsAdminUser()]
        
        # GET e outros - permitir públicos
        return super().get_permissions()

    def get_queryset(self):
        """Filtrar queryset conforme o role do usuário"""
        from django.db.models import Q
        
        user = self.request.user
        
        # Todos veem listing públicas
        base_queryset = ServiceListing.objects.select_related("provider", "category").prefetch_related("provider__categories")
        
        if not user.is_authenticated:
            # Não autenticados veem apenas públicas
            return base_queryset.filter(available=True)
        
        # Admins veem tudo
        if user.is_staff:
            return base_queryset
        
        # Participants veem tudo + suas próprias
        if hasattr(user, 'user_type') and user.user_type == 'participant':
            provider = getattr(user, 'service_provider', None)
            if provider:
                return base_queryset.filter(
                    Q(available=True) | Q(provider=provider)
                ).distinct()
        
        # Outros veem apenas públicas
        return base_queryset.filter(available=True)

    def perform_create(self, serializer):
        """Ao criar, registrar na auditoria"""
        from backend.core.models import AuditLog
        import logging
        
        logger = logging.getLogger(__name__)
        
        # Ensure provider is set from request user; auto-create provider if needed
        provider = getattr(self.request.user, "service_provider", None)
        if not provider:
            # Auto-create a basic ServiceProvider for the user
            from .models import ServiceProvider
            provider = ServiceProvider.objects.create(
                user=self.request.user,
                business_name=self.request.user.username or "Prestador",
                business_type="Freelancer",
                province="Luanda",
                municipality="Luanda",
            )
        
        listing = serializer.save(provider=provider)
        
        # Log da ação
        AuditLog.log_action(
            user=self.request.user,
            action='create',
            resource='marketplace',
            resource_id=listing.id,
            method='POST',
            endpoint=self.request.path,
            status_code=201,
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            request_data=dict(self.request.data) if self.request.data else {},
            response_status='success'
        )
        
        logger.info(
            f"Created marketplace listing: {listing.id} by {self.request.user}",
            extra={'user_id': self.request.user.id, 'listing_id': listing.id}
        )

    def perform_update(self, serializer):
        """Ao atualizar, registrar na auditoria"""
        from backend.core.models import AuditLog
        import logging
        
        logger = logging.getLogger(__name__)
        
        listing = serializer.save()
        
        AuditLog.log_action(
            user=self.request.user,
            action='update',
            resource='marketplace',
            resource_id=listing.id,
            method='PATCH' if self.request.method == 'PATCH' else 'PUT',
            endpoint=self.request.path,
            status_code=200,
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            request_data=dict(self.request.data) if self.request.data else {},
            response_status='success'
        )
        
        logger.info(
            f"Updated marketplace listing: {listing.id} by {self.request.user}",
            extra={'user_id': self.request.user.id, 'listing_id': listing.id}
        )

    def perform_destroy(self, instance):
        """Ao deletar, registrar na auditoria"""
        from backend.core.models import AuditLog
        import logging
        
        logger = logging.getLogger(__name__)
        
        listing_id = instance.id
        instance.delete()
        
        AuditLog.log_action(
            user=self.request.user,
            action='delete',
            resource='marketplace',
            resource_id=listing_id,
            method='DELETE',
            endpoint=self.request.path,
            status_code=204,
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            response_status='success'
        )
        
        logger.info(
            f"Deleted marketplace listing: {listing_id} by {self.request.user}",
            extra={'user_id': self.request.user.id, 'listing_id': listing_id}
        )

    def _get_client_ip(self):
        """Extrair IP do cliente (considerando proxy)"""
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def mark_featured(self, request, pk=None):
        """Mark listing as featured (admin only)."""
        listing = self.get_object()
        if not request.user.is_staff:
            return Response(
                {"error": "Apenas administradores podem marcar como destaque"},
                status=status.HTTP_403_FORBIDDEN
            )
        listing.featured = True
        listing.save()
        return Response({"status": "listing marked as featured"})
    
    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def reduce_stock(self, request, pk=None):
        """Reduce product stock (products only)."""
        listing = self.get_object()
        if listing.listing_type != "product":
            return Response(
                {"error": "Ação disponível apenas para produtos"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        quantity = request.data.get("quantity", 1)
        if listing.quantity_available is None or listing.quantity_available < quantity:
            return Response(
                {"error": "Estoque insuficiente"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        listing.quantity_available -= quantity
        listing.save()
        return Response({"quantity_available": listing.quantity_available})



@feature_flag_required("marketplace")
class ServiceOrderViewSet(mixins.ListModelMixin,
                          mixins.RetrieveModelMixin,
                          viewsets.GenericViewSet):
    queryset = ServiceOrder.objects.select_related("listing", "customer")
    serializer_class = ServiceOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):  # restrict to own orders
        qs = super().get_queryset()
        return qs.filter(customer=self.request.user)


@feature_flag_required("marketplace")
class MarketplaceReviewViewSet(mixins.ListModelMixin,
                               mixins.RetrieveModelMixin,
                               viewsets.GenericViewSet):
    queryset = MarketplaceReview.objects.select_related("order", "order__listing")
    serializer_class = MarketplaceReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(order__customer=self.request.user)
