from rest_framework.pagination import PageNumberPagination
from django.db import models
from rest_framework import viewsets, serializers, filters, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend

from .models import Content, Video, Podcast, Course
from .serializers import (
    ContentSerializer,
    VideoSerializer,
    PodcastSerializer,
    CourseSerializer,
)


class ContentPagination(PageNumberPagination):
    page_size = 5


class ContentViewSet(viewsets.ModelViewSet):
    """ViewSet para conteúdo editorial"""
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


class VideoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar e visualizar vídeos.
    - GET /api/content/videos/ - Lista todos os vídeos ativos
    - GET /api/content/videos/{id}/ - Detalhes de um vídeo específico
    
    Filtros disponíveis:
    - video_type: entrevista, pitch, aula, tutorial, outro
    - is_active: true, false
    """
    permission_classes = [AllowAny]
    queryset = Video.objects.filter(is_active=True)
    serializer_class = VideoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['video_type', 'is_active']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'views_count']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'])
    def increment_views(self, request, pk=None):
        """Incrementa o contador de visualizações"""
        video = self.get_object()
        video.views_count += 1
        video.save()
        return Response({'views_count': video.views_count})


class PodcastViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar e visualizar podcasts.
    - GET /api/content/podcasts/ - Lista todos os podcasts ativos
    - GET /api/content/podcasts/{id}/ - Detalhes de um podcast específico
    """
    permission_classes = [AllowAny]
    queryset = Podcast.objects.filter(is_active=True)
    serializer_class = PodcastSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at']
    ordering = ['-created_at']


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar e visualizar cursos.
    - GET /api/content/courses/ - Lista todos os cursos ativos
    - GET /api/content/courses/{id}/ - Detalhes de um curso específico
    
    Filtros disponíveis:
    - level: beginner, intermediate, advanced
    """
    permission_classes = [AllowAny]
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['level', 'is_active']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'duration_hours']
    ordering = ['-created_at']


class FeaturedContentView(APIView):
    """Retorna conteúdo em destaque (vídeos, podcasts, cursos)"""
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        featured_videos = Video.objects.filter(is_active=True).order_by('-views_count')[:3]
        featured_podcasts = Podcast.objects.filter(is_active=True)[:3]
        featured_courses = Course.objects.filter(is_active=True)[:3]

        return Response({
            'featured_videos': VideoSerializer(featured_videos, many=True).data,
            'featured_podcasts': PodcastSerializer(featured_podcasts, many=True).data,
            'featured_courses': CourseSerializer(featured_courses, many=True).data,
        })

