from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CrosswordViewSet, CrosswordSessionViewSet

router = DefaultRouter()
router.register(r'crosswords', CrosswordViewSet)
router.register(r'sessions', CrosswordSessionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
