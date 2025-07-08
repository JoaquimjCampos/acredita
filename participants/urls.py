"""
URLs para gestão de participantes - Sistema Acredita Angola
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ParticipantViewSet, ParticipantTaskViewSet

router = DefaultRouter()
router.register(r'participants', ParticipantViewSet)
router.register(r'tasks', ParticipantTaskViewSet)

app_name = 'participants'

urlpatterns = [
    path('api/', include(router.urls)),
]
