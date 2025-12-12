from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import AdViewSet, ActiveAdsView

router = DefaultRouter()
router.register(r'', AdViewSet, basename='ads')

urlpatterns = [
    path('active/', ActiveAdsView.as_view(), name='active-ads'),
] + router.urls
