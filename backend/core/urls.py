from rest_framework.routers import DefaultRouter
from django.urls import path, include
from backend.core.views import MeDashboardViewSet


router = DefaultRouter()
router.register(r"me", MeDashboardViewSet, basename="core-me")

urlpatterns = [
    path("", include(router.urls)),
]
