from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'votes', views.VoteViewSet)

app_name = 'voting'

urlpatterns = [
    path('', include(router.urls)),
    path('vote/', views.CastVoteView.as_view(), name='cast_vote'),
    path('results/', views.VotingResultsView.as_view(), name='results'),
]
