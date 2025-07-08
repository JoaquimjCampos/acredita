"""
URLs para gestão de temporadas - Sistema Acredita Angola
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SeasonViewSet, EpisodeViewSet, EpisodeParticipantViewSet

router = DefaultRouter()
router.register(r'seasons', SeasonViewSet)
router.register(r'episodes', EpisodeViewSet)
router.register(r'episode-participants', EpisodeParticipantViewSet)

app_name = 'seasons'

urlpatterns = [
    path('api/', include(router.urls)),
]
