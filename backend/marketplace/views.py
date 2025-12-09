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
    queryset = ServiceProvider.objects.select_related("user").prefetch_related("categories")
    serializer_class = ServiceProviderSerializer
    permission_classes = [permissions.AllowAny]


@feature_flag_required("marketplace")
class ServiceListingViewSet(viewsets.ModelViewSet):
    queryset = ServiceListing.objects.select_related("provider", "category").prefetch_related("provider__categories")
    serializer_class = ServiceListingSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ["category", "provider", "price_type", "available"]
    search_fields = ["title", "description", "tags"]
    ordering_fields = ["created_at", "views", "featured", "base_price"]

    def get_serializer_class(self):
        """Use write serializer for create/update actions."""
        if self.action in ["create", "update", "partial_update"]:
            return ServiceListingCreateUpdateSerializer
        return ServiceListingSerializer

    def get_permissions(self):
        """Restrict write to authenticated users with service_provider."""
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

    def perform_create(self, serializer):
        """Ensure provider is set from request user."""
        if not hasattr(self.request.user, "service_provider"):
            return Response(
                {"error": "Deve criar um perfil de prestador primeiro"},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save()

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
