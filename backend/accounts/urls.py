from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'trust', views.UserTrustScoreViewSet, basename='trust-score')

app_name = 'accounts'

urlpatterns = [
    path('', include(router.urls)),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('register/', views.RegisterView.as_view(), name='register'),
]

