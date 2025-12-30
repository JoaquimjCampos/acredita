# 📋 Exemplo: Refatorar CertificationsViewSet com RBAC

## Arquivo: `backend/certifications/views.py`

### ANTES (sem RBAC):

```python
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

class TrainingProgramViewSet(viewsets.ModelViewSet):
    queryset = TrainingProgram.objects.all()
    serializer_class = TrainingProgramSerializer
    permission_classes = [IsAuthenticated]
```

### DEPOIS (com RBAC):

```python
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from backend.core.rbac_permissions import (
    CanCreateCertificationCourse,
    IsOwnerOrReadOnly,
    IsOwnerOrAdmin,
)
from backend.core.models import AuditLog

class TrainingProgramViewSet(viewsets.ModelViewSet):
    """
    Programas de treinamento e certificação
    
    Permissões:
    - GET: Autenticado
    - POST: CanCreateCertificationCourse (Mentor ou Admin)
    - PUT/PATCH: Proprietário ou Admin
    - DELETE: Proprietário ou Admin
    """
    queryset = TrainingProgram.objects.all()
    serializer_class = TrainingProgramSerializer
    permission_classes = [IsAuthenticated]  # Default
    
    # 1️⃣ Permissões dinâmicas por método
    def get_permissions(self):
        """Permissões variam conforme a ação"""
        if self.action == 'create':
            # Apenas Mentors + Admins podem criar
            self.permission_classes = [CanCreateCertificationCourse]
        elif self.action in ['update', 'partial_update']:
            # Apenas proprietário ou admin pode editar
            self.permission_classes = [IsOwnerOrReadOnly]
        elif self.action == 'destroy':
            # Apenas proprietário ou admin pode deletar
            self.permission_classes = [IsOwnerOrAdmin]
        return super().get_permissions()
    
    # 2️⃣ Filtrar queryset por role
    def get_queryset(self):
        """Filtrar resultados conforme o role do usuário"""
        user = self.request.user
        
        # Não autenticados veem nada
        if not user.is_authenticated:
            return TrainingProgram.objects.none()
        
        # Admins veem tudo
        if user.is_staff:
            return TrainingProgram.objects.all()
        
        # Mentors veem tudo
        if user.user_type == 'mentor':
            return TrainingProgram.objects.all()
        
        # Outros veem apenas certificações públicas + suas encrições
        from django.db.models import Q
        from backend.certifications.models import CandidateEnrollment
        
        enrolled = CandidateEnrollment.objects.filter(
            candidate=user
        ).values_list('training_program_id', flat=True)
        
        return TrainingProgram.objects.filter(
            Q(is_published=True) | Q(id__in=enrolled)
        )
    
    # 3️⃣ Log de criação (auditoria)
    def perform_create(self, serializer):
        """Ao criar, registrar na auditoria"""
        program = serializer.save(instructor=self.request.user)
        
        # Log da ação
        AuditLog.log_action(
            user=self.request.user,
            action='create',
            resource='certifications',
            resource_id=program.id,
            method='POST',
            endpoint=self.request.path,
            status_code=201,
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            request_data=self.request.data,
            response_status='success'
        )
        
        logger.info(
            f"Created certification: {program.id} by {self.request.user}",
            extra={'user_id': self.request.user.id, 'program_id': program.id}
        )
    
    # 4️⃣ Log de update (auditoria)
    def perform_update(self, serializer):
        """Ao atualizar, registrar na auditoria"""
        program = serializer.save()
        
        AuditLog.log_action(
            user=self.request.user,
            action='update',
            resource='certifications',
            resource_id=program.id,
            method='PATCH' if self.request.method == 'PATCH' else 'PUT',
            endpoint=self.request.path,
            status_code=200,
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            request_data=self.request.data,
            response_status='success'
        )
    
    # 5️⃣ Log de delete (auditoria)
    def perform_destroy(self, instance):
        """Ao deletar, registrar na auditoria"""
        program_id = instance.id
        instance.delete()
        
        AuditLog.log_action(
            user=self.request.user,
            action='delete',
            resource='certifications',
            resource_id=program_id,
            method='DELETE',
            endpoint=self.request.path,
            status_code=204,
            ip_address=self._get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            response_status='success'
        )
    
    # 6️⃣ Helper para extrair IP do cliente
    def _get_client_ip(self):
        """Extrair IP do cliente (considerando proxy)"""
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip
```

## Mudanças Principais:

| Antes | Depois | Benefício |
|-------|--------|-----------|
| `permission_classes = [IsAuthenticated]` | `get_permissions()` dinâmico | Controle granular por ação |
| Sem filtro de queryset | `get_queryset()` filtra por role | Dados visíveis conforme role |
| Sem auditoria | `perform_create/update/destroy` com AuditLog | Rastreabilidade total |
| Sem logging | Log em cada ação | Debugging mais fácil |

## Padrão de Implementação:

### 1. Adicione imports:
```python
from backend.core.rbac_permissions import (
    CanCreateCertificationCourse,
    IsOwnerOrReadOnly,
    IsOwnerOrAdmin,
)
from backend.core.models import AuditLog
import logging

logger = logging.getLogger(__name__)
```

### 2. Implemente `get_permissions()`:
```python
def get_permissions(self):
    if self.action == 'create':
        self.permission_classes = [CanCreateCertificationCourse]
    elif self.action in ['update', 'partial_update']:
        self.permission_classes = [IsOwnerOrReadOnly]
    elif self.action == 'destroy':
        self.permission_classes = [IsOwnerOrAdmin]
    return super().get_permissions()
```

### 3. Implemente `get_queryset()`:
```python
def get_queryset(self):
    user = self.request.user
    if not user.is_authenticated:
        return YourModel.objects.none()
    if user.is_staff:
        return YourModel.objects.all()
    # Filtre conforme sua lógica
    return YourModel.objects.filter(user=user)
```

### 4. Implemente `perform_*()`:
```python
def perform_create(self, serializer):
    obj = serializer.save(user=self.request.user)
    AuditLog.log_action(
        user=self.request.user,
        action='create',
        resource='your_resource',
        resource_id=obj.id,
        method='POST',
        endpoint=self.request.path,
        status_code=201,
        ip_address=self._get_client_ip(),
        response_status='success'
    )
```

## ViewSets a Refatorar (Priority):

1. **blog/views.py** - BlogViewSet (CanCreateBlogPost)
2. **marketplace/views.py** - MarketplaceListingViewSet (CanCreateMarketplaceListing)
3. **games/views.py** - KixikilaViewSet (CanCreateKixikila)
4. **content/views.py** - ContentPostViewSet (CanPublishContent)

## Testing com Postman:

### Test POST (Create) - Eleitor (deve falhar):
```
POST /api/certifications/training-programs/
Authorization: Bearer <eleitor_token>
Content-Type: application/json

{
  "name": "Teste",
  "description": "Teste"
}

Response: 403 Permission Denied
```

### Test POST (Create) - Mentor (deve passar):
```
POST /api/certifications/training-programs/
Authorization: Bearer <mentor_token>
Content-Type: application/json

{
  "name": "Teste",
  "description": "Teste"
}

Response: 201 Created
```

## Verificação:

- ✅ Permission classes aplicadas
- ✅ Queryset filtrado por role
- ✅ AuditLog registrando ações
- ✅ Teste POST passando/falhando conforme esperado

---

**Próximo:** Repetir este padrão para os outros 3 ViewSets
