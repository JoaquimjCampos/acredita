
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GameViewSet, FeaturedGameView

router = DefaultRouter()
router.register(r'games', GameViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('featured/', FeaturedGameView.as_view(), name='featured-games'),
    path('quiz/', include('backend.games.quiz.urls')),
    path('simulator/', include('backend.games.simulator.urls')),
    path('association/', include('backend.games.association.urls')),
    path('crosswords/', include('backend.games.crosswords.urls')),
]
