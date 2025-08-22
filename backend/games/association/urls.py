from django.urls import path
from backend.games.views import AssociationGameListView

urlpatterns = [
    path('', AssociationGameListView.as_view(), name='association-games-list'),
]
