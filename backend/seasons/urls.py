from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import GlobalVoteAPIView



router = DefaultRouter()
router.register(r'seasons', views.SeasonViewSet)
router.register(r'episodes', views.EpisodeViewSet)

app_name = 'seasons'

urlpatterns = [
    path('', include(router.urls)),
    path('global-vote/', GlobalVoteAPIView.as_view(), name='global-vote'),
    path('current/', views.CurrentSeasonView.as_view(), name='current'),
]
