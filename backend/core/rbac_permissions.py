"""
RBAC Permission Classes for Django REST Framework
Implementação de Role-Based Access Control para todos os endpoints
"""

from rest_framework import permissions
from django.contrib.auth import get_user_model

User = get_user_model()

# Import for Trust Score verification
try:
    from backend.accounts.models import UserTrustScore
except ImportError:
    UserTrustScore = None


class IsParticipant(permissions.BasePermission):
    """Permite apenas utilizadores com tipo 'participant'"""
    message = "Apenas participantes podem executar esta ação."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.user_type == 'participant'
        )


class IsMentor(permissions.BasePermission):
    """Permite apenas utilizadores com tipo 'mentor'"""
    message = "Apenas mentores podem executar esta ação."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.user_type == 'mentor'
        )


class IsVoter(permissions.BasePermission):
    """Permite apenas utilizadores com tipo 'voter'"""
    message = "Apenas eleitores podem executar esta ação."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.user_type == 'voter'
        )


class IsAdminUser(permissions.BasePermission):
    """Permite apenas administradores (is_staff)"""
    message = "Apenas administradores podem executar esta ação."

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff


class IsOwnerOrAdmin(permissions.BasePermission):
    """Permite owner do objeto ou admin"""
    message = "Apenas o proprietário ou administrador pode acessar isto."

    def has_object_permission(self, request, view, obj):
        # Owner ou Admin tem acesso total
        if request.user.is_staff:
            return True
        return obj.user == request.user


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Permite edição apenas pelo owner, leitura para todos autenticados"""

    def has_object_permission(self, request, view, obj):
        # Leitura para todos
        if request.method in permissions.SAFE_METHODS:
            return True
        # Escrita apenas para owner ou admin
        if request.user.is_staff:
            return True
        return obj.user == request.user


class CanCreateKixikila(permissions.BasePermission):
    """Permite criar Kixikila para usuários com Trust Score adequado
    
    Requisitos:
    - Participants/Mentors/Admins: acesso direto
    - Voters: Trust Score >= 20 + verificações
    """
    message = "Você precisa de Trust Score >= 20 e verificações para criar grupos Kixikila."

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Admins sempre têm acesso
        if request.user.is_staff:
            return True
        
        # Participants e Mentors têm acesso direto
        if request.user.user_type in ['participant', 'mentor', 'admin']:
            return True
        
        # Voters precisam verificar Trust Score
        if request.user.user_type == 'voter':
            try:
                trust_score = request.user.trust_score
                can_create = trust_score.can_create_kixikila_group()
                if not can_create:
                    self.message = f"Você precisa de Trust Score >= 20 (atual: {trust_score.total_score:.1f}) e verificações para criar grupos Kixikila."
                return can_create
            except Exception:
                return False
        
        return False


class CanCreateMarketplaceListing(permissions.BasePermission):
    """Permite criar listagens no marketplace para usuários com Trust Score adequado
    
    Requisitos:
    - Participants/Mentors/Admins: acesso direto
    - Voters: Trust Score >= 15 + verificações
    """
    message = "Você precisa de Trust Score >= 15 e verificações para criar listagens no marketplace."

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Admins sempre têm acesso
        if request.user.is_staff:
            return True
        
        # Participants e Mentors têm acesso direto
        if request.user.user_type in ['participant', 'mentor', 'admin']:
            return True
        
        # Voters precisam verificar Trust Score
        if request.user.user_type == 'voter':
            try:
                trust_score = request.user.trust_score
                can_create = trust_score.can_create_marketplace_listing()
                if not can_create:
                    self.message = f"Você precisa de Trust Score >= 15 (atual: {trust_score.total_score:.1f}), email e telefone verificados para criar listagens."
                return can_create
            except Exception:
                return False
        
        return False


class CanCreateCertificationCourse(permissions.BasePermission):
    """Permite criar cursos apenas para Mentors e Admins"""
    message = "Apenas mentores podem criar cursos de certificação."

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return (
            request.user
            and request.user.is_authenticated
            and request.user.user_type in ['mentor', 'admin']
        )


class CanCreateBlogPost(permissions.BasePermission):
    """Permite criar posts no blog para usuários com Trust Score adequado
    
    Requisitos:
    - Mentors/Admins: acesso direto, auto-publicação
    - Participants/Voters: Trust Score >= 25 para auto-publicação, < 25 = moderação
    """
    message = "Você precisa de Trust Score >= 25 para auto-publicar artigos no blog."

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Admins e Mentors sempre têm acesso
        if request.user.is_staff or request.user.user_type in ['mentor', 'admin']:
            return True
        
        # Participants e Voters podem criar, mas verificação de Trust Score 
        # determina se precisa moderação (implementado no serializer/view)
        if request.user.user_type in ['participant', 'voter']:
            return True  # Podem criar, moderação é automática se score < 25
        
        return False


class CanPublishContent(permissions.BasePermission):
    """Permite publicar conteúdo apenas para Mentors e Admins"""
    message = "Apenas mentores podem publicar conteúdo."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.user_type in ['mentor', 'admin']
        )


class CanModerateContent(permissions.BasePermission):
    """Permite moderar conteúdo apenas para Mentors e Admins"""
    message = "Apenas mentores podem moderar conteúdo."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.user_type in ['mentor', 'admin']
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """Permite escrita apenas para admins, leitura para todos autenticados"""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.is_staff


class ParticipantOrAdmin(permissions.BasePermission):
    """Permite acesso para Participants e Admins"""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.user_type in ['participant', 'admin']
        )


class MentorOrAdmin(permissions.BasePermission):
    """Permite acesso para Mentors e Admins"""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.user_type in ['mentor', 'admin']
        )
