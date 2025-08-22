from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'phone_number', 'date_of_birth', 'province',
            'city', 'profile_image', 'bio', 'is_verified',
            'newsletter_subscription', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'is_verified', 'date_joined', 'last_login']
    
    def validate_phone_number(self, value):
        if value and not value.startswith('+244'):
            raise serializers.ValidationError('Número de telefone deve ser angolano (+244)')
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    
    class Meta:
        model = UserProfile
        fields = [
            'facebook_url', 'instagram_url', 'linkedin_url', 'twitter_url',
            'language_preference', 'email_notifications', 'sms_notifications',
            'show_email', 'show_phone'
        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    terms_accepted = serializers.BooleanField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone_number', 'user_type',
            'province', 'city', 'terms_accepted'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password': 'As senhas não coincidem'})
        
        if not attrs.get('terms_accepted'):
            raise serializers.ValidationError({'terms_accepted': 'Deve aceitar os termos de uso'})
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        terms_accepted = validated_data.pop('terms_accepted')
        
        user = User.objects.create_user(**validated_data)
        user.terms_accepted = terms_accepted
        user.save()
        
        return user


class UserPublicSerializer(serializers.ModelSerializer):
    """Public serializer for User model (limited fields)"""
    
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'full_name', 'profile_image',
            'bio', 'province', 'city', 'is_verified'
        ]
