"""
Views para Autenticação e Gestão de Utilizadores - Sistema Acredita Angola
Integração completa com MCP (Model Context Protocol)
"""

from rest_framework import generics, status, permissions, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model
from django.conf import settings
from datetime import datetime
import logging

from .models import User, UserProfile
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer, 
    UserProfileSerializer
)
from mcp_core.middleware import mcp_endpoint
from mcp_core import MCPProtocol, mcp_handler

logger = logging.getLogger(__name__)
User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    """ViewSet para gestão de utilizadores com integração MCP"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Users can only see their own profile unless they're staff"""
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        """Get or update current user profile"""
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        elif request.method == 'PATCH':
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get user dashboard data"""
        user = request.user
        
        # Get user basic info
        user_data = UserSerializer(user).data
        
        # Get user statistics
        dashboard_data = {
            'user': user_data,
            'statistics': {
                'account_created': user.created_at,
                'last_login': user.last_login,
                'profile_completion': self._calculate_profile_completion(user),
                'is_participant': hasattr(user, 'participant_profile'),
                'notifications_count': 0,  # This could be enhanced
                'achievements': [],  # This could be enhanced
            },
            'quick_actions': [
                {'name': 'Completar Perfil', 'url': '/profile/', 'completed': user.bio and user.profile_image},
                {'name': 'Candidatar-se', 'url': '/participants/', 'available': not hasattr(user, 'participant_profile')},
                {'name': 'Ver Temporadas', 'url': '/seasons/', 'available': True},
                {'name': 'Votar', 'url': '/voting/', 'available': True},
            ],
            'recent_activity': [],  # This could be enhanced with actual activity
        }
        
        return Response({
            'sucesso': True,
            'mensagem': f'Bem-vindo, {user.get_formal_name()}!',
            'dados': dashboard_data
        })
    
    def _calculate_profile_completion(self, user):
        """Calculate profile completion percentage"""
        fields_to_check = [
            'first_name', 'last_name', 'email', 'phone_number', 
            'bio', 'profile_image', 'province', 'city'
        ]
        
        completed_fields = sum(1 for field in fields_to_check if getattr(user, field, None))
        return round((completed_fields / len(fields_to_check)) * 100)

class UserProfileView(APIView):
    """View for user profile management"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            profile = request.user.profile
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({'detail': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def patch(self, request):
        try:
            profile = request.user.profile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=request.user)
        
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(APIView):
    """User registration view"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Create profile
            UserProfile.objects.create(user=user)
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
