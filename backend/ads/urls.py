from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import AdViewSet, ActiveAdsView

router = DefaultRouter()
router.register(r'ads', AdViewSet)

urlpatterns = router.urls + [
    path('ads/active/', ActiveAdsView.as_view(), name='active-ads'),
]
