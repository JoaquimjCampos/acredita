
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Game
from .serializers import GameSerializer

from rest_framework import status

from rest_framework.permissions import IsAuthenticated

class GameViewSet(viewsets.ModelViewSet):
    """
    Game ViewSet com RBAC
    
    Permissões:
    - GET: Autenticado
    - POST: CanCreateKixikila (Participant ou Admin)
    - PUT/PATCH: Proprietário ou Admin
    - DELETE: Proprietário ou Admin
    """
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """Permissões dinâmicas por método"""
        from backend.core.rbac_permissions import (
            CanCreateKixikila,
            IsOwnerOrReadOnly,
            IsOwnerOrAdmin,
        )
        
        if self.action == 'create':
            # Apenas Participants + Admins podem criar
            self.permission_classes = [CanCreateKixikila]
        elif self.action in ['update', 'partial_update']:
            # Apenas proprietário ou admin pode editar
            self.permission_classes = [IsOwnerOrReadOnly]
        elif self.action == 'destroy':
            # Apenas proprietário ou admin pode deletar
            self.permission_classes = [IsOwnerOrAdmin]
        
        return super().get_permissions()
    
    def get_queryset(self):
        """Filtrar queryset conforme o role do usuário"""
        from django.db.models import Q
        
        user = self.request.user
        
        # Não autenticados veem nada
        if not user.is_authenticated:
            return Game.objects.none()
        
        # Admins veem tudo
        if user.is_staff:
            return Game.objects.all()
        
        # Participants veem tudo
        if hasattr(user, 'user_type') and user.user_type == 'participant':
            return Game.objects.all()
        
        # Mentors veem tudo
        if hasattr(user, 'user_type') and user.user_type == 'mentor':
            return Game.objects.all()
        
        # Outros veem apenas públicas
        return Game.objects.filter(is_active=True)
    
    def perform_create(self, serializer):
        """Ao criar, registrar na auditoria"""
        from backend.core.models import AuditLog
        import logging
        
        logger = logging.getLogger(__name__)
        
        game = serializer.save(creator=self.request.user)
        
        # Log da ação
        AuditLog.log_action(
            user=self.request.user,
            action='create',
            resource='kixikila',
            resource_id=game.id,
            method='POST',
            endpoint=self.request.path,
            status_code=201,
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            request_data=dict(self.request.data) if self.request.data else {},
            response_status='success'
        )
        
        logger.info(
            f"Created game (Kixikila): {game.id} by {self.request.user}",
            extra={'user_id': self.request.user.id, 'game_id': game.id}
        )
    
    def perform_update(self, serializer):
        """Ao atualizar, registrar na auditoria"""
        from backend.core.models import AuditLog
        import logging
        
        logger = logging.getLogger(__name__)
        
        game = serializer.save()
        
        AuditLog.log_action(
            user=self.request.user,
            action='update',
            resource='kixikila',
            resource_id=game.id,
            method='PATCH' if self.request.method == 'PATCH' else 'PUT',
            endpoint=self.request.path,
            status_code=200,
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            request_data=dict(self.request.data) if self.request.data else {},
            response_status='success'
        )
        
        logger.info(
            f"Updated game (Kixikila): {game.id} by {self.request.user}",
            extra={'user_id': self.request.user.id, 'game_id': game.id}
        )
    
    def perform_destroy(self, instance):
        """Ao deletar, registrar na auditoria"""
        from backend.core.models import AuditLog
        import logging
        
        logger = logging.getLogger(__name__)
        
        game_id = instance.id
        instance.delete()
        
        AuditLog.log_action(
            user=self.request.user,
            action='delete',
            resource='kixikila',
            resource_id=game_id,
            method='DELETE',
            endpoint=self.request.path,
            status_code=204,
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            response_status='success'
        )
        
        logger.info(
            f"Deleted game (Kixikila): {game_id} by {self.request.user}",
            extra={'user_id': self.request.user.id, 'game_id': game_id}
        )
    
    def _get_client_ip(self):
        """Extrair IP do cliente (considerando proxy)"""
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip

class FeaturedGameView(APIView):
    def get(self, request, *args, **kwargs):
        # Placeholder: return empty featured list
        return Response({"featured_games": []})


# Endpoint para /api/games/simulator/
class SimulatorGameListView(APIView):
    def get(self, request, *args, **kwargs):
        games = Game.objects.filter(type='simulator')
        data = [
            {
                'id': game.id,
                'title': game.title,
                'description': game.description
            }
            for game in games
        ]
        return Response(data, status=status.HTTP_200_OK)


# Endpoint para /api/games/association/
class AssociationGameListView(APIView):
    def get(self, request, *args, **kwargs):
        games = Game.objects.filter(type='association')
        data = [
            {
                'id': game.id,
                'title': game.title,
                'description': game.description
            }
            for game in games
        ]
        return Response(data, status=status.HTTP_200_OK)


# Endpoint para /api/games/crosswords/
class CrosswordsGameListView(APIView):
    def get(self, request, *args, **kwargs):
        games = Game.objects.filter(type='crosswords')
        data = [
            {
                'id': game.id,
                'title': game.title,
                'description': game.description
            }
            for game in games
        ]
        return Response(data, status=status.HTTP_200_OK)
