"""
Middleware para RBAC: Validação de role em cada request
- Valida autenticação
- Registra acessos por role
- Detecta anomalias
"""

import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.conf import settings
import json

logger = logging.getLogger('rbac')


class RoleValidationMiddleware(MiddlewareMixin):
    """
    Middleware que valida role do usuário em cada request.
    
    Funcionalidades:
    - Valida se user_type é válido
    - Log de acessos por role
    - Detecta acessos não-autenticados a endpoints protegidos
    """

    VALID_USER_TYPES = ['voter', 'participant', 'mentor', 'admin']
    PROTECTED_PATHS = [
        '/api/certifications/create',
        '/api/marketplace/listings/create',
        '/api/blog/posts/create',
        '/api/kixikila/create',
    ]

    def process_request(self, request):
        """Processa cada request"""
        
        # Skip para requests não-API
        if not request.path.startswith('/api/'):
            return None

        user = request.user
        user_type = getattr(user, 'user_type', None) if user.is_authenticated else None

        # Log de acesso
        self._log_access(request, user_type)

        # Validação de role
        if user.is_authenticated and user_type and user_type not in self.VALID_USER_TYPES:
            logger.warning(
                f'Invalid user_type: {user_type} for user {user.id}',
                extra={'user_id': user.id, 'user_type': user_type}
            )
            return JsonResponse(
                {'error': 'Invalid user role'},
                status=400
            )

        return None

    def _log_access(self, request, user_type):
        """Log estruturado de acessos"""
        log_data = {
            'method': request.method,
            'path': request.path,
            'user_id': request.user.id if request.user.is_authenticated else None,
            'user_type': user_type,
            'ip_address': self._get_client_ip(request),
            'is_authenticated': request.user.is_authenticated,
        }
        
        # Diferentes níveis de log
        if not request.user.is_authenticated:
            logger.info(f'Unauthenticated access: {request.method} {request.path}')
        elif request.method not in ['GET', 'HEAD']:
            logger.info(f'Write access: {user_type} - {request.method} {request.path}')

    def _get_client_ip(self, request):
        """Extrai IP do cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
