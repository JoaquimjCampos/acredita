from rest_framework import serializers

class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = None  # Placeholder, update with BlogPost model when available
        fields = '__all__'
