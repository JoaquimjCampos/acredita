# 🔧 PHASE 3: Settings Configuration & Middleware Activation

## Objetivo
Ativar o RoleValidationMiddleware e configurar logging para RBAC

## Status: ⏳ Ready to Implement (30-45 min)

---

## STEP 1: Configurar Logging

### Arquivo: `backend/acredita_backend/settings.py`

Procure pela seção `LOGGING` (deve estar perto do fim do arquivo) ou crie uma se não existir.

**Adicione ou atualize:**

```python
import logging
from pathlib import Path

# Criar diretório de logs se não existir
LOGS_DIR = BASE_DIR / 'logs'
LOGS_DIR.mkdir(exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
            'datefmt': '%Y-%m-%d %H:%M:%S',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': LOGS_DIR / 'rbac.log',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'rbac': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

---

## STEP 2: Ativar Middleware

### Arquivo: `backend/acredita_backend/settings.py`

Procure pela list `MIDDLEWARE`. Deve parecer assim:

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    # ← ADICIONE A LINHA ABAIXO AQUI
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

**Atualize para:**

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'backend.core.rbac_middleware.RoleValidationMiddleware',  # ← ADICIONAR AQUI
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

---

## STEP 3: Verificar REST Framework Settings

### Arquivo: `backend/acredita_backend/settings.py`

Procure por `REST_FRAMEWORK`. Se não existir, adicione:

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

---

## STEP 4: Criar diretório de logs

```bash
mkdir -p logs
```

Ou no PowerShell:
```powershell
New-Item -ItemType Directory -Force -Path logs
```

---

## STEP 5: Testes de Verificação

### Teste 1: Verificar Sistema
```bash
python manage.py check
```

Esperado:
```
System check identified no issues (0 silenced)
```

### Teste 2: Verificar Logs
```bash
python manage.py shell
>>> from backend.core.models import AuditLog
>>> AuditLog.objects.count()
# Deve retornar 0 ou número anterior
```

### Teste 3: Rodar Servidor
```bash
python manage.py runserver
```

Esperado:
```
Starting development server at http://127.0.0.1:8000/
```

### Teste 4: Acessar Django Admin
```
http://localhost:8000/admin/
Login com superuser
Ir a: Core → Audit Logs
Deve estar vazio (ou mostrar logs anteriores)
```

---

## STEP 6: Testar Middleware

### Teste com Postman/Insomnia

**Teste 1: POST Blog (deve falhar para Eleitor)**
```
POST http://localhost:8000/api/blog/
Headers:
  Authorization: Bearer <eleitor_token>
  Content-Type: application/json

Body:
{
  "title": "Test",
  "content": "Test"
}

Esperado: 403 Forbidden (CanCreateBlogPost)
```

**Teste 2: POST Blog (deve passar para Mentor)**
```
POST http://localhost:8000/api/blog/
Headers:
  Authorization: Bearer <mentor_token>
  Content-Type: application/json

Body:
{
  "title": "Test",
  "content": "Test"
}

Esperado: 201 Created
```

**Teste 3: Verificar Log**
```
http://localhost:8000/admin/core/auditlog/
Deve mostrar:
  - action: 'create'
  - resource: 'blog'
  - user_role: 'mentor'
  - status_code: 201
```

---

## STEP 7: Testar AuditLog

### Django Shell
```bash
python manage.py shell
```

```python
from backend.core.models import AuditLog

# Ver últimos 5 registros
logs = AuditLog.objects.all().order_by('-timestamp')[:5]
for log in logs:
    print(f"{log.user} - {log.action} - {log.resource} - {log.status_code}")

# Ver registros de um usuário específico
user_logs = AuditLog.objects.filter(user__username='john_mentor')
print(f"User logs: {user_logs.count()}")

# Ver por role
mentor_logs = AuditLog.objects.filter(user_role='mentor')
print(f"Mentor logs: {mentor_logs.count()}")
```

---

## STEP 8: Verificar Arquivo de Log

### Arquivo: `logs/rbac.log`

Deve conter linhas como:
```
INFO 2024-12-27 14:23:45 rbac_middleware 1234 5678 Unauthenticated access: GET /api/blog/
INFO 2024-12-27 14:23:46 rbac_middleware 1234 5678 Write access: mentor - POST /api/blog/
```

---

## Troubleshooting

### Erro: Module not found 'backend.core.rbac_middleware'
**Solução:** Verifique se o arquivo `backend/core/rbac_middleware.py` existe

### Erro: No logs directory
**Solução:** Crie manualmente: `mkdir -p logs`

### Erro: Permission Denied on logs
**Solução:** Verifique permissões do diretório:
```bash
chmod 755 logs
```

### Middleware não está ativo
**Verificação:**
```python
from django.conf import settings
print(settings.MIDDLEWARE)
# Deve conter 'backend.core.rbac_middleware.RoleValidationMiddleware'
```

---

## Checklist de Implementação

- [ ] Adicionar LOGGING a settings.py
- [ ] Adicionar Middleware a MIDDLEWARE list
- [ ] Verificar REST_FRAMEWORK settings
- [ ] Criar diretório logs
- [ ] Rodar `python manage.py check`
- [ ] Rodar `python manage.py runserver`
- [ ] Testar POST Blog (Eleitor → 403)
- [ ] Testar POST Blog (Mentor → 201)
- [ ] Verificar AuditLog no admin
- [ ] Verificar arquivo logs/rbac.log
- [ ] Verificar django shell logs
- [ ] Middleware ativo ✅

---

## Próximo Passo

Após completar esta Phase 3:

1. **Frontend Integration** (Phase 3 cont.)
   - Ativar middleware (este passo)
   - Testar usePermissions hook
   - Implementar adaptive navigation
   - Role-specific CTAs

2. **Testing** (Phase 4)
   - Unit tests
   - Integration tests
   - Security tests

3. **Deployment** (Phase 5)
   - Staging
   - Production

---

## Tempo Estimado

- Configuração: 5-10 min
- Testes: 10-15 min
- Troubleshooting: 10-15 min
- **Total: 30-45 min**

---

**Próximo comando quando estiver pronto:**
```bash
python manage.py check
```

Se não houver erros, pode proceder para a próxima fase!
