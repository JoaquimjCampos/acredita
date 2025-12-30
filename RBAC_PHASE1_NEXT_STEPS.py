"""
PHASE 1 BACKEND - Próximos passos (30 min - 1h)
"""

# 1. CRIAR MIGRATIONS DOS NOVOS MODELOS
# Abrir terminal e executar:
# 
# python manage.py makemigrations core
# python manage.py migrate

# 2. REGISTRAR MODELOS NO ADMIN

# Arquivo: backend/core/admin.py
# Adicionar no final:

from django.contrib import admin
from .models import AuditLog, RoleTransition

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'resource', 'status_code', 'user_role', 'timestamp')
    list_filter = ('action', 'user_role', 'timestamp', 'status_code')
    search_fields = ('user__username', 'resource', 'endpoint')
    readonly_fields = ('timestamp', 'user', 'action', 'resource', 'request_data')
    date_hierarchy = 'timestamp'

@admin.register(RoleTransition)
class RoleTransitionAdmin(admin.ModelAdmin):
    list_display = ('user', 'from_role', 'to_role', 'status', 'requested_at')
    list_filter = ('status', 'requested_at')
    search_fields = ('user__username',)
    readonly_fields = ('requested_at',)


# 3. EXECUTAR SETUP DE PERMISSIONS
#
# python manage.py setup_rbac_permissions

# 4. ADICIONAR MIDDLEWARE AO SETTINGS.PY
#
# Em MIDDLEWARE list, adicionar APÓS SessionMiddleware e AuthenticationMiddleware:
# 'backend.core.rbac_middleware.RoleValidationMiddleware',

# 5. CONFIGURAR LOGGING PARA RBAC
#
# Em LOGGING dict, adicionar:
# 'rbac': {
#     'handlers': ['file', 'console'],
#     'level': 'INFO',
#     'propagate': True,
# },
#
# E adicionar handler 'file':
# 'file': {
#     'level': 'INFO',
#     'class': 'logging.FileHandler',
#     'filename': os.path.join(BASE_DIR, 'logs', 'rbac.log'),
#     'formatter': 'verbose',
# },


# 6. REFACTORING DE VIEWSETS (Dia 2-3)
#
# Vamos refatorar cada ViewSet para usar as Permission Classes
#
# Exemplo para CertificationsViewSet (backend/certifications/views.py):
#
# from backend.core.rbac_permissions import CanCreateCertificationCourse, IsOwnerOrReadOnly
#
# class CertificationsViewSet(viewsets.ModelViewSet):
#     queryset = Certifications.objects.all()
#     serializer_class = CertificationsSerializer
#     
#     # Adicionar permission_classes
#     permission_classes = [IsAuthenticated]
#     
#     def get_permissions(self):
#         """
#         Permissões dinâmicas por método
#         - GET: IsAuthenticated
#         - POST: CanCreateCertificationCourse (apenas Mentors + Admins)
#         - PUT/PATCH: IsOwnerOrReadOnly
#         - DELETE: IsOwnerOrAdmin
#         """
#         if self.action == 'create':
#             self.permission_classes = [CanCreateCertificationCourse]
#         elif self.action in ['update', 'partial_update']:
#             self.permission_classes = [IsOwnerOrReadOnly]
#         elif self.action == 'destroy':
#             self.permission_classes = [IsOwnerOrAdmin]
#         return super().get_permissions()
#     
#     def get_queryset(self):
#         \"\"\"Filtrar por role\"\"\"
#         user = self.request.user
#         
#         if not user.is_authenticated:
#             return Certifications.objects.none()
#         
#         # Admins veem tudo
#         if user.is_staff:
#             return Certifications.objects.all()
#         
#         # Outros veem apenas certificações publicadas + suas próprias
#         from django.db.models import Q
#         return Certifications.objects.filter(
#             Q(is_published=True) | Q(instructor=user)
#         )
#     
#     # Log de auditoria
#     def perform_create(self, serializer):
#         cert = serializer.save(instructor=self.request.user)
#         AuditLog.log_action(
#             user=self.request.user,
#             action='create',
#             resource='certifications',
#             resource_id=cert.id,
#             method='POST',
#             endpoint='/api/certifications/',
#             status_code=201,
#             ip_address=self._get_client_ip(),
#             response_status='success'
#         )
#     
#     def _get_client_ip(self):
#         x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
#         if x_forwarded_for:
#             return x_forwarded_for.split(',')[0]
#         return self.request.META.get('REMOTE_ADDR')


# 7. PRÓXIMOS VIEWSETS A REFATORAR:

# Dia 2:
# - backend/blog/views.py (BlogViewSet) -> IsMentor para create
# - backend/marketplace/views.py (MarketplaceViewSet) -> IsParticipant para create/sell
# - backend/games/views.py (KixikilaViewSet) -> IsParticipant para create

# Dia 3:
# - Testar cada ViewSet
# - Adicionar testes de permission

# 8. VERIFICAR SETTINGS.PY
#
# Garantir que estas apps estão em INSTALLED_APPS:
# INSTALLED_APPS = [
#     # ... outras apps ...
#     'backend.accounts',
#     'backend.core',
#     'backend.content',
#     'backend.blog',
#     'backend.certifications',  # ou similar
#     'backend.marketplace',  # ou similar
#     'backend.games',
#     'rest_framework',
#     'rest_framework_simplejwt',
# ]
#
# E que settings de REST Framework estão configurados:
# REST_FRAMEWORK = {
#     'DEFAULT_AUTHENTICATION_CLASSES': (
#         'rest_framework_simplejwt.authentication.JWTAuthentication',
#     ),
#     'DEFAULT_PERMISSION_CLASSES': (
#         'rest_framework.permissions.IsAuthenticated',
#     ),
# }

# 9. TESTAR NO POSTMAN/INSOMNIA
#
# Criar testes para verificar cada role:
#
# Teste 1: Eleitor (Voter)
# GET /api/certifications/ -> ✅ OK
# POST /api/certifications/ -> ❌ 403 Permission Denied
#
# Teste 2: Participante (Participant) 
# GET /api/marketplace/ -> ✅ OK
# POST /api/marketplace/listings/ -> ✅ OK
# POST /api/certifications/ -> ❌ 403 Permission Denied
#
# Teste 3: Mentor
# GET /api/certifications/ -> ✅ OK
# POST /api/certifications/ -> ✅ OK
# POST /api/blog/ -> ✅ OK
# POST /api/marketplace/listings/ -> ✅ OK
#
# Teste 4: Administrador
# Tudo ✅
#
# 10. DEPOIS: CONFIGURAR FRONTEND
#
# Atualizar settings para integrar com backend:
# - usePermissions hook já está pronto (vai usar estas permissions)
# - ProtectedRoute já está pronto (vai bloquear se 403)
# - Adaptive Navigation (próxima fase)

print("✅ RBAC Backend Phase 1 preparado!")
