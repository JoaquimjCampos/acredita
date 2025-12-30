from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssociationViewSet, AssociationSessionViewSet

router = DefaultRouter()
router.register(r'associations', AssociationViewSet)
router.register(r'sessions', AssociationSessionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
