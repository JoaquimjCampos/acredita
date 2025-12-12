# 🎬 PLANO IMEDIATO - PRÓXIMAS 24-48 HORAS

**Data**: 9 Dezembro 2025  
**Tempo**: ~24-48 horas até staging deploy  
**Owner**: Backend Lead

---

## ⏰ TIMELINE CRÍTICA

### TODAY (9 Dez) - ✅ COMPLETO

- ✅ 09:00-18:00: Implementação das 3 apps (DONE)
- ✅ 18:00-22:00: Push para GitHub (DONE)
- ✅ 22:00-23:00: Revisão geral (DONE)

### TOMORROW (10 Dez) - CÓDIGO REVIEW & MERGE

```
08:00-10:00: Code Review Kickoff
    - Assign 2 reviewers
    - Link: docs/PR_CHECKLIST_3MODULOS.md
    - Focus: Security, Performance, Tests

10:00-14:00: Reviewers Trabalham
    - Clonar branch dev
    - Executar testes localmente
    - Testar endpoints manualmente
    - Revisar código

14:00-16:00: Feedback & Adjustments
    - Se aprovado: Merge para develop
    - Se rejeito: Fazer ajustes (1-2h)

16:00-18:00: Prepare Staging
    - Setup environment variables
    - Configure .env.staging
    - Database migration plan

18:00-22:00: Staging Deployment
    - Deploy código
    - Run migrations
    - Health checks
    - Feature flags = False (padrão)

22:00+: Smoke Testing
    - Health endpoints
    - Admin interface
    - Database connectivity
```

### DAY 3 (11-12 Dez) - BETA TESTING

```
11:00-12:00: Beta Tester Onboarding
    - Email com credenciais
    - Link para staging
    - Testing guide
    - Contact support

12:00-20:00: Feature Flag Activation (Gradual)
    - 12:00: FEATURE_CERTIFICATIONS=True
    - 15:00: FEATURE_MARKETPLACE=True
    - 18:00: FEATURE_KIXIKILA=True
    - Monitorar logs em tempo real

20:00-23:00: Feedback Collection
    - Google Form responses
    - Bug reports
    - Performance feedback

23:00+: Bug Fixing Preparado
    - Hotfixes ready to deploy
    - Rollback procedure tested
```

---

## 📋 ACTION ITEMS - HOJE (9 Dez - Evening)

### Item 1: Notificar Stakeholders (30 min)

**Slack/Email**:
```
To: @tech-lead, @devops, @product

Subject: 🚀 3 Django Apps Ready for Review - Staging Deploy Tomorrow

Hi team,

Great news! Three major modules completed:
1. Certifications (INEFOB) - 5 models, 11+ endpoints
2. Marketplace (Services) - 5 models, 15+ endpoints
3. Kixikila (Rotating Savings) - 5 models, 15+ endpoints

Status:
✅ All tests passing (4/4)
✅ System check: 0 issues
✅ GitHub: master & dev synced
✅ Documentação: 15+ files

TOMORROW SCHEDULE:
08:00 - Code review kickoff (2 reviewers)
14:00 - Merge (if approved)
16:00 - Staging deployment
22:00 - Smoke tests

ACTION NEEDED:
1. Assign code reviewers by 08:00 tomorrow
2. Prepare staging environment
3. Recruit 20 beta testers for 11-12 Dez

Docs: docs/REVISAO_GERAL_E_CONTINUACAO.md

TIA!
```

### Item 2: Preparar Reviewers (1 hora)

**Enviar para Reviewers**:
1. Link para branch dev
2. Checklist: `docs/PR_CHECKLIST_3MODULOS.md`
3. Test commands:
   ```bash
   git clone https://github.com/JoaquimjCampos/acredita.git
   git checkout dev
   python -m venv venv
   source venv/bin/activate  # ou .venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   python manage.py test backend.certifications backend.marketplace backend.kixikila
   python manage.py check
   ```

### Item 3: Preparar Staging Environment (2 horas)

**Checklist de Infraestrutura**:
- [ ] Servidor staging pronto (staging.acredita.ao)
- [ ] PostgreSQL/MySQL database criado
- [ ] Redis cache (opcional mas recomendado)
- [ ] Nginx reverse proxy configurado
- [ ] SSL certificate valid
- [ ] Backup procedure tested
- [ ] Monitoring/Sentry configured
- [ ] Log aggregation ready

**`.env.staging` Template**:
```bash
DEBUG=False
SECRET_KEY=use_a_random_secure_key_here
ALLOWED_HOSTS=staging.acredita.ao,127.0.0.1

DATABASE_URL=postgresql://user:pass@db-staging:5432/acredita_staging

FEATURE_CERTIFICATIONS=False
FEATURE_MARKETPLACE=False
FEATURE_KIXIKILA=False

CORS_ALLOWED_ORIGINS=https://staging.acredita.ao,http://localhost:3000

SENTRY_DSN=https://key@sentry.io/project

# Multicaixa (placeholder até integração completa)
MULTICAIXA_API_KEY=demo_key
MULTICAIXA_MERCHANT_ID=demo_merchant
```

### Item 4: Recrutar Beta Testers (1 hora)

**Enviar Email**:
```
Subject: 🎯 Beta Testing Invitation - Acredita Marketplace

Hi [Name],

We're excited to invite you to our beta testing program!

You'll be among the first to test:
1. Certification Program (INEFOB partnership)
2. Marketplace for Services
3. Kixikila (Rotating Savings)

Timeline:
- 11-12 Dez: Beta testing (48 hours)
- 15-17 Dez: Canary deployment (production)

What we need:
- 30 min to 2 hours of testing
- Feedback on functionality & UX
- Bug reporting

Compensation:
- AOA 5,000 credit for first purchase/enrollment
- Exclusive early access to features
- Recognition as beta tester

Sign up: [Link]

Questions: support@acredita.ao
```

**Target Groups**:
- 5 Motorcycle/transport drivers (testar Marketplace + Kixikila)
- 5 Service providers (testar Marketplace listings)
- 5 Job seekers (testar Certifications)
- 3 Finance people (testar Kixikila mechanics)
- 2 Tech team members (edge cases)

---

## 🔍 TOMORROW (10 Dez) - CODE REVIEW CHECKLIST

### For Reviewers (2-3 hours)

**Clone & Setup**:
```bash
git clone https://github.com/JoaquimjCampos/acredita.git
cd acredita
git checkout dev
python -m venv venv_review
source venv_review/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Test Checklist**:
- [ ] `python manage.py check` = 0 issues
- [ ] `python manage.py test backend.certifications backend.marketplace backend.kixikila` = all pass
- [ ] Visit http://localhost:8000/admin/ → login with testuser/testpass
- [ ] Check each app's admin interface
- [ ] Test 3-5 endpoints per app with Postman/cURL

**Code Review Points**:
- [ ] Models: Relationships correct? Constraints in place?
- [ ] Serializers: Nested relationships? Write separation?
- [ ] Views: Feature flags working? Permissions correct?
- [ ] Admin: UX good? List display useful? Filters present?
- [ ] Tests: Coverage adequate? Edge cases covered?
- [ ] Security: No hardcoded secrets? Input validation?
- [ ] Performance: Queries optimized? N+1 issues?

**Approve Criteria** (ALL must be YES):
- [ ] All tests passing
- [ ] System check: 0 issues
- [ ] No blocking bugs found
- [ ] Code follows team standards
- [ ] Security review passed
- [ ] Documentation adequate
- [ ] Feature flags working

---

## 🚀 STAGING DEPLOYMENT PROCEDURE (10 Dez - 16:00)

### Pre-Deployment (30 min)

```bash
# 1. Verify all tests pass locally
cd /path/to/acredita
git pull origin develop
python manage.py test backend.certifications backend.marketplace backend.kixikila --keepdb

# 2. Create database backup
pg_dump acredita_staging > backup_$(date +%Y%m%d_%H%M%S).sql
aws s3 cp backup_*.sql s3://acredita-backups/

# 3. Prepare migrations
python manage.py makemigrations --dry-run
python manage.py migrate --plan
```

### Deployment (30 min)

```bash
# 4. SSH into staging server
ssh acredita@staging.acredita.ao

# 5. Pull code
cd /home/acredita/app
git pull origin develop

# 6. Update venv
source venv/bin/activate
pip install -r requirements.txt

# 7. Run migrations
python manage.py migrate --no-input

# 8. Collect static files
python manage.py collectstatic --noinput

# 9. Restart services
systemctl restart acredita-gunicorn
systemctl restart acredita-nginx

# 10. Run health checks
curl -X GET https://staging.acredita.ao/api/v2/certifications/status/
curl -X GET https://staging.acredita.ao/api/v2/marketplace/status/
curl -X GET https://staging.acredita.ao/api/v2/kixikila/status/
```

### Post-Deployment (30 min)

```bash
# 11. Verify logging
tail -f /var/log/acredita/staging.log | grep -i "ERROR\|WARNING"

# 12. Check database
python manage.py shell
>>> from backend.certifications.models import ProfessionalCategory
>>> ProfessionalCategory.objects.count()
5  # Expected

# 13. Verify admin interface
# Manually test http://staging.acredita.ao/admin/

# 14. Run smoke tests
curl -X GET https://staging.acredita.ao/api/auth/login/
# Should return 401 (auth required, not 403 forbidden)

# 15. Document deployment
cat > /home/acredita/DEPLOYMENT_LOG.txt << EOF
Date: $(date)
Deployed from: develop
Commit: $(git rev-parse HEAD)
Migrations: Applied
Status: LIVE
EOF
```

### Rollback Procedure (if needed)

```bash
# Option 1: Feature Flag Disable (INSTANT - NO DOWNTIME)
# Edit .env
FEATURE_CERTIFICATIONS=False
FEATURE_MARKETPLACE=False
FEATURE_KIXIKILA=False
# Restart
systemctl restart acredita-gunicorn

# Option 2: Revert Code (if critical bug in logic)
git reset --hard HEAD~1
git push origin develop --force-with-lease
systemctl restart acredita-gunicorn

# Option 3: Database Restore (if migration broke data)
pg_restore -d acredita_staging < backup_*.sql
systemctl restart acredita-gunicorn
```

---

## 📱 BETA TESTER GUIDE (for 11-12 Dez)

**Enviar documento**:
```markdown
# 🧪 Beta Testing Guide - Acredita 3 Modules

## Access
URL: https://staging.acredita.ao
Credentials: [will be emailed]

## What to Test

### 1. Certifications (30 min)
1. Go to /certifications
2. Browse programs
3. Enroll in "Motoqueiro Profissional"
4. Complete enrollment steps
5. Report any issues

### 2. Marketplace (45 min)
1. Browse listings by category
2. Search for services
3. Filter by price, location
4. Create a listing (if provider)
5. Place an order

### 3. Kixikila (45 min)
1. Browse groups
2. Create a new group
3. Join an existing group
4. Make a contribution
5. Check group stats

## Feedback Form
Please answer: https://forms.gle/xxx

## Bug Report
Email bugs to: bugs@acredita.ao
Include: Screenshots, steps to reproduce, browser

## Support
Slack: #beta-testing
Phone: +244 9xx xxx xxx
Email: support@acredita.ao
```

---

## ✅ SUCCESS CRITERIA

### End of 10 Dez
- [ ] Code review completed
- [ ] PR approved by 2+ reviewers
- [ ] Merge to develop
- [ ] Staging deployment successful
- [ ] Health checks passing
- [ ] Admin interface working
- [ ] Feature flags disabled (safe state)

### End of 12 Dez
- [ ] 20 beta testers recruited
- [ ] Beta testing completed
- [ ] 0 blocking bugs found
- [ ] Positive feedback received
- [ ] Ready for production canary

### Production Canary (15-17 Dez)
- [ ] 10% traffic → Certificações ✅
- [ ] 50% traffic → Marketplace ✅
- [ ] 100% traffic → Tudo ✅
- [ ] Error rate < 0.1%
- [ ] Latency P95 < 200ms

---

## 📞 ESCALATION CONTACTS

**Critical Issue?**
- Backend Lead: [Slack/Phone]
- DevOps: [Slack/Phone]
- Database Admin: [Slack/Phone]

**Response SLA**
- P1 (critical): < 15 min
- P2 (high): < 1 hour
- P3 (medium): < 4 hours

---

**Last Updated**: 9 Dez 2025, 23:30 UTC  
**Status**: ✅ READY FOR CODE REVIEW  
**Next Checkpoint**: 10 Dez 08:00 UTC (Code Review Kickoff)

