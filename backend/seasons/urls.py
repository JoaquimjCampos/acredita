from django.urls import path, include
from rest_framework.routers import SimpleRouter
from . import views
from .views import GlobalVoteAPIView, SeasonViewSet, EpisodeViewSet

# Use SimpleRouter instead of DefaultRouter to avoid extra routes
episodes_router = SimpleRouter()
episodes_router.register(r'', EpisodeViewSet, basename='episodes')

# SimpleRouter for seasons
seasons_router = SimpleRouter()
seasons_router.register(r'', SeasonViewSet, basename='seasons')

app_name = 'seasons'

urlpatterns = [
    path('episodes/', include(episodes_router.urls)),  # Episodes at /api/seasons/episodes/
    path('', include(seasons_router.urls)),            # Seasons at /api/seasons/
    path('global-vote/', GlobalVoteAPIView.as_view(), name='global-vote'),
    path('current/', views.CurrentSeasonView.as_view(), name='current'),
]
