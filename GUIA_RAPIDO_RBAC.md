# 🚀 Guia Rápido: Implementação RBAC (Role-Based Access Control)

**Status:** Pronto para Começar  
**Prioridade:** 🔴 Crítica  
**Esforço:** ~15 dias (2-3 semanas)

---

## 📋 Checklist de Início

### Dia 1: Setup Inicial

- [ ] Revisar `ANALISE_FLUXOS_UTILIZADOR.md` (45 min)
- [ ] Sprint Planning: Quebrar Fase 1 em tasks (1h)
- [ ] Criar branch: `feature/rbac-implementation` (5 min)
- [ ] Setup de testes: pytest + fixtures (1h)

### Dia 2-3: Backend Phase 1 Part A

#### Setup de Permissões (4h)

```bash
# 1. Criar fixture de permissões
touch backend/accounts/fixtures/permissions.py

# 2. Criar management command
python manage.py makemigrations accounts
python manage.py migrate

# 3. Popular groups
python manage.py setup_permissions
```

**Arquivo: `backend/accounts/fixtures/permissions.py`**
```python
from django.contrib.auth.models import Permission, Group
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Setup RBAC groups and permissions'
    
    def handle(self, *args, **options):
        # Criar grupos
        groups = ['Participante', 'Eleitor', 'Mentor', 'Administrador']
        for group_name in groups:
            Group.objects.get_or_create(name=group_name)
        
        self.stdout.write(self.style.SUCCESS('✓ Grupos criados'))
        
        # Adicionar permissões...
        # (Código completo em ANALISE_FLUXOS_UTILIZADOR.md)
```

#### Criar Permission Classes (4h)

```bash
touch backend/core/permissions.py
```

**Arquivo: `backend/core/permissions.py`**
```python
from rest_framework import permissions

class IsParticipant(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.user_type == 'participant'

class IsMentor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.user_type == 'mentor'

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_staff
```

---

### Dia 4-5: Backend Phase 1 Part B

#### Refatorar ViewSets (4h por módulo)

**Exemplo: Certifications**

```python
# backend/certifications/views.py

class CertificationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [permissions.IsAuthenticated(), IsMentor()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Certification.objects.all()
        if self.request.user.user_type == 'mentor':
            return Certification.objects.filter(instructor=self.request.user)
        return Certification.objects.filter(status='published')
```

**Módulos a refatorar:**
- [ ] `certifications/` (Mentor-only create)
- [ ] `blog/` (Mentor-only create)
- [ ] `marketplace/` (Participant-only list own)
- [ ] `kixikila/` (Participant-only create)
- [ ] `core/` (Validações)

---

### Dia 6-7: Frontend Phase 2

#### 1. usePermissions Hook (2h)

```bash
touch frontend/src/hooks/usePermissions.ts
```

```typescript
import { useAuth } from '../contexts/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();
  
  return {
    isMentor: user?.user_type === 'mentor',
    isParticipant: user?.user_type === 'participant',
    isAdmin: user?.user_type === 'admin',
    isVoter: user?.user_type === 'voter' || !user?.user_type,
    canCreateBlog: ['mentor', 'admin'].includes(user?.user_type),
    canCreateKixikila: ['participant', 'admin'].includes(user?.user_type),
    canSellMarketplace: ['participant', 'admin'].includes(user?.user_type),
    canCreateCourse: ['mentor', 'admin'].includes(user?.user_type),
  };
};
```

#### 2. ProtectedRoute Estendida (2h)

```bash
# Modificar arquivo existente
# frontend/src/components/auth/ProtectedRoute.tsx
```

```tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'mentor' | 'participant' | 'admin' | 'voter';
  requiredPermission?: keyof ReturnType<typeof usePermissions>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission
}) => {
  const { isAuthenticated, user } = useAuth();
  const perms = usePermissions();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  if (requiredRole && user?.user_type !== requiredRole) {
    return <AccessDenied />;
  }
  
  if (requiredPermission && !perms[requiredPermission]) {
    return <AccessDenied />;
  }
  
  return <>{children}</>;
};
```

#### 3. Navegação Adaptativa (2h)

```tsx
// frontend/src/components/layout/Layout.tsx

import { usePermissions } from '../../hooks/usePermissions';

const Navigation = () => {
  const perms = usePermissions();
  
  const items = [
    { label: 'Dashboard', path: '/dashboard', show: true },
    { label: 'Votação', path: '/voting', show: true },
    { label: 'Meu Kixikila', path: '/kixikila', show: perms.isParticipant },
    { label: 'Minha Loja', path: '/marketplace/provider', show: perms.canSellMarketplace },
    { label: 'Meus Cursos', path: '/certifications/mine', show: perms.canCreateCourse },
    { label: 'Publicar', path: '/blog/create', show: perms.canCreateBlog },
    { label: 'Admin', path: '/admin', show: perms.isAdmin },
  ];
  
  return (
    <nav>
      {items.filter(i => i.show).map(item => (
        <Link key={item.path} to={item.path}>{item.label}</Link>
      ))}
    </nav>
  );
};
```

---

### Dia 8-10: Testing & Refinements

#### Backend Tests

```bash
mkdir -p backend/tests/test_permissions
touch backend/tests/test_permissions/test_rbac.py
```

```python
# backend/tests/test_permissions/test_rbac.py

import pytest
from rest_framework.test import APIClient
from backend.accounts.models import User

@pytest.mark.django_db
class TestRBAC:
    def setup_method(self):
        self.client = APIClient()
        
    def test_participant_can_create_kixikila(self):
        user = User.objects.create(user_type='participant', username='test')
        self.client.force_authenticate(user)
        
        response = self.client.post('/api/v2/kixikila/', {...})
        assert response.status_code == 201
    
    def test_voter_cannot_create_kixikila(self):
        user = User.objects.create(user_type='voter', username='test')
        self.client.force_authenticate(user)
        
        response = self.client.post('/api/v2/kixikila/', {...})
        assert response.status_code == 403
    
    def test_mentor_can_create_blog(self):
        user = User.objects.create(user_type='mentor', username='test')
        self.client.force_authenticate(user)
        
        response = self.client.post('/api/v2/blog/', {...})
        assert response.status_code == 201
```

#### Frontend Tests

```bash
mkdir -p frontend/src/__tests__/hooks
touch frontend/src/__tests__/hooks/usePermissions.test.ts
```

```typescript
import { renderHook } from '@testing-library/react';
import { usePermissions } from '../../hooks/usePermissions';
import { AuthContext } from '../../contexts/AuthContext';

describe('usePermissions', () => {
  it('should return correct permissions for mentor', () => {
    const wrapper = ({ children }) => (
      <AuthContext.Provider value={{ user: { user_type: 'mentor' }, isAuthenticated: true }}>
        {children}
      </AuthContext.Provider>
    );
    
    const { result } = renderHook(() => usePermissions(), { wrapper });
    
    expect(result.current.isMentor).toBe(true);
    expect(result.current.canCreateBlog).toBe(true);
    expect(result.current.canCreateKixikila).toBe(false);
  });
});
```

---

### Dia 11-15: Staging & Production

- [ ] Staging deployment
- [ ] Smoke tests
- [ ] User feedback
- [ ] Production rollout
- [ ] Monitoring

---

## 🎯 Prioridades

### Must Have (MVP)
1. ✅ Permission Classes (Backend)
2. ✅ ViewSet Refactoring (Backend)
3. ✅ usePermissions Hook (Frontend)
4. ✅ ProtectedRoute Extended (Frontend)
5. ✅ Navigation Adaptive (Frontend)

### Should Have (Sprint 2)
1. ⏳ Transição de Perfis
2. ⏳ AuditLog Completa
3. ⏳ Rate Limiting

### Nice to Have (Sprint 3)
1. ⏳ Dashboard por Perfil
2. ⏳ Advanced Analytics
3. ⏳ Custom Workflows

---

## 📚 Recursos

- **Análise Completa:** `ANALISE_FLUXOS_UTILIZADOR.md`
- **Django Permissions:** https://docs.djangoproject.com/en/4.0/topics/auth/
- **DRF Permissions:** https://www.django-rest-framework.org/api-guide/permissions/

---

## ❓ Perguntas Frequentes

**Q: Posso fazer isto sem refatorar tudo?**  
R: Recomenda-se refatorar aos poucos, módulo por módulo. Comece com Certifications.

**Q: Como lidar com utilizadores com múltiplos perfis?**  
R: Use Django Groups. Um utilizador pode estar em múltiplos grupos e ter permissões combinadas.

**Q: E agora os dados sensíveis?**  
R: Use Role-aware Serializers. Cada serializer filtra campos baseado no role.

---

**Pronto?** ✅ Começa com Dia 1: Setup!

**Dúvidas?** 💬 Refere ao ANALISE_FLUXOS_UTILIZADOR.md
