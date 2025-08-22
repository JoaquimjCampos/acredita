from rest_framework.pagination import PageNumberPagination

from django.db import models
from rest_framework import viewsets, serializers
from .models import Content
from .serializers import ContentSerializer
# ContentViewSet
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import filters
from django_filters.rest_framework import DjangoFilterBackend

class ContentPagination(PageNumberPagination):
    page_size = 5

class ContentViewSet(viewsets.ModelViewSet):
    pagination_class = ContentPagination
    queryset = Content.objects.select_related('author').all()
    serializer_class = ContentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "author", "is_active"]
    search_fields = ["title", "description", "tags"]
    ordering_fields = ["created_at", "updated_at", "title"]
    from rest_framework.parsers import MultiPartParser, FormParser
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminUser()]
        return [IsAuthenticated()]

from rest_framework.views import APIView
from rest_framework.response import Response

# Basic Podcast model
class Podcast(models.Model):
    title = models.CharField(max_length=200)
    audio_url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

# Basic Podcast serializer
class PodcastSerializer(serializers.ModelSerializer):
    class Meta:
        model = Podcast
        fields = '__all__'

# PodcastViewSet
class PodcastViewSet(viewsets.ModelViewSet):
    queryset = Podcast.objects.all()
    serializer_class = PodcastSerializer

# Basic Course model
class Course(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

# Basic Course serializer
class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = '__all__'

# CourseViewSet
class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

# Basic Video model
class Video(models.Model):
    title = models.CharField(max_length=200)
    url = models.URLField()
    created_at = models.DateTimeField(auto_now_add=True)

# Basic Video serializer
class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = '__all__'

# VideoViewSet
class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer


# FeaturedContentView (basic placeholder)
class FeaturedContentView(APIView):
    def get(self, request, *args, **kwargs):
        # Placeholder response
        return Response({"featured": []})
