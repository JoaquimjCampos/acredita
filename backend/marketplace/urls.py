from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    MarketplaceStatusView,
    ServiceCategoryViewSet,
    ServiceProviderViewSet,
    ServiceListingViewSet,
    ServiceOrderViewSet,
    MarketplaceReviewViewSet,
)

router = DefaultRouter()
router.register(r"categories", ServiceCategoryViewSet, basename="marketplace-category")
router.register(r"providers", ServiceProviderViewSet, basename="marketplace-provider")
router.register(r"listings", ServiceListingViewSet, basename="marketplace-listing")
router.register(r"orders", ServiceOrderViewSet, basename="marketplace-order")
router.register(r"reviews", MarketplaceReviewViewSet, basename="marketplace-review")

urlpatterns = [
    path("status/", MarketplaceStatusView.as_view(), name="marketplace-status"),
    path("", include(router.urls)),
]
