# Basic LatestPostsView for API
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

class LatestPostsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        # Placeholder logic for latest posts
        return Response({"latest": []})
from rest_framework import viewsets
from rest_framework import serializers
from django.db import models

# Basic BlogPost model
class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

# Basic BlogPost serializer
class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = '__all__'

# BlogPostViewSet
class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
from django.shortcuts import render

# Create your views here.
