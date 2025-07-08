"""
URLs para sistema de votação - Sistema Acredita Angola
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VotingSessionViewSet, VoteViewSet, VotingResultViewSet, VotingReportViewSet

router = DefaultRouter()
router.register(r'sessions', VotingSessionViewSet)
router.register(r'votes', VoteViewSet)
router.register(r'results', VotingResultViewSet)
router.register(r'reports', VotingReportViewSet)

app_name = 'voting'

urlpatterns = [
    path('api/', include(router.urls)),
]
