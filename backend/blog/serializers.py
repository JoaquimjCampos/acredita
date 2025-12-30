from rest_framework import serializers
from .models import BlogPost, BlogCategory


class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug', 'description']


class BlogPostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_username = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'author', 'author_name', 'author_username',
            'content', 'excerpt', 'featured_image', 'status',
            'meta_description', 'meta_keywords',
            'created_at', 'updated_at', 'published_at',
            'views_count', 'likes_count'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at', 'views_count', 'likes_count']
