from rest_framework import serializers
from .models import Content

class ContentSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        # media_url required for certain categories
        if attrs.get("category") in ["Education", "Entertainment"] and not attrs.get("media_url"):
            raise serializers.ValidationError({"media_url": "Media URL is required for Education or Entertainment content."})

        # feedback cannot contain banned words
        banned_words = ["spam", "offensive", "banned"]
        feedback = attrs.get("feedback", "")
        for word in banned_words:
            if word in feedback.lower():
                raise serializers.ValidationError({"feedback": f"Feedback contains banned word: {word}"})

        # author must be active user
        author = attrs.get("author")
        if author and hasattr(author, "is_active") and not author.is_active:
            raise serializers.ValidationError({"author": "Author must be an active user."})

        # prevent duplicate content titles per author
        title = attrs.get("title")
        if author and title:
            from .models import Content
            existing = Content.objects.filter(title=title, author=author)
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise serializers.ValidationError({"title": "This author already has content with this title."})

        # require feedback for inactive content
        if attrs.get("is_active") is False and not feedback:
            raise serializers.ValidationError({"feedback": "Feedback is required when content is inactive."})

        # enforce minimum tag count for News category
        if attrs.get("category") == "News":
            tags = [tag.strip() for tag in attrs.get("tags", "").split(",") if tag.strip()]
            if len(tags) < 2:
                raise serializers.ValidationError({"tags": "At least 2 tags are required for News content."})

        return attrs
    def validate_title(self, value):
        if not value:
            raise serializers.ValidationError("Title is required.")
        if len(value) > 100:
            raise serializers.ValidationError("Title must be 100 characters or less.")
        return value

    def validate_description(self, value):
        if not value:
            raise serializers.ValidationError("Description is required.")
        return value

    def validate_category(self, value):
        allowed_categories = ["Education", "Entertainment", "News", "Sports", "Other"]
        if value and value not in allowed_categories:
            raise serializers.ValidationError(f"Category must be one of: {', '.join(allowed_categories)}.")
        return value

    def validate_tags(self, value):
        tags = [tag.strip() for tag in value.split(",") if tag.strip()]
        if not tags:
            raise serializers.ValidationError("At least one tag is required.")
        if any("," in tag for tag in tags):
            raise serializers.ValidationError("Tags must not contain commas.")
        if len(set(tags)) != len(tags):
            raise serializers.ValidationError("Tags must be unique.")
        return value
    def validate_media_url(self, value):
        if value:
            allowed_extensions = [".jpg", ".jpeg", ".png", ".gif", ".mp4", ".webm"]
            if not any(value.lower().endswith(ext) for ext in allowed_extensions):
                raise serializers.ValidationError("Media URL must be an image or video file.")
        return value

    def validate_feedback(self, value):
        if value and len(value) > 500:
            raise serializers.ValidationError("Feedback must be 500 characters or less.")
        return value
    def validate_tags(self, value):
        # Ensure tags are comma-separated and not empty
        tags = [tag.strip() for tag in value.split(",") if tag.strip()]
        if not tags:
            raise serializers.ValidationError("At least one tag is required.")
        if any("," in tag for tag in tags):
            raise serializers.ValidationError("Tags must not contain commas.")
        return value
    class Meta:
        model = Content
        fields = [
            "id",
            "title",
            "description",
            "category",
            "tags",
            "author",
            "media_url",
            "media_file",
            "feedback",
            "is_active",
            "created_at",
            "updated_at",
        ]
from rest_framework import serializers

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = None  # Placeholder, update with Video model when available
        fields = '__all__'
