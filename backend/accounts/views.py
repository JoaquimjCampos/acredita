
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Single custom serializer to allow login with username or email, with logging and print debug
class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        import logging
        logger = logging.getLogger("acredita.accounts")
        username_or_email = attrs.get('username')
        password = attrs.get('password')
        User = get_user_model()
        print(f"[DEBUG] Login attempt for: {username_or_email}")
        logger.info(f"[DEBUG] Login attempt for: {username_or_email}")
        user = User.objects.filter(username=username_or_email).first()
        if not user:
            print(f"[DEBUG] No user found by username, trying email: {username_or_email}")
            logger.info(f"[DEBUG] No user found by username, trying email: {username_or_email}")
            user = User.objects.filter(email=username_or_email).first()
        print(f"[DEBUG] User found: {user.username if user else None}")
        logger.info(f"[DEBUG] User found: {user.username if user else None}")
        if user:
            attrs['username'] = user.username
            # Check password
            if not user.check_password(password):
                print(f"[DEBUG] Password mismatch for user: {user.username}")
                logger.warning(f"[DEBUG] Password mismatch for user: {user.username}")
            else:
                print(f"[DEBUG] Password correct for user: {user.username}")
                logger.info(f"[DEBUG] Password correct for user: {user.username}")
        else:
            print(f"[DEBUG] No user found for: {username_or_email}")
            logger.warning(f"[DEBUG] No user found for: {username_or_email}")
        try:
            result = super().validate(attrs)
            print(f"[DEBUG] super().validate returned: {result}")
            logger.info(f"[DEBUG] super().validate returned: {result}")
            return result
        except Exception as e:
            print(f"[DEBUG] Exception in super().validate: {e}")
            logger.error(f"[DEBUG] Exception in super().validate: {e}")
            raise




# Single custom login view using the above serializer
class LoginView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer
    def post(self, request, *args, **kwargs):
        import logging
        logger = logging.getLogger("acredita.accounts")
        logger.info("LoginView POST data: %s", request.data)
        response = super().post(request, *args, **kwargs)
        logger.info("LoginView RESPONSE: %s", response.status_code)
        return response
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import UserProfile
from .serializers import UserSerializer, UserProfileSerializer, UserRegistrationSerializer

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User management"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
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


class UserProfileView(APIView):
    """View for user profile management"""
    permission_classes = [IsAuthenticated]
    
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


import logging

logger = logging.getLogger("acredita.accounts")

class RegisterView(APIView):
    """User registration view"""
    permission_classes = [AllowAny]

    def post(self, request):
        logger.info("RegisterView POST data: %s", request.data)
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Create profile
            UserProfile.objects.create(user=user)
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            logger.info("RegisterView SUCCESS for user: %s", user.username)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        logger.warning("RegisterView ERRORS: %s", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
