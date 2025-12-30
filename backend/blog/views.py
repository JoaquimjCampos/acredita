# Basic LatestPostsView for API
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

class LatestPostsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        # Placeholder logic for latest posts
        return Response({"latest": []})

from rest_framework import viewsets
from backend.mcp_core.permissions import IsMentorOrAdminOrReadOnly
from .models import BlogPost
from .serializers import BlogPostSerializer

# BlogPostViewSet
class BlogPostViewSet(viewsets.ModelViewSet):
    """
    BlogPost ViewSet com RBAC
    
    Permissões:
    - GET: Autenticado
    - POST: CanCreateBlogPost (Mentor ou Admin)
    - PUT/PATCH: Proprietário ou Admin
    - DELETE: Proprietário ou Admin
    """
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    permission_classes = [IsMentorOrAdminOrReadOnly]
    
    def get_permissions(self):
        """Permissões dinâmicas por método"""
        from backend.core.rbac_permissions import (
            CanCreateBlogPost,
            IsOwnerOrReadOnly,
            IsOwnerOrAdmin,
        )
        from rest_framework.permissions import IsAuthenticated
        
        if self.action == 'create':
            # Apenas Mentors + Admins podem criar
            self.permission_classes = [CanCreateBlogPost]
        elif self.action in ['update', 'partial_update']:
            # Apenas proprietário ou admin pode editar
            self.permission_classes = [IsOwnerOrReadOnly]
        elif self.action == 'destroy':
            # Apenas proprietário ou admin pode deletar
            self.permission_classes = [IsOwnerOrAdmin]
        else:
            # GET e outros usam autenticado
            self.permission_classes = [IsAuthenticated]
        
        return super().get_permissions()
    
    def get_queryset(self):
        """Filtrar queryset conforme o role do usuário"""
        from django.db.models import Q
        
        user = self.request.user
        
        # Não autenticados veem nada
        if not user.is_authenticated:
            return BlogPost.objects.none()
        
        # Admins veem tudo
        if user.is_staff:
            return BlogPost.objects.all()
        
        # Mentors veem tudo
        if hasattr(user, 'user_type') and user.user_type == 'mentor':
            return BlogPost.objects.all()
        
        # Outros veem apenas posts publicados + seus próprios
        return BlogPost.objects.filter(
            Q(is_published=True) | Q(author=user)
        ).distinct()
    
    def perform_create(self, serializer):
        """Ao criar, aplicar auto-moderação baseada no Trust Score e registrar na auditoria"""
        from backend.core.models import AuditLog
        import logging
        logger = logging.getLogger(__name__)

        user = self.request.user
        status_to_set = 'draft'
        # Auto-publicação se Trust Score >= 25
        if hasattr(user, 'trust_score') and user.trust_score.can_publish_article():
            status_to_set = 'published'

        post = serializer.save(author=user, status=status_to_set)

        # Log da ação
        AuditLog.log_action(
            user=user,
            action='create',
            resource='blog',
            resource_id=post.id,
            method='POST',
            endpoint=self.request.path,
            status_code=201,
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            request_data=dict(self.request.data) if self.request.data else {},
            response_status='success'
        )

        logger.info(
            f"Created blog post: {post.id} by {user} (status: {status_to_set})",
            extra={'user_id': user.id, 'post_id': post.id}
        )
    
    def perform_update(self, serializer):
        """Ao atualizar, registrar na auditoria"""
        from backend.core.models import AuditLog
        import logging
        
        logger = logging.getLogger(__name__)
        
        post = serializer.save()
        
        AuditLog.log_action(
            user=self.request.user,
            action='update',
            resource='blog',
            resource_id=post.id,
            method='PATCH' if self.request.method == 'PATCH' else 'PUT',
            endpoint=self.request.path,
            status_code=200,
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            request_data=dict(self.request.data) if self.request.data else {},
            response_status='success'
        )
        
        logger.info(
            f"Updated blog post: {post.id} by {self.request.user}",
            extra={'user_id': self.request.user.id, 'post_id': post.id}
        )
    
    def perform_destroy(self, instance):
        """Ao deletar, registrar na auditoria"""
        from backend.core.models import AuditLog
        import logging
        
        logger = logging.getLogger(__name__)
        
        post_id = instance.id
        instance.delete()
        
        AuditLog.log_action(
            user=self.request.user,
            action='delete',
            resource='blog',
            resource_id=post_id,
            method='DELETE',
            endpoint=self.request.path,
            status_code=204,
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            response_status='success'
        )
        
        logger.info(
            f"Deleted blog post: {post_id} by {self.request.user}",
            extra={'user_id': self.request.user.id, 'post_id': post_id}
        )
    
    def _get_client_ip(self):
        """Extrair IP do cliente (considerando proxy)"""
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip
from django.shortcuts import render

# Create your views here.
