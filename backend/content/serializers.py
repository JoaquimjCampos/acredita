from rest_framework import serializers
from .models import Content, Video, Podcast, Course


class ContentSerializer(serializers.ModelSerializer):
    """Serializer para conteúdo editorial"""
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    
    class Meta:
        model = Content
        fields = [
            'id',
            'title',
            'description',
            'category',
            'tags',
            'author',
            'author_name',
            'media_url',
            'media_file',
            'feedback',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_title(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Título é obrigatório.")
        if len(value) > 255:
            raise serializers.ValidationError("Título não pode exceder 255 caracteres.")
        return value

    def validate_description(self, value):
        if value and len(value.strip()) == 0:
            raise serializers.ValidationError("Descrição não pode ser vazia.")
        return value

    def validate_category(self, value):
        allowed_categories = ['Education', 'Entertainment', 'News', 'Sports', 'Other']
        if value and value not in allowed_categories:
            raise serializers.ValidationError(
                f"Categoria deve ser uma de: {', '.join(allowed_categories)}"
            )
        return value


class VideoSerializer(serializers.ModelSerializer):
    """Serializer para vídeos educativos"""
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    video_type_display = serializers.CharField(source='get_video_type_display', read_only=True)

    class Meta:
        model = Video
        fields = [
            'id',
            'title',
            'description',
            'url',
            'thumbnail',
            'video_type',
            'video_type_display',
            'duration',
            'author',
            'author_name',
            'views_count',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'views_count', 'created_at', 'updated_at']

    def validate_title(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Título do vídeo é obrigatório.")
        if len(value) > 255:
            raise serializers.ValidationError("Título não pode exceder 255 caracteres.")
        return value

    def validate_url(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("URL do vídeo é obrigatória.")
        return value


class PodcastSerializer(serializers.ModelSerializer):
    """Serializer para podcasts"""
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)

    class Meta:
        model = Podcast
        fields = [
            'id',
            'title',
            'description',
            'audio_url',
            'thumbnail',
            'duration',
            'author',
            'author_name',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_title(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Título do podcast é obrigatório.")
        return value

    def validate_audio_url(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("URL de áudio é obrigatória.")
        return value


class CourseSerializer(serializers.ModelSerializer):
    """Serializer para cursos"""
    instructor_name = serializers.CharField(source='instructor.get_full_name', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)

    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'description',
            'instructor',
            'instructor_name',
            'thumbnail',
            'duration_hours',
            'level',
            'level_display',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_title(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Título do curso é obrigatório.")
        return value

    def validate_description(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Descrição do curso é obrigatória.")
        return value

    def validate_duration_hours(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Duração deve ser maior que zero.")
        return value
