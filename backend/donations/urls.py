from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'donations', views.DonationViewSet)
router.register(r'campaigns', views.DonationCampaignViewSet, basename='campaign')

app_name = 'donations'

urlpatterns = [
    path('', include(router.urls)),
    path('donate/', views.MakeDonationView.as_view(), name='make_donation'),
    path('total/', views.DonationTotalView.as_view(), name='total'),
]
