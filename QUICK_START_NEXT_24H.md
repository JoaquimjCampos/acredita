# ⚡ QUICK START - Próximos 24h

## 🎯 Objetivo: Refatorar 3 ViewSets com RBAC

**Tempo Total:** 3 horas
**Deadline:** Fim do dia de amanhã
**Prioridade:** 🔴 ALTA

---

## 📋 CHECKLIST - COPIE & COLE

### [ ] 1. BlogViewSet (30 min)

```bash
# Abra arquivo:
# backend/blog/views.py

# Procure por: class BlogViewSet(viewsets.ModelViewSet):
# Copie este código DEPOIS da definição da classe:

def get_permissions(self):
    if self.action == 'create':
        self.permission_classes = [CanCreateBlogPost]
    elif self.action in ['update', 'partial_update']:
        self.permission_classes = [IsOwnerOrReadOnly]
    elif self.action == 'destroy':
        self.permission_classes = [IsOwnerOrAdmin]
    return super().get_permissions()

def get_queryset(self):
    user = self.request.user
    if not user.is_authenticated:
        return BlogPost.objects.none()
    if user.is_staff:
        return BlogPost.objects.all()
    from django.db.models import Q
    return BlogPost.objects.filter(
        Q(is_published=True) | Q(author=user)
    )

def perform_create(self, serializer):
    post = serializer.save(author=self.request.user)
    AuditLog.log_action(
        user=self.request.user,
        action='create',
        resource='blog',
        resource_id=post.id,
        method='POST',
        endpoint=self.request.path,
        status_code=201,
        ip_address=self._get_client_ip(),
        response_status='success'
    )

def _get_client_ip(self):
    x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return self.request.META.get('REMOTE_ADDR')
```

**Add imports no topo:**
```python
from backend.core.rbac_permissions import (
    CanCreateBlogPost,
    IsOwnerOrReadOnly,
    IsOwnerOrAdmin,
)
from backend.core.models import AuditLog
```

**Teste no Postman:**
- [ ] GET /api/blog/ com token Eleitor → 200 OK
- [ ] POST /api/blog/ com token Eleitor → 403 Forbidden
- [ ] POST /api/blog/ com token Mentor → 201 Created

---

### [ ] 2. MarketplaceViewSet (30 min)

Mesmo padrão, mas com:
- **Permission:** `CanCreateMarketplaceListing`
- **Resource:** `'marketplace'`
- **Model:** `MarketplaceListing` (ou similar)

---

### [ ] 3. KixikilaViewSet (30 min)

Mesmo padrão, mas com:
- **Permission:** `CanCreateKixikila`
- **Resource:** `'kixikila'`
- **Model:** `KixikilaGroup` (ou similar)

---

### [ ] 4. Testar (1 hora)

```bash
# Terminal 1: Rodei o servidor
python manage.py runserver

# Terminal 2: Fazer testes
# Criar 3 tokens (um para cada role)

# Test 1: Eleitor
curl -H "Authorization: Bearer <eleitor_token>" \
     http://localhost:8000/api/blog/

# Test 2: Mentor
curl -H "Authorization: Bearer <mentor_token>" \
     -X POST http://localhost:8000/api/blog/ \
     -H "Content-Type: application/json" \
     -d '{"title":"Teste","content":"teste"}'

# Test 3: Verificar AuditLog no admin
# http://localhost:8000/admin/core/auditlog/
```

---

## 🎬 COMEÇAR AGORA

### Step 1: Abrir arquivo
```bash
code backend/blog/views.py
```

### Step 2: Encontrar BlogViewSet
Use Ctrl+F: "class BlogViewSet"

### Step 3: Copiar padrão
Ver `RBAC_VIEWSET_EXAMPLE.md` linha por linha

### Step 4: Implementar imports
Adicione no topo do arquivo

### Step 5: Adicionar métodos
Copie os 4 métodos (get_permissions, get_queryset, perform_create, _get_client_ip)

### Step 6: Salvar
Ctrl+S

### Step 7: Testar
Rodar `python manage.py runserver` e testar no Postman

---

## 📊 PROGRESSO

```
Dia 1: Phase 1 Backend ✅ Completo
│
├─ BlogViewSet ........... [ ] Not Started
├─ MarketplaceViewSet .... [ ] Not Started
├─ KixikilaViewSet ....... [ ] Not Started
└─ Testing ............... [ ] Not Started
│
Dia 2: Phase 2 ViewSets ⏳ Ready
│
└─ Phase 3: Frontend Integration ⏳ Ready
```

---

## 🚀 POWERUPS (Optional but Recommended)

### Se sobrar tempo:

1. **Ativar Middleware** (15 min)
   - Adicionar à settings.py
   - Ver `RBAC_SETTINGS_CONFIG.md`

2. **Criar Script de Teste** (30 min)
   - Postman collection com 4 roles
   - Testar cada endpoint

3. **Dashboard Auditoria** (1 hour)
   - Criar Django admin view customizado
   - Mostrar últimas ações por role

---

## 🆘 SE TIVER DÚVIDAS

1. **Padrão Geral:** `RBAC_VIEWSET_EXAMPLE.md`
2. **Permission Classes:** `backend/core/rbac_permissions.py`
3. **Models:** `backend/core/models.py`
4. **Setup:** `RBAC_SETTINGS_CONFIG.md`

---

## ✅ DEFINITIVAMENTE FEITO QUANDO...

- [ ] BlogViewSet refatorado ✅
- [ ] MarketplaceViewSet refatorado ✅
- [ ] KixikilaViewSet refatorado ✅
- [ ] Todos os 3 testados e funcionando ✅
- [ ] AuditLog registrando ações ✅
- [ ] Admin mostrando registros ✅

**Tempo Total:** 3-4 horas
**Deadline:** Fim de amanhã

---

**Boa sorte! 🚀**
