from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'posts', views.BlogPostViewSet)

app_name = 'blog'

urlpatterns = [
    path('', include(router.urls)),
    path('latest/', views.LatestPostsView.as_view(), name='latest'),
]
