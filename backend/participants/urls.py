from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views_kixikila import ParticipantFundingViewSet

router = DefaultRouter()
router.register(r'participants', views.ParticipantViewSet)
router.register(r'funding', ParticipantFundingViewSet, basename='participant-funding')

app_name = 'participants'

urlpatterns = [
    path('', include(router.urls)),
    # Explicit route for funding dashboard action to avoid 404 in some deployments
    path('funding/my-funding/', ParticipantFundingViewSet.as_view({'get': 'my_funding'}), name='participant-funding-my'),
    path('register/', views.ParticipantRegistrationView.as_view(), name='register'),
    path('dashboard/', views.ParticipantDashboardView.as_view(), name='dashboard'),
    path('activity/', views.RecentActivityView.as_view(), name='activity'),
]
