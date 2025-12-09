# 🚀 GUIA DE STAGING & DEPLOYMENT

## Fase 1: Staging Setup (10-11 Dezembro)

### 1.1 Merge para Develop

```bash
# Local
git checkout feature/certifications-marketplace-kixikila
git rebase develop  # Ou git merge develop
git push origin feature/certifications-marketplace-kixikila

# GitHub: Criar PR
# - Assign 2 reviewers
# - Link checklist: docs/PR_CHECKLIST_3MODULOS.md
# - Descrição: docs/DIA2_MARKETPLACE_KIXIKILA_COMPLETO.md

# Após 2 aprovações:
git checkout develop
git pull origin develop
git merge --no-ff feature/certifications-marketplace-kixikila
git push origin develop
```

### 1.2 Deployment em Staging

```bash
# Staging Environment
cd /home/acredita/staging

# Pull latest develop
git pull origin develop

# Criar/ativar venv
python -m venv venv_staging
source venv_staging/bin/activate  # ou .venv\Scripts\Activate.ps1 em Windows

# Instalar dependencies
pip install -r requirements.txt

# Database Backup (ANTES de migrations)
python manage.py dumpdata > backup_pre_staging_$(date +%Y%m%d_%H%M%S).json

# Aplicar migrations
python manage.py migrate --plan  # Preview
python manage.py migrate         # Apply

# Populate dados iniciais (marketplace)
python run_populate_marketplace.py

# Collect static files
python manage.py collectstatic --noinput

# Django system check
python manage.py check
```

### 1.3 Feature Flags - Staging Configuration

**Arquivo**: `.env.staging`

```bash
# Django Settings
DEBUG=False
SECRET_KEY=use_secure_key_here
ALLOWED_HOSTS=staging.acredita.ao,127.0.0.1

# Database (PostgreSQL recommended for staging)
DATABASE_URL=postgresql://user:pass@staging-db:5432/acredita_staging

# Feature Flags (DESATIVADOS por padrão)
FEATURE_CERTIFICATIONS=False
FEATURE_MARKETPLACE=False
FEATURE_KIXIKILA=False

# Logging
SENTRY_DSN=https://key@sentry.io/project

# CORS
CORS_ALLOWED_ORIGINS=https://staging.acredita.ao,http://localhost:3000
```

**Load em settings.py**:

```python
from decouple import config

ACTIVE_FEATURES = {
    'certifications': config('FEATURE_CERTIFICATIONS', default=False, cast=bool),
    'marketplace': config('FEATURE_MARKETPLACE', default=False, cast=bool),
    'kixikila': config('FEATURE_KIXIKILA', default=False, cast=bool),
    'advanced_payments': config('FEATURE_ADVANCED_PAYMENTS', default=False, cast=bool),
}
```

### 1.4 Verify Staging Deployment

```bash
# Health checks
curl -X GET https://staging.acredita.ao/api/auth/login/  # Should return 401 (auth required)
curl -X GET https://staging.acredita.ao/admin/           # Should redirect to login

# Check feature flags (all should be False/disabled)
curl https://staging.acredita.ao/api/v2/certifications/status/
# Response: 403 Forbidden (feature disabled)

curl https://staging.acredita.ao/api/v2/marketplace/status/
# Response: 403 Forbidden (feature disabled)

curl https://staging.acredita.ao/api/v2/kixikila/status/
# Response: 403 Forbidden (feature disabled)
```

---

## Fase 2: Beta Testing (12-13 Dezembro)

### 2.1 Ativar Feature Flags em Staging

Após validação inicial, ativar features uma por uma:

```bash
# Atualizar .env.staging
FEATURE_CERTIFICATIONS=True   # Beta test categoria por categoria

# Ou via Django admin:
# Settings → ACTIVE_FEATURES → certifications=True

# Restart server
systemctl restart acredita-staging  # ou seu método de restart
```

### 2.2 Teste de Features

#### Certificações
```bash
# 1. Criar user (admin ou regular)
curl -X POST https://staging.acredita.ao/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username": "certif_tester", "password": "Test1234!"}'

# 2. Login
TOKEN=$(curl -s -X POST https://staging.acredita.ao/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "certif_tester", "password": "Test1234!"}' | jq -r '.access')

# 3. Testar endpoints
curl -H "Authorization: Bearer $TOKEN" \
  https://staging.acredita.ao/api/v2/certifications/categories/

curl -H "Authorization: Bearer $TOKEN" \
  https://staging.acredita.ao/api/v2/certifications/programs/

# 4. Inscrever em programa
curl -X POST https://staging.acredita.ao/api/v2/certifications/enrollments/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"program": 1}'
```

#### Marketplace
```bash
# 1. Listar categorias (público)
curl https://staging.acredita.ao/api/v2/marketplace/categories/

# 2. Criar listing (requer provider profile)
curl -X POST https://staging.acredita.ao/api/v2/marketplace/listings/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Motonista em Luanda",
    "description": "Transporte rápido e seguro",
    "category_id": 1,
    "price_type": "negotiable",
    "base_price": 50000,
    "available": true
  }'

# 3. Filtrar por categoria
curl "https://staging.acredita.ao/api/v2/marketplace/listings/?category=1&available=true"

# 4. Buscar
curl "https://staging.acredita.ao/api/v2/marketplace/listings/?search=motor"
```

#### Kixikila
```bash
# 1. Criar grupo (requer auth)
curl -X POST https://staging.acredita.ao/api/v2/kixikila/groups/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Motonistas Luanda",
    "group_type": "professional",
    "monthly_contribution": 50000,
    "max_members": 20,
    "duration_months": 10,
    "start_date": "2025-12-20"
  }'

# 2. Listar grupos
curl https://staging.acredita.ao/api/v2/kixikila/groups/

# 3. Aderir a grupo (custom action)
curl -X POST https://staging.acredita.ao/api/v2/kixikila/groups/{id}/join/ \
  -H "Authorization: Bearer $TOKEN"

# 4. Ver meus grupos
curl -H "Authorization: Bearer $TOKEN" \
  https://staging.acredita.ao/api/v2/kixikila/groups/my_groups/
```

### 2.3 Monitoring em Staging

```bash
# Logs
tail -f /var/log/acredita/staging.log

# Database queries (DEBUG=True)
python manage.py shell
>>> from django.db import connection
>>> connection.queries  # Last queries executed

# Performance profiling
# Usar Django Debug Toolbar em staging
```

### 2.4 Feedback Collection

**Form**: https://forms.gle/xxxx (create Google Form)
- Feature functionality (1-5 stars)
- Performance (responsiveness)
- Bugs encontrados
- Sugestões
- Contato do tester

---

## Fase 3: Production Preparation (13-14 Dezembro)

### 3.1 Pre-Production Checklist

```bash
# Final validations
python manage.py check --deploy

# Security checks
python -m pip install bandit
bandit -r backend/certifications backend/marketplace backend/kixikila

# Database integrity
python manage.py integrity_check  # Custom command if exists

# Performance test
ab -n 1000 -c 10 https://staging.acredita.ao/api/v2/marketplace/categories/
# Expected: < 500ms for 90th percentile
```

### 3.2 Production Deployment Strategy

#### Canary Deployment (Rollout Gradual)

```
Dia 1 (15 Dec):  10% traffic  → Certificações
Dia 2 (16 Dec):  50% traffic  → Certificações + Marketplace
Dia 3 (17 Dec): 100% traffic  → All 3 modules
```

#### Feature Flag as Kill Switch

```python
# Production decision matrix
if request.user.is_staff or request.user.is_superuser:
    # Admin sempre tem acesso
    allow = True
elif ACTIVE_FEATURES['certifications']:
    # Usuário normal, se flag ativo
    allow = True
else:
    # Retorna 403 Forbidden instantaneamente
    allow = False
```

#### Rollback Procedure (se necessário)

```bash
# Opção 1: Via feature flag (0 downtime)
# Editar settings.py ou .env
FEATURE_CERTIFICATIONS=False
FEATURE_MARKETPLACE=False
FEATURE_KIXIKILA=False
# Restart server (respeitando load balancer graceful shutdown)

# Opção 2: Via git revert (downtime de alguns segundos)
git revert <commit-hash>
git push origin main
# Restart e reapply migrations se necessário
```

---

## Fase 4: Production Operations (Week 2+)

### 4.1 Monitoring Dashboard

```
Métricas a rastrear:
- API latency (p50, p95, p99)
- Error rate (< 0.1% target)
- Database connections (active, queued)
- Feature flag usage (on/off count)
- User engagement (enrollments, listings created, groups formed)
```

### 4.2 Alertas Configurar

```
Alert on:
1. Error rate > 1%
2. Latency p95 > 500ms
3. Database connection pool exhaustion
4. Feature flag unexpected behavior
5. Authorization failures > threshold
```

### 4.3 Support Escalation

```
Tier 1: Automated responses via feature flag
Tier 2: Engineering team review logs
Tier 3: Database team if migration issues
```

---

## 🔄 Rollback Scenarios

### Scenario 1: Critical Bug Discovered (Prod)
```bash
# Instântaneamente disable feature
FEATURE_CERTIFICATIONS=False
# Restart (< 1s)
# 0 downtime, no data loss
```

### Scenario 2: Database Issue
```bash
# Backup exists from pre-migration
python manage.py loaddata backup_pre_staging_20251209.json
# Or: revert migration
python manage.py migrate certifications 0  # Backwards
```

### Scenario 3: Data Corruption
```bash
# Isolate affected data
SELECT * FROM certifications_candidateenrollment WHERE created_at > NOW() - INTERVAL 1 hour;

# Restore from backup if critical
pg_restore -d acredita backup.sql
```

---

## 📋 Staging Checklist

- [ ] Merge PR aprovado e merged em develop
- [ ] Staging deploy completado
- [ ] Migrations aplicadas com sucesso
- [ ] Feature flags desativados (segurança padrão)
- [ ] Health checks passando
- [ ] 10 beta testers recrut ados
- [ ] Feature flags habilitados um a um
- [ ] Testes manuais completos
- [ ] Performance baseline estabelecido (< 200ms p95)
- [ ] Error rate < 0.1%
- [ ] Logs limpos e monitorados
- [ ] Feedback coletado
- [ ] Nenhum blocker crítico identificado
- [ ] Pronto para produção

---

## 📞 Escalação

**On-Call (Week 1-2)**:
- Backend Lead: [Slack/Phone]
- DevOps: [Slack/Phone]
- DBA: [Slack/Phone]

**Response Time SLA**:
- P1 (critical): < 15 minutos
- P2 (high): < 1 hora
- P3 (medium): < 4 horas

---

**Documento Versão**: 1.0  
**Data**: 09 Dezembro 2025  
**Próxima Revisão**: 11 Dezembro (pré-staging)

