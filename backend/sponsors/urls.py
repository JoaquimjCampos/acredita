from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'sponsors', views.SponsorViewSet, basename='sponsor')

app_name = 'sponsors'

urlpatterns = [
    path('', include(router.urls)),
]
