# 🔧 RBAC Settings Configuration

## Adicione ao seu `backend/acredita_backend/settings.py`:

### 1. Middleware (após SessionMiddleware):

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    # 👇 ADICIONAR RBAC MIDDLEWARE
    'backend.core.rbac_middleware.RoleValidationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

### 2. Logging Configuration (se ainda não existe):

```python
import logging

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs', 'rbac.log'),
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'rbac': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}
```

### 3. Garantir que `logs/` directory existe:

```bash
mkdir -p backend/logs
touch backend/logs/.gitkeep
```

### 4. REST Framework Settings (se ainda não existe):

```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}
```

## Verificação:

Execute no Django shell para confirmar setup:

```bash
python manage.py shell
```

```python
from django.contrib.auth.models import Group
from backend.core.models import AuditLog, RoleTransition

# Verificar grupos
groups = Group.objects.all()
print(f"Total de grupos: {groups.count()}")
for g in groups:
    print(f"- {g.name}: {g.permissions.count()} permissões")

# Verificar models
print(f"AuditLog model exists: {AuditLog._meta.table_name}")
print(f"RoleTransition model exists: {RoleTransition._meta.table_name}")
```

Expected output:
```
Total de grupos: 4
- Eleitor: 3 permissões
- Participante: 5 permissões
- Mentor: 4 permissões
- Administrador: 268 permissões
AuditLog model exists: core_auditlog
RoleTransition model exists: core_roletransition
```

## Admin Access:

1. Crie superuser se ainda não existe:
```bash
python manage.py createsuperuser
```

2. Acesse admin em `http://localhost:8000/admin/`

3. Vá para:
   - **Authentication and Authorization → Groups** - Ver grupos e permissões
   - **Core → Audit Logs** - Ver todas as ações
   - **Core → Role Transitions** - Ver pedidos de upgrade

## Testing:

### Test Eleitor (Voter):
```bash
curl -H "Authorization: Bearer <token>" \
     -X POST http://localhost:8000/api/certifications/ \
     -H "Content-Type: application/json" \
     -d '{"name": "Test"}'
# Esperado: 403 Forbidden
```

### Test Participante (Participant):
```bash
curl -H "Authorization: Bearer <token>" \
     -X POST http://localhost:8000/api/marketplace/listings/ \
     -H "Content-Type: application/json" \
     -d '{"title": "Item", "price": 100}'
# Esperado: 201 Created
```

### Test Mentor:
```bash
curl -H "Authorization: Bearer <token>" \
     -X POST http://localhost:8000/api/certifications/ \
     -H "Content-Type: application/json" \
     -d '{"name": "Course", "instructor": 1}'
# Esperado: 201 Created
```

## Next Steps:

1. ✅ Settings configurado
2. ⏳ Refatorar ViewSets (próximo passo)
3. ⏳ Integrar com frontend
4. ⏳ Testing completo
