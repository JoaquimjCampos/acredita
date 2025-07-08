"""
Serializers para Autenticação e Utilizadores - Sistema Acredita Angola
Integração com MCP (Model Context Protocol)
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.conf import settings
from django.utils import timezone
from .models import UserProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer básico para utilizador"""
    
    formal_name = serializers.CharField(source='get_formal_name', read_only=True)
    formal_title = serializers.CharField(source='_get_formal_title', read_only=True)
    province_display = serializers.CharField(source='get_province_display', read_only=True)
    user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'mcp_id', 'username', 'email', 'first_name', 'last_name',
            'formal_name', 'formal_title', 'user_type', 'user_type_display',
            'phone_number', 'date_of_birth', 'province', 'province_display', 
            'city', 'profile_image', 'bio', 'is_verified', 'newsletter_subscription',
            'preferencia_comunicacao_formal', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'mcp_id', 'created_at', 'updated_at', 'is_verified']
    
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
