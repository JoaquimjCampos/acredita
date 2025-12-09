"""
Sistema de Feature Flags - Controla ativação de novas funcionalidades
"""
from django.conf import settings
from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class FeatureFlag(Enum):
    """Enumeração de feature flags disponíveis"""
    CERTIFICATIONS = "certifications"
    MARKETPLACE = "marketplace"
    KIXIKILA = "kixikila"
    ADVANCED_PAYMENTS = "advanced_payments"


class FeatureFlagService:
    """Gerenciador centralizado de feature flags"""
    
    @staticmethod
    def is_enabled(flag_name, user=None):
        """
        Verifica se uma feature está ativada para um usuário específico
        
        Args:
            flag_name (str): Nome da feature flag
            user: Objeto User (opcional)
        
        Returns:
            bool: True se feature está ativada, False caso contrário
        """
        # Em desenvolvimento, tudo ativado por padrão
        if settings.DEBUG:
            logger.debug(f"Feature {flag_name} ENABLED (DEBUG mode)")
            return True
        
        # Admin sempre tem acesso a tudo
        if user and hasattr(user, 'is_staff') and user.is_staff:
            logger.info(f"Feature {flag_name} ENABLED (admin user: {user.username})")
            return True
        
        # Beta testers têm acesso
        if user and hasattr(user, 'groups'):
            try:
                if user.groups.filter(name='beta_testers').exists():
                    logger.info(f"Feature {flag_name} ENABLED (beta tester: {user.username})")
                    return True
            except Exception as e:
                logger.warning(f"Erro ao verificar beta_testers: {e}")
        
        # Verificar configuração de produção
        active_features = getattr(settings, 'ACTIVE_FEATURES', {})
        is_active = active_features.get(flag_name, False)
        
        if is_active:
            logger.debug(f"Feature {flag_name} ENABLED (ACTIVE_FEATURES setting)")
        else:
            logger.debug(f"Feature {flag_name} DISABLED")
        
        return is_active
    
    @staticmethod
    def get_enabled_features(user=None):
        """Retorna lista de features ativadas para um user"""
        enabled = []
        for flag in FeatureFlag:
            if FeatureFlagService.is_enabled(flag.value, user):
                enabled.append(flag.value)
        return enabled


def check_feature_flag(feature_name):
    """
    Decorator para proteger endpoints com feature flag
    
    Uso:
        @api_view(['GET'])
        @check_feature_flag('certifications')
        def my_view(request):
            return Response({'data': 'ok'})
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            if FeatureFlagService.is_enabled(feature_name, request.user):
                return view_func(request, *args, **kwargs)
            else:
                logger.warning(f"User {request.user} tentou acessar feature {feature_name} desativada")
                return Response(
                    {
                        'error': f'Funcionalidade "{feature_name}" não está disponível no momento',
                        'feature': feature_name
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
        return wrapped_view
    return decorator


def feature_flag_required(feature_name):
    """
    Class-based decorator para ViewSets/Classes
    
    Uso:
        @feature_flag_required('certifications')
        class MyCertificationsViewSet(ViewSet):
            ...
    """
    def decorator(view_class):
        original_dispatch = view_class.dispatch
        
        def new_dispatch(self, request, *args, **kwargs):
            if not FeatureFlagService.is_enabled(feature_name, request.user):
                logger.warning(f"User {request.user} tentou acessar view {view_class.__name__} com feature {feature_name} desativada")
                return Response(
                    {
                        'error': f'Funcionalidade "{feature_name}" não está disponível',
                        'feature': feature_name
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            return original_dispatch(self, request, *args, **kwargs)
        
        view_class.dispatch = new_dispatch
        return view_class
    
    return decorator
