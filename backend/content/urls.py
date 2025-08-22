from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()
router.register(r'content', views.ContentViewSet)
router.register(r'videos', views.VideoViewSet)
router.register(r'courses', views.CourseViewSet)
router.register(r'podcasts', views.PodcastViewSet)

app_name = 'content'

urlpatterns = [
    path('', include(router.urls)),
    path('featured/', views.FeaturedContentView.as_view(), name='featured'),
]
