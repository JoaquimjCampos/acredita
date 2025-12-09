# 📋 Plano de Atualização Incremental - Acredita 2026
## Protegendo Código Valioso + Expandindo Funcionalidades

**Data:** 09/12/2025 | **Versão:** 1.0 | **Metodologia:** Feature Branching + Feature Flags

---

## 🎯 Princípios de Execução

### 1. **Zero Breaking Changes**
- ✅ Manter todas as APIs existentes funcionais
- ✅ Adicionar novos endpoints, não modificar antigos
- ✅ Migrations de banco de dados sempre retrocompatíveis
- ✅ Testes de regressão antes de merge

### 2. **Feature Flags**
- ✅ Novas funcionalidades desativadas por padrão
- ✅ Ativar para grupos de teste (beta, admin)
- ✅ Rollback instantâneo se houver problemas
- ✅ Análise de impacto antes de ativar globalmente

### 3. **Branch Strategy**
```
main (produção)
  ↓
develop (staging)
  ↓
feature/certifications (Branch 1)
feature/marketplace (Branch 2)
feature/kixikila (Branch 3)
feature/payments (Branch 4)
hotfix/* (correções urgentes)
```

### 4. **Testes Rigorosos**
- ✅ Unit tests (pytest)
- ✅ Integration tests
- ✅ E2E tests (Cypress)
- ✅ Load tests (locust)
- ✅ Security tests (OWASP)

---

## 📅 Fase 1: Preparação (Semana 1-2)

### Dia 1-2: Setup de Infraestrutura

#### 1.1 Estrutura de Branches
```bash
# Criar branches de desenvolvimento
git checkout -b feature/certifications
git checkout -b feature/marketplace
git checkout -b feature/kixikila
git checkout -b feature/payments

# Proteger main e develop
# Settings → Branches → Require pull request reviews (2 people)
# Settings → Branches → Require status checks to pass
```

#### 1.2 Setup de Feature Flags
```python
# backend/core/feature_flags.py
from django.conf import settings
from enum import Enum

class FeatureFlag(Enum):
    CERTIFICATIONS = "certifications"
    MARKETPLACE = "marketplace"
    KIXIKILA = "kixikila"
    ADVANCED_PAYMENTS = "advanced_payments"

class FeatureFlagService:
    """Gerenciador centralizado de feature flags"""
    
    DEFAULTS = {
        FeatureFlag.CERTIFICATIONS: False,
        FeatureFlag.MARKETPLACE: False,
        FeatureFlag.KIXIKILA: False,
        FeatureFlag.ADVANCED_PAYMENTS: False,
    }
    
    @staticmethod
    def is_enabled(flag: FeatureFlag, user=None):
        """Verifica se feature está ativada"""
        if settings.DEBUG:
            return True  # Tudo ativado em dev
        
        # Em produção
        if user and user.is_staff:
            return True  # Admin acessa tudo
        
        # Beta testers
        if user and user.groups.filter(name='beta_testers').exists():
            return True
        
        # Default
        return FeatureFlagService.DEFAULTS.get(flag, False)

# Uso no código
@require_http_methods(["GET"])
@check_feature_flag(FeatureFlag.CERTIFICATIONS)
def certification_list(request):
    # Endpoint só acessível se flag ativada
    pass

# Frontend
// App.tsx
const certifications = useFeatureFlag('certifications');

{certifications && (
  <CertificationsPage />
)}
```

#### 1.3 Criar Apps Django Novos
```bash
cd backend

# Criar apps (sem quebrar os existentes)
python manage.py startapp certifications
python manage.py startapp marketplace
python manage.py startapp kixikila
python manage.py startapp payments
python manage.py startapp core  # Utilitários compartilhados

# Estrutura de cada app
certifications/
├── migrations/
│   └── __init__.py
├── __init__.py
├── models.py
├── views.py
├── serializers.py
├── urls.py
├── admin.py
├── tests.py
├── apps.py
└── feature_flags.py
```

#### 1.4 Configurar Settings Django
```python
# backend/acredita_backend/settings.py

# Adicionar novos apps (não remover os antigos!)
INSTALLED_APPS = [
    # Apps originais (mantém-se intactos)
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'crispy_forms',
    'crispy_tailwind',
    
    # Apps existentes (inalterados)
    'backend.accounts',
    'backend.participants',
    'backend.seasons',
    'backend.voting',
    'backend.donations',
    'backend.store',
    'backend.blog',
    'backend.content',
    'backend.games',
    'backend.ads',
    
    # Novos apps (adicionados)
    'backend.core',  # Feature flags, utilitários
    'backend.certifications',  # 🆕
    'backend.marketplace',  # 🆕
    'backend.kixikila',  # 🆕
    'backend.payments',  # 🆕
]

# Feature Flags
FEATURE_FLAGS = {
    'CERTIFICATIONS': False,
    'MARKETPLACE': False,
    'KIXIKILA': False,
    'ADVANCED_PAYMENTS': False,
}

# Logging para rastreamento
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'acredita.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
}
```

### Dia 3-4: Preparar Testes

#### 1.5 Setup de Testes
```bash
# Criar diretório de testes
mkdir -p tests/{unit,integration,e2e}

# conftest.py para pytest
cat > tests/conftest.py << 'EOF'
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user(db):
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )

@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='admin123'
    )

@pytest.fixture
def authenticated_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client
EOF

# requirements-test.txt
echo "pytest==7.4.3
pytest-django==4.7.0
pytest-cov==4.1.0
factory-boy==3.3.0" > requirements-test.txt

pip install -r requirements-test.txt
```

#### 1.6 CI/CD Configuration
```yaml
# .github/workflows/tests.yml
name: Tests & Quality Checks

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: 3.14
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-test.txt
      
      - name: Run unit tests
        run: pytest tests/unit/ --cov=backend
      
      - name: Run integration tests
        run: pytest tests/integration/ --cov=backend
      
      - name: Check code coverage
        run: coverage report --fail-under=80
      
      - name: Lint with flake8
        run: flake8 backend/ --count --select=E9,F63,F7,F82 --show-source
      
      - name: Security check with bandit
        run: bandit -r backend/ -f json > bandit-report.json || true
```

### Dia 5-7: Documentação & Comunicação

#### 1.7 Criar Documentação de Migração
```markdown
# docs/MIGRATION_GUIDE_2026.md

## Guia de Migração para Novos Módulos

### Para Desenvolvedores

#### 1. Verificar Feature Flags
Antes de usar qualquer novo módulo, verifique se está ativado:

\`\`\`python
from backend.core.feature_flags import FeatureFlagService, FeatureFlag

if FeatureFlagService.is_enabled(FeatureFlag.CERTIFICATIONS):
    # Usar novas APIs
else:
    # Usar fallback ou rejeitar
\`\`\`

#### 2. Endpoints Novos vs Antigos
- ❌ NÃO remover endpoints antigos
- ✅ SIM adicionar novas rotas com prefixo claro
- ✅ SIM deprecate endpoints antigos gradualmente

#### 3. Versionamento de APIs
\`\`\`
GET /api/v1/seasons/          (legacy)
GET /api/v2/certifications/   (novo)
POST /api/v2/marketplace/listings/ (novo)
\`\`\`

#### 4. Testes Obrigatórios
Antes de fazer PR, execute:

\`\`\`bash
# Unit tests
pytest tests/unit/ -v --cov=backend.{module}

# Integration tests
pytest tests/integration/ -v

# Verificar quebra de APIs existentes
pytest tests/regression/

# Security scan
bandit -r backend/
\`\`\`

### Para Product Managers

#### 1. Ativar Features para Beta
\`\`\`python
# admin panel
Feature Flag: CERTIFICATIONS = True (for beta_testers group)
\`\`\`

#### 2. Rollout Gradual
- Semana 1: Beta testers (10 pessoas)
- Semana 2: Early adopters (100 pessoas)
- Semana 3: 10% da população
- Semana 4: 50% da população
- Semana 5: 100% (general availability)

### Para DevOps

#### 1. Deploy Seguro
\`\`\`bash
# 1. Deploy no staging
git push origin feature/certifications
# GitHub Actions roda todos os testes

# 2. Se tudo passar, criar PR
# Code review obrigatório (2 pessoas)

# 3. Merge em develop
# Staging environment atualiza automaticamente

# 4. Testing em staging
# Smoke tests, regression tests

# 5. Se OK, merge em main (produção)
# Production deployment

# 6. Monitorar logs
tail -f logs/acredita.log | grep ERROR
\`\`\`
```

---

## 🔧 Fase 2: Implementação Modular (Semana 3-8)

### Módulo 1: Certificações (Semana 3-4)

#### 2.1 Modelos de Dados
```python
# backend/certifications/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ProfessionalCategory(models.Model):
    """Categorias profissionais reconhecidas pelo INEFOB"""
    name = models.CharField(max_length=200)
    inefob_code = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Professional Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name

class TrainingProgram(models.Model):
    """Programas de formação"""
    category = models.ForeignKey(ProfessionalCategory, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    provider = models.CharField(max_length=200)
    duration_hours = models.IntegerField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    is_inefob_certified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title

class CandidateEnrollment(models.Model):
    """Inscrição em programa de formação"""
    STATUS_CHOICES = [
        ('enrolled', 'Inscrito'),
        ('in_progress', 'Em Progresso'),
        ('completed', 'Concluído'),
        ('certified', 'Certificado'),
    ]
    
    candidate = models.ForeignKey(User, on_delete=models.CASCADE)
    program = models.ForeignKey(TrainingProgram, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='enrolled')
    enrollment_date = models.DateTimeField(auto_now_add=True)
    completion_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('candidate', 'program')
        ordering = ['-enrollment_date']
    
    def __str__(self):
        return f"{self.candidate} - {self.program}"
```

#### 2.2 Migrations (Sem quebrar código)
```bash
# Criar migrations
python manage.py makemigrations certifications

# Ver SQL gerado (verificar se é retrocompatível)
python manage.py sqlmigrate certifications 0001

# Aplicar em staging primeiro
python manage.py migrate certifications --database=staging

# Se OK, aplicar em produção
python manage.py migrate certifications
```

#### 2.3 APIs (Endpoints)
```python
# backend/certifications/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.decorators import method_decorator
from backend.core.feature_flags import check_feature_flag
from .models import ProfessionalCategory, TrainingProgram, CandidateEnrollment
from .serializers import (
    ProfessionalCategorySerializer,
    TrainingProgramSerializer,
    CandidateEnrollmentSerializer
)

@method_decorator(check_feature_flag('certifications'), name='dispatch')
class ProfessionalCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Listar categorias profissionais"""
    queryset = ProfessionalCategory.objects.all()
    serializer_class = ProfessionalCategorySerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['inefob_code']
    search_fields = ['name', 'description']

@method_decorator(check_feature_flag('certifications'), name='dispatch')
class TrainingProgramViewSet(viewsets.ReadOnlyModelViewSet):
    """Listar programas de formação"""
    queryset = TrainingProgram.objects.all()
    serializer_class = TrainingProgramSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['category', 'is_inefob_certified']
    ordering_fields = ['cost', 'duration_hours']

@method_decorator(check_feature_flag('certifications'), name='dispatch')
class CandidateEnrollmentViewSet(viewsets.ModelViewSet):
    """Gerir inscrições em programas"""
    queryset = CandidateEnrollment.objects.all()
    serializer_class = CandidateEnrollmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Cada user vê apenas suas inscrições
        if self.request.user.is_staff:
            return CandidateEnrollment.objects.all()
        return CandidateEnrollment.objects.filter(candidate=self.request.user)
    
    def perform_create(self, serializer):
        # Inscrever user atual
        serializer.save(candidate=self.request.user)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Marcar programa como concluído"""
        enrollment = self.get_object()
        enrollment.status = 'completed'
        enrollment.completion_date = timezone.now()
        enrollment.save()
        return Response({'status': 'programa concluído'})
    
    @action(detail=True, methods=['post'])
    def certify(self, request, pk=None):
        """Emitir certificado (admin only)"""
        if not request.user.is_staff:
            return Response({'error': 'Não autorizado'}, status=status.HTTP_403_FORBIDDEN)
        
        enrollment = self.get_object()
        enrollment.status = 'certified'
        enrollment.save()
        
        # Aqui integrar com blockchain ou gerador de PDF
        # gerar_certificado(enrollment)
        
        return Response({'status': 'certificado emitido'})

# backend/certifications/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProfessionalCategoryViewSet,
    TrainingProgramViewSet,
    CandidateEnrollmentViewSet
)

router = DefaultRouter()
router.register(r'categories', ProfessionalCategoryViewSet)
router.register(r'programs', TrainingProgramViewSet)
router.register(r'enrollments', CandidateEnrollmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

# Adicionar em backend/acredita_backend/urls.py
path('api/v2/certifications/', include('backend.certifications.urls')),
```

#### 2.4 Testes (Proteção contra regressão)
```python
# tests/unit/certifications/test_models.py
import pytest
from django.contrib.auth import get_user_model
from backend.certifications.models import (
    ProfessionalCategory, TrainingProgram, CandidateEnrollment
)

User = get_user_model()

@pytest.mark.django_db
class TestProfessionalCategory:
    
    def test_create_category(self):
        category = ProfessionalCategory.objects.create(
            name='Motoqueiro',
            inefob_code='MTQ001',
            description='Condutor profissional de motociclo'
        )
        assert category.name == 'Motoqueiro'
        assert category.inefob_code == 'MTQ001'
    
    def test_category_unique_code(self):
        ProfessionalCategory.objects.create(
            name='Cat1',
            inefob_code='CODE1',
            description='Test'
        )
        with pytest.raises(Exception):  # IntegrityError
            ProfessionalCategory.objects.create(
                name='Cat2',
                inefob_code='CODE1',  # Duplicate
                description='Test'
            )

@pytest.mark.django_db
class TestCandidateEnrollment:
    
    def test_enroll_candidate(self):
        category = ProfessionalCategory.objects.create(
            name='Test', inefob_code='TST', description='Test'
        )
        program = TrainingProgram.objects.create(
            category=category,
            title='Test Program',
            provider='Test Provider',
            duration_hours=40,
            cost=5000.00
        )
        user = User.objects.create_user(username='test', password='test')
        
        enrollment = CandidateEnrollment.objects.create(
            candidate=user,
            program=program
        )
        
        assert enrollment.status == 'enrolled'
        assert enrollment.candidate == user

# tests/integration/certifications/test_apis.py
import pytest
from rest_framework import status
from rest_framework.test import APIClient

@pytest.mark.django_db
class TestCertificationAPIs:
    
    def setup_method(self):
        self.client = APIClient()
        # Criar user teste
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_list_categories(self):
        # Criar categoria
        ProfessionalCategory.objects.create(
            name='Test',
            inefob_code='TST',
            description='Test'
        )
        
        # Fazer request
        response = self.client.get('/api/v2/certifications/categories/')
        
        # Verificar
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1
    
    def test_enroll_in_program(self):
        # Setup
        category = ProfessionalCategory.objects.create(
            name='Test', inefob_code='TST', description='Test'
        )
        program = TrainingProgram.objects.create(
            category=category,
            title='Test',
            provider='Test',
            duration_hours=40,
            cost=5000.00
        )
        
        # Fazer enrollment
        response = self.client.post(
            '/api/v2/certifications/enrollments/',
            {'program': program.id}
        )
        
        # Verificar
        assert response.status_code == status.HTTP_201_CREATED
        assert CandidateEnrollment.objects.count() == 1
```

#### 2.5 Admin Interface
```python
# backend/certifications/admin.py
from django.contrib import admin
from .models import ProfessionalCategory, TrainingProgram, CandidateEnrollment

@admin.register(ProfessionalCategory)
class ProfessionalCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'inefob_code', 'created_at']
    search_fields = ['name', 'inefob_code']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(TrainingProgram)
class TrainingProgramAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'provider', 'duration_hours', 'cost']
    list_filter = ['category', 'is_inefob_certified', 'created_at']
    search_fields = ['title', 'provider']

@admin.register(CandidateEnrollment)
class CandidateEnrollmentAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'program', 'status', 'enrollment_date']
    list_filter = ['status', 'enrollment_date']
    search_fields = ['candidate__username', 'program__title']
    readonly_fields = ['enrollment_date', 'completion_date']
    
    actions = ['mark_as_certified']
    
    def mark_as_certified(self, request, queryset):
        updated = queryset.update(status='certified')
        self.message_user(request, f'{updated} inscrições certificadas')
    mark_as_certified.short_description = 'Marcar como certificado'
```

#### 2.6 Frontend (React)
```typescript
// frontend/src/pages/CertificationsPage.tsx
import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useFeatureFlag } from '../hooks/useFeatureFlag';

export const CertificationsPage: React.FC = () => {
  const certificationsEnabled = useFeatureFlag('certifications');
  const [categories, setCategories] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!certificationsEnabled) return;
    
    loadData();
  }, [certificationsEnabled]);

  const loadData = async () => {
    try {
      const categoriesRes = await apiService.get('/api/v2/certifications/categories/');
      const programsRes = await apiService.get('/api/v2/certifications/programs/');
      
      setCategories(categoriesRes.data.results);
      setPrograms(programsRes.data.results);
    } catch (error) {
      console.error('Erro ao carregar certificações:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!certificationsEnabled) {
    return <div>Funcionalidade não disponível</div>;
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="certifications-page">
      <h1>Programas de Certificação</h1>
      
      <div className="categories">
        {categories.map(cat => (
          <div key={cat.id} className="category-card">
            <h3>{cat.name}</h3>
            <p>{cat.description}</p>
          </div>
        ))}
      </div>

      <div className="programs">
        <h2>Programas Disponíveis</h2>
        {programs.map(prog => (
          <div key={prog.id} className="program-card">
            <h4>{prog.title}</h4>
            <p>Duração: {prog.duration_hours}h</p>
            <p>Custo: AOA {prog.cost}</p>
            <button onClick={() => enrollProgram(prog.id)}>
              Inscrever
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

async function enrollProgram(programId: number) {
  try {
    await apiService.post('/api/v2/certifications/enrollments/', {
      program: programId
    });
    alert('Inscrição realizada com sucesso!');
  } catch (error) {
    console.error('Erro ao inscrever:', error);
  }
}
```

---

### Módulo 2: Marketplace (Semana 5-6)

**Seguir o mesmo padrão do Módulo 1:**
1. Criar models (marketplace/models.py)
2. Criar migrations (protegidas)
3. Criar serializers + views
4. Criar APIs (endpoints)
5. Criar testes (unit + integration)
6. Criar admin interface
7. Criar frontend (React)
8. Ativar feature flag

**Arquitetura:**
```
backend/marketplace/
├── models.py          # ServiceProvider, ServiceListing, ServiceOrder, Review
├── views.py           # ViewSets com search, filter
├── serializers.py
├── urls.py
├── admin.py
├── tasks.py           # Celery: notificações, emails
├── search.py          # Elasticsearch integration
├── filters.py         # DjangoFilterBackend customizado
├── tests.py
└── migrations/
```

### Módulo 3: Kixikila (Semana 7-8)

**Seguir o mesmo padrão:**
```
backend/kixikila/
├── models.py          # KixikilaGroup, Membership, Contribution, Payout
├── views.py
├── serializers.py
├── urls.py
├── admin.py
├── engine.py          # Lógica de rotação + disbursement
├── matching.py        # Algoritmo IA para formar grupos
├── notifications.py   # SMS/WhatsApp alerts
├── tests.py
└── migrations/
```

---

## 🛡️ Fase 3: Proteção & Validação (Semana 9)

### 3.1 Testes de Regressão
```bash
# Executar todos os testes dos módulos antigos
pytest tests/regression/ --cov=backend.accounts
pytest tests/regression/ --cov=backend.participants
pytest tests/regression/ --cov=backend.seasons
pytest tests/regression/ --cov=backend.voting
pytest tests/regression/ --cov=backend.donations
pytest tests/regression/ --cov=backend.store
pytest tests/regression/ --cov=backend.blog
pytest tests/regression/ --cov=backend.content
pytest tests/regression/ --cov=backend.games
pytest tests/regression/ --cov=backend.ads

# Coverage report
coverage report --fail-under=80
coverage html  # Gera relatório HTML
```

### 3.2 Testes de API Antigos
```bash
# Verificar que endpoints antigos ainda funcionam
pytest tests/regression/test_old_apis.py -v

# Exemplo
def test_seasons_api_still_works():
    """Garantir que GET /api/seasons/ continua funcionando"""
    response = client.get('/api/seasons/')
    assert response.status_code == 200
    assert 'results' in response.data
```

### 3.3 Load Testing
```bash
# locustfile.py
from locust import HttpUser, task, between

class AcreditaUser(HttpUser):
    wait_time = between(1, 3)
    
    @task(3)
    def view_seasons(self):
        self.client.get("/api/seasons/")
    
    @task(1)
    def view_certifications(self):
        self.client.get("/api/v2/certifications/categories/")

# Executar
locust -f locustfile.py --host=http://127.0.0.1:8000 -u 100 -r 10
```

### 3.4 Security Audit
```bash
# Verificar vulnerabilidades
bandit -r backend/ -f json > security-report.json

# OWASP Top 10
# - SQL Injection: ✅ Django ORM protegido
# - Auth bypass: ✅ JWT + 2FA
# - XSS: ✅ React auto-escape
# - CSRF: ✅ Django CSRF tokens
# - Insecure deserialization: ✅ Validação JSON
# - XXE: ✅ Django parser seguro
# - Broken access: ✅ Permissões granulares
# - Sensitive data exposure: ✅ HTTPS + encryption
# - Broken auth: ✅ JWT refresh + expiry
# - Using known vulns: ✅ `pip-audit` weekly
```

---

## 🚀 Fase 4: Deploy & Rollout (Semana 10+)

### 4.1 Deploy em Staging
```bash
# 1. Merge em develop
git checkout develop
git merge feature/certifications --no-ff

# 2. Tag version
git tag v2.1.0-beta.1

# 3. Push (triggers CI/CD)
git push origin develop --tags

# 4. Aguardar GitHub Actions
# ✅ Build ✅ Tests ✅ Deploy Staging

# 5. Testes manuais em staging
# http://staging.acredita.ao
curl https://staging.acredita.ao/api/v2/certifications/categories/
```

### 4.2 Beta Testing (1 semana)
```python
# admin.py - Criar grupo de beta testers
from django.contrib.auth.models import Group, Permission

beta_group, _ = Group.objects.get_or_create(name='beta_testers')

# Adicionar permissões
permissions = Permission.objects.filter(codename__in=[
    'add_candidateenrollment',
    'view_trainingprogram',
])
beta_group.permissions.add(*permissions)

# Ativar feature flag para grupo
# settings.FEATURE_FLAGS['CERTIFICATIONS'] = 'beta_testers'
```

**Feedback Loop:**
- [ ] Coletar feedback de 20 beta testers
- [ ] Fixar bugs críticos
- [ ] Otimizar performance
- [ ] Ajustar UX baseado em testes

### 4.3 Rollout Gradual (Canary Deployment)
```bash
# 1. Deploy em 5% dos servidores
kubectl set image deployment/acredita-api \
  acredita-api=acredita:v2.1.0 --record=true

# 2. Monitorar métricas por 2 horas
# - Error rate < 0.1%
# - Latência < 200ms p95
# - CPU < 70%

# 3. Se OK, aumentar para 25%
kubectl patch deployment acredita-api -p \
  '{"spec":{"replicas":4}}'

# 4. Se OK, aumentar para 50%
# 5. Se OK, aumentar para 100%

# Rollback instantâneo se necessário
kubectl rollout undo deployment/acredita-api
```

### 4.4 Feature Flag Rollout
```python
# Week 1: Beta testers only
FEATURE_FLAGS = {
    'CERTIFICATIONS': 'beta_testers_only',
}

# Week 2: 10% of users
FEATURE_FLAGS = {
    'CERTIFICATIONS': 'random_10pct',
}

# Week 3: 50% of users
FEATURE_FLAGS = {
    'CERTIFICATIONS': 'random_50pct',
}

# Week 4: 100% (General Availability)
FEATURE_FLAGS = {
    'CERTIFICATIONS': True,
}

# Implementation
def should_show_certifications(user):
    import hashlib
    
    user_hash = int(hashlib.md5(
        str(user.id).encode()).hexdigest(), 16)
    
    if FEATURE_FLAGS['CERTIFICATIONS'] == 'random_10pct':
        return (user_hash % 100) < 10
    elif FEATURE_FLAGS['CERTIFICATIONS'] == 'random_50pct':
        return (user_hash % 100) < 50
    elif FEATURE_FLAGS['CERTIFICATIONS'] is True:
        return True
    else:
        return user.groups.filter(name='beta_testers').exists()
```

---

## 📊 Monitoramento Contínuo

### 5.1 Dashboards (Grafana)
```
Métricas Chave:
- DAU/MAU (Daily/Monthly Active Users)
- Erro rate por endpoint
- Latência por API
- Conversão (views → enroll → complete)
- Revenue por módulo
- User retention por cohorte
```

### 5.2 Alertas
```yaml
# prometheus-rules.yml
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 5m
  annotations:
    summary: "High error rate detected"

- alert: HighLatency
  expr: histogram_quantile(0.95, http_request_duration_seconds) > 0.5
  for: 5m
  annotations:
    summary: "API latency > 500ms"
```

### 5.3 Log Analysis
```bash
# ELK Stack (Elasticsearch, Logstash, Kibana)
# ou Datadog/New Relic

# Buscar erros em novo módulo
SELECT * FROM logs 
WHERE module='certifications' 
  AND level='ERROR' 
  AND timestamp > now() - 1h
ORDER BY timestamp DESC
```

---

## ✅ Checklist de Deploy

```markdown
## Antes do Deploy

- [ ] Todos os testes passam (100% green CI)
- [ ] Code review aprovado (mínimo 2 pessoas)
- [ ] Documentação atualizada
- [ ] Migrations testadas em staging
- [ ] Performance benchmark aceito
- [ ] Security audit completo
- [ ] Customer support notificado
- [ ] Rollback plan documentado
- [ ] Monitoring alerts configurados

## Durante o Deploy

- [ ] Feature flags desativadas (safe defaults)
- [ ] Deploy em staging PRIMEIRO
- [ ] Testes de fumaça em staging
- [ ] Deploy em produção (canary 5%)
- [ ] Monitorar logs por 1 hora
- [ ] Aumentar gradualmente (25% → 50% → 100%)
- [ ] Ativar feature flags gradualmente
- [ ] Comunicar status ao time

## Depois do Deploy

- [ ] Verificar métricas por 24h
- [ ] Coletar feedback de usuários
- [ ] Identificar bugs críticos
- [ ] Aplicar hotfixes se necessário
- [ ] Documentar lições aprendidas
- [ ] Publicar release notes
- [ ] Comemorar! 🎉
```

---

## 🎓 Boas Práticas Implementadas

1. **Feature Branching** ✅ - Isolamento de features
2. **Feature Flags** ✅ - Deploy seguro e gradual
3. **Zero Downtime Deployments** ✅ - Database migrations safe
4. **Comprehensive Testing** ✅ - Unit, integration, E2E, load
5. **Code Review** ✅ - Validação de qualidade
6. **CI/CD Pipeline** ✅ - Automação total
7. **Monitoring & Logging** ✅ - Observabilidade completa
8. **Documentation** ✅ - Tudo registado
9. **Rollback Capability** ✅ - Recuperação rápida
10. **User Communication** ✅ - Transparência total

---

## 📞 Suporte & Troubleshooting

### Problema: Migração falha em produção
```bash
# Rollback
python manage.py migrate certifications 0000

# Verificar estado
python manage.py showmigrations certifications

# Fixar e retentar
python manage.py migrate certifications
```

### Problema: Feature flag não funciona
```python
# Debug
from backend.core.feature_flags import FeatureFlagService, FeatureFlag
print(FeatureFlagService.is_enabled(FeatureFlag.CERTIFICATIONS))
print(FeatureFlagService.DEFAULTS)
```

### Problema: API antigo quebrou
```bash
# Verificar logs
grep "ERROR" logs/acredita.log | grep "seasons"

# Reverter commit
git revert <commit-id>
git push

# Hotfix
git hotfix start bug-seasons-api
# ... fix código
git hotfix finish
```

---

## 📚 Referências

- Django Migrations: https://docs.djangoproject.com/en/5.0/topics/migrations/
- DRF Versioning: https://www.django-rest-framework.org/api-guide/versioning/
- Feature Flags: https://martinfowler.com/articles/feature-toggles.html
- Canary Deployments: https://martinfowler.com/bliki/CanaryRelease.html
- Zero-Downtime Deployments: https://www.digital.gov/blog/zero-downtime-deployment/

---

**Preparado por:** Equipa Técnica Acredita  
**Data:** 09/12/2025  
**Status:** Pronto para Implementação  
**Próximo Review:** Após Fase 1 (Dia 7)

> **"Crescer com segurança: adicionar features sem quebrar o que funciona."** 🚀
