
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

# Single custom serializer to allow login with username or email, with logging and print debug
class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        import logging
        logger = logging.getLogger("acredita.accounts")
        username_or_email = attrs.get('username')
        password = attrs.get('password')
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

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import UserProfile, UserTrustScore
from .serializers import (
    UserSerializer, 
    UserProfileSerializer, 
    UserRegistrationSerializer,
    UserTrustScoreSerializer
)

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


class UserTrustScoreViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Trust Score management"""
    queryset = UserTrustScore.objects.all()
    serializer_class = UserTrustScoreSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def request_phone_verification(self, request):
        """Gera código, salva e envia SMS de verificação"""
        import random, string
        from django.utils import timezone
        # Para produção, integrar com Twilio ou outro serviço SMS
        trust_score = request.user.trust_score
        if trust_score.phone_verified:
            return Response({'message': 'Telefone já está verificado.'}, status=status.HTTP_200_OK)
        code = ''.join(random.choices(string.digits, k=6))
        trust_score.phone_verification_code = code
        trust_score.phone_verification_sent_at = timezone.now()
        trust_score.save()
        # Mock envio SMS
        phone = request.user.phone_number
        # Aqui você integraria com Twilio, etc. Exemplo:
        # send_sms(phone, f'Seu código de verificação é: {code}')
        print(f"[MOCK SMS] Código enviado para {phone}: {code}")
        return Response({'message': f'Código enviado para o telefone {phone}.'})

    @action(detail=False, methods=['post'])
    def confirm_phone_verification(self, request):
        """Valida código recebido e marca telefone como verificado"""
        code = request.data.get('code')
        trust_score = request.user.trust_score
        if trust_score.phone_verified:
            return Response({'message': 'Telefone já está verificado.'}, status=status.HTTP_200_OK)
        if not trust_score.phone_verification_code:
            return Response({'error': 'Nenhum código solicitado.'}, status=status.HTTP_400_BAD_REQUEST)
        if not code:
            return Response({'error': 'Código não informado.'}, status=status.HTTP_400_BAD_REQUEST)
        if code == trust_score.phone_verification_code:
            trust_score.phone_verified = True
            trust_score.phone_verification_code = ''
            trust_score.save()
            return Response({'message': 'Telefone verificado com sucesso!', 'points_gained': 5, 'new_score': trust_score.total_score})
        else:
            return Response({'error': 'Código inválido.'}, status=status.HTTP_400_BAD_REQUEST)

    def get_queryset(self):
        """Users can only see their own trust score unless they're staff"""
        if self.request.user.is_staff:
            return UserTrustScore.objects.all()
        return UserTrustScore.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_trust(self, request):
        """Get current user's trust score with detailed breakdown"""
        try:
            trust_score = request.user.trust_score
        except UserTrustScore.DoesNotExist:
            # Auto-create if missing (shouldn't happen with signals)
            trust_score = UserTrustScore.objects.create(user=request.user)

        serializer = self.get_serializer(trust_score)
        data = serializer.data

        # Add user context
        data['user_type'] = request.user.user_type
        data['username'] = request.user.username

        # Add action recommendations
        recommendations = []
        
        if not trust_score.email_verified:
            recommendations.append({
                'action': 'verify_email',
                'title': 'Verificar Email',
                'description': 'Ganhe 5 pontos ao verificar o seu email',
                'points': 5,
                'priority': 'high'
            })
        
        if not trust_score.phone_verified:
            recommendations.append({
                'action': 'verify_phone',
                'title': 'Verificar Telefone',
                'description': 'Ganhe 5 pontos ao verificar o seu número de telefone',
                'points': 5,
                'priority': 'high'
            })
        
        if not trust_score.profile_complete:
            recommendations.append({
                'action': 'complete_profile',
                'title': 'Completar Perfil',
                'description': 'Preencha todos os campos do perfil para ganhar 5 pontos',
                'points': 5,
                'priority': 'medium'
            })
        
        if trust_score.votes_cast < 20:
            recommendations.append({
                'action': 'cast_votes',
                'title': 'Votar em Conteúdos',
                'description': 'Participe votando. Cada voto = 0.5 pontos (máx 10pts)',
                'points': 0.5,
                'priority': 'low'
            })
        
        if trust_score.content_published < 5:
            recommendations.append({
                'action': 'publish_content',
                'title': 'Publicar Conteúdo',
                'description': 'Publique comentários, posts, artigos. Cada item = 2 pontos (máx 10pts)',
                'points': 2,
                'priority': 'medium'
            })
        
        data['recommendations'] = recommendations
        
        return Response(data)
    
    @action(detail=False, methods=['post'])
    def verify_email(self, request):
        """Mark email as verified (normally handled by email verification flow)"""
        try:
            trust_score = request.user.trust_score
            if not trust_score.email_verified:
                trust_score.email_verified = True
                trust_score.save()
                return Response({
                    'message': 'Email verificado com sucesso!',
                    'points_gained': 5,
                    'new_score': trust_score.total_score
                })
            return Response({
                'message': 'Email já estava verificado.'
            }, status=status.HTTP_200_OK)
        except UserTrustScore.DoesNotExist:
            return Response({
                'error': 'Trust score não encontrado.'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['post'])
    def verify_phone(self, request):
        """Mark phone as verified (normally handled by SMS verification flow)"""
        try:
            trust_score = request.user.trust_score
            if not trust_score.phone_verified:
                trust_score.phone_verified = True
                trust_score.save()
                return Response({
                    'message': 'Telefone verificado com sucesso!',
                    'points_gained': 5,
                    'new_score': trust_score.total_score
                })
            return Response({
                'message': 'Telefone já estava verificado.'
            }, status=status.HTTP_200_OK)
        except UserTrustScore.DoesNotExist:
            return Response({
                'error': 'Trust score não encontrado.'
            }, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def request_email_verification(self, request):
        """Gera código, salva e envia email de verificação"""
        import random, string
        from django.core.mail import send_mail
        from django.conf import settings
        from django.utils import timezone

        trust_score = request.user.trust_score
        if trust_score.email_verified:
            return Response({'message': 'Email já está verificado.'}, status=status.HTTP_200_OK)

        # Gerar código
        code = ''.join(random.choices(string.digits, k=6))
        trust_score.email_verification_code = code
        trust_score.email_verification_sent_at = timezone.now()
        trust_score.save()

        # Enviar email
        subject = 'Seu código de verificação de email - Acredita'
        message = f'Seu código de verificação é: {code}\n\nDigite este código na plataforma para confirmar seu email.'
        recipient = request.user.email
        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [recipient], fail_silently=False)
            return Response({'message': 'Código enviado para seu email.'})
        except Exception as e:
            return Response({'error': f'Erro ao enviar email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def confirm_email_verification(self, request):
        """Valida código recebido e marca email como verificado"""
        code = request.data.get('code')
        trust_score = request.user.trust_score
        if trust_score.email_verified:
            return Response({'message': 'Email já está verificado.'}, status=status.HTTP_200_OK)
        if not trust_score.email_verification_code:
            return Response({'error': 'Nenhum código solicitado.'}, status=status.HTTP_400_BAD_REQUEST)
        if not code:
            return Response({'error': 'Código não informado.'}, status=status.HTTP_400_BAD_REQUEST)
        # Verificar validade do código (opcional: checar timestamp)
        if code == trust_score.email_verification_code:
            trust_score.email_verified = True
            trust_score.email_verification_code = ''
            trust_score.save()
            return Response({'message': 'Email verificado com sucesso!', 'points_gained': 5, 'new_score': trust_score.total_score})
        else:
            return Response({'error': 'Código inválido.'}, status=status.HTTP_400_BAD_REQUEST)

