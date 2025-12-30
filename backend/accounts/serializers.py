from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile, UserTrustScore

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


class UserTrustScoreSerializer(serializers.ModelSerializer):
    """Serializer for UserTrustScore model"""
    
    total_score = serializers.ReadOnlyField()
    verification_breakdown = serializers.SerializerMethodField()
    engagement_breakdown = serializers.SerializerMethodField()
    creator_breakdown = serializers.SerializerMethodField()
    account_status = serializers.SerializerMethodField()
    milestones = serializers.SerializerMethodField()
    can_create_marketplace = serializers.ReadOnlyField(source='can_create_marketplace_listing')
    can_create_kixikila = serializers.ReadOnlyField(source='can_create_kixikila_group')
    can_publish_blog = serializers.ReadOnlyField(source='can_publish_article')
    
    class Meta:
        model = UserTrustScore
        fields = [
            'total_score',
            'verification_breakdown',
            'engagement_breakdown',
            'creator_breakdown',
            'account_status',
            'milestones',
            'can_create_marketplace',
            'can_create_kixikila',
            'can_publish_blog',
        ]
    
    def get_verification_breakdown(self, obj):
        """Return verification status and points (max 15)"""
        return {
            'email_verified': obj.email_verified,
            'phone_verified': obj.phone_verified,
            'profile_complete': obj.profile_complete,
            'points': (5 if obj.email_verified else 0) + 
                     (5 if obj.phone_verified else 0) + 
                     (5 if obj.profile_complete else 0),
            'max_points': 15,
        }
    
    def get_engagement_breakdown(self, obj):
        """Return engagement metrics and points (max 30)"""
        votes_pts = min(obj.votes_cast * 0.5, 10)
        content_pts = min(obj.content_published * 2, 10)
        feedback_pts = min(obj.positive_feedback_received, 10)
        
        return {
            'votes_cast': obj.votes_cast,
            'content_published': obj.content_published,
            'positive_feedback_received': obj.positive_feedback_received,
            'points': votes_pts + content_pts + feedback_pts,
            'max_points': 30,
        }
    
    def get_creator_breakdown(self, obj):
        """Return creator metrics and points (max 25)"""
        sales_pts = min(obj.sales_completed * 2, 10)
        rating_pts = obj.average_rating * 3 if obj.average_rating else 0
        dispute_penalty = min(obj.dispute_count * -2, -5)
        
        return {
            'sales_completed': obj.sales_completed,
            'average_rating': float(obj.average_rating) if obj.average_rating else 0,
            'dispute_count': obj.dispute_count,
            'points': max(sales_pts + rating_pts + dispute_penalty, 0),
            'max_points': 25,
        }
    
    def get_account_status(self, obj):
        """Return account age and flag status (max 10)"""
        age_pts = min(obj.account_age_days / 30, 10)
        flag_penalty = -10 if obj.last_flagged_date else 0
        
        return {
            'account_age_days': obj.account_age_days,
            'last_flagged_date': obj.last_flagged_date,
            'flag_reason': obj.flag_reason,
            'points': max(age_pts + flag_penalty, 0),
            'max_points': 10,
        }
    
    def get_milestones(self, obj):
        """Return milestone progress and requirements"""
        score = obj.total_score
        
        milestones = [
            {
                'name': 'Criar Listagens no Marketplace',
                'required_score': 15,
                'unlocked': score >= 15,
                'requirements': [
                    'Email verificado',
                    'Telefone verificado',
                    'Score mínimo: 15 pontos'
                ],
            },
            {
                'name': 'Criar Grupos Kixikila',
                'required_score': 20,
                'unlocked': score >= 20,
                'requirements': [
                    'Email verificado',
                    'Telefone verificado',
                    'Score mínimo: 20 pontos'
                ],
            },
            {
                'name': 'Publicar Artigos no Blog (auto-aprovado)',
                'required_score': 25,
                'unlocked': score >= 25,
                'requirements': [
                    'Perfil completo',
                    'Score mínimo: 25 pontos'
                ],
            },
        ]
        
        # Find next milestone
        next_milestone = None
        for milestone in milestones:
            if not milestone['unlocked']:
                next_milestone = milestone
                break
        
        return {
            'all': milestones,
            'next': next_milestone,
            'progress_to_next': next_milestone['required_score'] - score if next_milestone else 0,
        }

