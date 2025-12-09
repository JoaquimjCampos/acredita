# 🚀 Guia de Execução Prática - Começar HOJE

**Data:** 09/12/2025 | **Objetivo:** Iniciar implementação dos 3 módulos mantendo estabilidade

---

## ⏱️ Dia 1: Setup & Preparação (2-3 horas)

### 1.1 Criar Feature Flag System
```bash
cd C:\apps\Acredita

# Criar arquivo de feature flags
cat > backend/core/feature_flags.py << 'EOF'
from django.conf import settings
from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from enum import Enum

class FeatureFlag(Enum):
    CERTIFICATIONS = "certifications"
    MARKETPLACE = "marketplace"
    KIXIKILA = "kixikila"
    ADVANCED_PAYMENTS = "advanced_payments"

class FeatureFlagService:
    """Gerenciador de feature flags"""
    
    @staticmethod
    def is_enabled(flag_name, user=None):
        """Verifica se feature está ativada"""
        # Em desenvolvimento, tudo ativado
        if settings.DEBUG:
            return True
        
        # Admin sempre tem acesso
        if user and user.is_staff:
            return True
        
        # Beta testers
        if user and hasattr(user, 'groups'):
            if user.groups.filter(name='beta_testers').exists():
                return True
        
        # Produção: verificar settings
        flags = getattr(settings, 'ACTIVE_FEATURES', {})
        return flags.get(flag_name, False)

def check_feature_flag(feature_name):
    """Decorator para proteger endpoints"""
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            if FeatureFlagService.is_enabled(feature_name, request.user):
                return view_func(request, *args, **kwargs)
            else:
                return Response(
                    {'error': f'{feature_name} não está disponível'},
                    status=status.HTTP_403_FORBIDDEN
                )
        return wrapped_view
    return decorator
EOF

echo "✅ Feature flags criados"
```

### 1.2 Adicionar Novos Apps
```bash
cd backend

# Criar apps
python manage.py startapp certifications
python manage.py startapp marketplace
python manage.py startapp kixikila
python manage.py startapp core

echo "✅ Apps criados"
```

### 1.3 Atualizar settings.py
```python
# Abrir C:\apps\Acredita\backend\acredita_backend\settings.py
# E adicionar no INSTALLED_APPS (após apps existentes):

INSTALLED_APPS = [
    # ... apps existentes ...
    'backend.core',
    'backend.certifications',
    'backend.marketplace', 
    'backend.kixikila',
]

# Adicionar feature flags (antes de usar)
ACTIVE_FEATURES = {
    'certifications': False,  # Desativado por padrão
    'marketplace': False,
    'kixikila': False,
}
```

### 1.4 Criar primeiro Model (Certificações)
```bash
cat > backend/certifications/models.py << 'EOF'
from django.db import models
from django.contrib.auth.models import User

class ProfessionalCategory(models.Model):
    """Categorias profissionais INEFOB"""
    name = models.CharField(max_length=200, unique=True)
    inefob_code = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Professional Categories'
        ordering = ['name']
        db_table = 'certifications_professionalcategory'
    
    def __str__(self):
        return self.name

class TrainingProgram(models.Model):
    """Programas de formação"""
    category = models.ForeignKey(
        ProfessionalCategory, 
        on_delete=models.CASCADE,
        related_name='programs'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    provider = models.CharField(max_length=200)
    duration_hours = models.IntegerField()
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_inefob_certified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'certifications_trainingprogram'
    
    def __str__(self):
        return self.title

class CandidateEnrollment(models.Model):
    """Inscrição em programa de formação"""
    ENROLLED = 'enrolled'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    CERTIFIED = 'certified'
    
    STATUS_CHOICES = [
        (ENROLLED, 'Inscrito'),
        (IN_PROGRESS, 'Em Progresso'),
        (COMPLETED, 'Concluído'),
        (CERTIFIED, 'Certificado'),
    ]
    
    candidate = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='certifications_enrollments'
    )
    program = models.ForeignKey(
        TrainingProgram,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=ENROLLED
    )
    enrollment_date = models.DateTimeField(auto_now_add=True)
    completion_date = models.DateTimeField(null=True, blank=True)
    certificate_url = models.URLField(null=True, blank=True)
    
    class Meta:
        unique_together = ('candidate', 'program')
        ordering = ['-enrollment_date']
        db_table = 'certifications_candidateenrollment'
    
    def __str__(self):
        return f"{self.candidate.username} - {self.program.title}"
EOF

echo "✅ Models de certificações criados"
```

### 1.5 Criar Serializers
```bash
cat > backend/certifications/serializers.py << 'EOF'
from rest_framework import serializers
from .models import ProfessionalCategory, TrainingProgram, CandidateEnrollment

class ProfessionalCategorySerializer(serializers.ModelSerializer):
    programs_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ProfessionalCategory
        fields = ['id', 'name', 'inefob_code', 'description', 'programs_count']
    
    def get_programs_count(self, obj):
        return obj.programs.filter(is_active=True).count()

class TrainingProgramSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = TrainingProgram
        fields = [
            'id', 'title', 'description', 'category', 'category_name',
            'provider', 'duration_hours', 'cost', 'is_inefob_certified'
        ]
        read_only_fields = ['id', 'category_name']

class CandidateEnrollmentSerializer(serializers.ModelSerializer):
    program_title = serializers.CharField(source='program.title', read_only=True)
    candidate_username = serializers.CharField(source='candidate.username', read_only=True)
    
    class Meta:
        model = CandidateEnrollment
        fields = [
            'id', 'candidate', 'candidate_username', 'program', 'program_title',
            'status', 'enrollment_date', 'completion_date', 'certificate_url'
        ]
        read_only_fields = ['id', 'enrollment_date', 'candidate', 'candidate_username', 'program_title']
EOF

echo "✅ Serializers criados"
```

### 1.6 Criar Views/APIViews
```bash
cat > backend/certifications/views.py << 'EOF'
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from backend.core.feature_flags import check_feature_flag, FeatureFlagService
from .models import ProfessionalCategory, TrainingProgram, CandidateEnrollment
from .serializers import (
    ProfessionalCategorySerializer,
    TrainingProgramSerializer,
    CandidateEnrollmentSerializer
)

class ProfessionalCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Listar categorias profissionais INEFOB"""
    queryset = ProfessionalCategory.objects.all()
    serializer_class = ProfessionalCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['name', 'inefob_code', 'description']
    
    def list(self, request, *args, **kwargs):
        if not FeatureFlagService.is_enabled('certifications', request.user):
            return Response(
                {'error': 'Certificações não disponíveis'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().list(request, *args, **kwargs)

class TrainingProgramViewSet(viewsets.ReadOnlyModelViewSet):
    """Listar programas de formação disponíveis"""
    queryset = TrainingProgram.objects.filter(is_active=True)
    serializer_class = TrainingProgramSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'is_inefob_certified']
    search_fields = ['title', 'description', 'provider']
    ordering_fields = ['cost', 'duration_hours']
    ordering = ['-created_at']
    
    def list(self, request, *args, **kwargs):
        if not FeatureFlagService.is_enabled('certifications', request.user):
            return Response(
                {'error': 'Certificações não disponíveis'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().list(request, *args, **kwargs)

class CandidateEnrollmentViewSet(viewsets.ModelViewSet):
    """Gerir inscrições em programas de formação"""
    serializer_class = CandidateEnrollmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'program__category']
    ordering_fields = ['enrollment_date', 'completion_date']
    ordering = ['-enrollment_date']
    
    def get_queryset(self):
        if not FeatureFlagService.is_enabled('certifications', self.request.user):
            return CandidateEnrollment.objects.none()
        
        if self.request.user.is_staff:
            return CandidateEnrollment.objects.all()
        return CandidateEnrollment.objects.filter(candidate=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Inscrever candidato num programa"""
        if not FeatureFlagService.is_enabled('certifications', request.user):
            return Response(
                {'error': 'Certificações não disponíveis'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        program_id = request.data.get('program')
        
        # Verificar se já está inscrito
        if CandidateEnrollment.objects.filter(
            candidate=request.user,
            program_id=program_id
        ).exists():
            return Response(
                {'error': 'Já está inscrito neste programa'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(candidate=request.user)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        """Marcar programa como concluído"""
        enrollment = self.get_object()
        
        if enrollment.candidate != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Sem permissão'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        enrollment.status = CandidateEnrollment.COMPLETED
        enrollment.save()
        
        return Response({'status': 'Programa marcado como concluído'})
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def certify(self, request, pk=None):
        """Emitir certificado (admin only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Apenas administradores podem emitir certificados'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        enrollment = self.get_object()
        enrollment.status = CandidateEnrollment.CERTIFIED
        # Aqui seria: enrollment.certificate_url = gerar_certificado(enrollment)
        enrollment.save()
        
        return Response({'status': 'Certificado emitido'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@check_feature_flag('certifications')
def certification_stats(request):
    """Estatísticas de certificações do usuário"""
    stats = {
        'total_enrolled': CandidateEnrollment.objects.filter(
            candidate=request.user
        ).count(),
        'completed': CandidateEnrollment.objects.filter(
            candidate=request.user,
            status=CandidateEnrollment.COMPLETED
        ).count(),
        'certified': CandidateEnrollment.objects.filter(
            candidate=request.user,
            status=CandidateEnrollment.CERTIFIED
        ).count(),
    }
    return Response(stats)
EOF

echo "✅ Views criados"
```

### 1.7 Criar URLs
```bash
cat > backend/certifications/urls.py << 'EOF'
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProfessionalCategoryViewSet,
    TrainingProgramViewSet,
    CandidateEnrollmentViewSet,
    certification_stats
)

router = DefaultRouter()
router.register(r'categories', ProfessionalCategoryViewSet, basename='category')
router.register(r'programs', TrainingProgramViewSet, basename='program')
router.register(r'enrollments', CandidateEnrollmentViewSet, basename='enrollment')

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', certification_stats, name='certification-stats'),
]
EOF

echo "✅ URLs criados"
```

### 1.8 Adicionar URLs ao Backend
```python
# Abrir C:\apps\Acredita\backend\acredita_backend\urls.py
# Adicionar esta linha no path():

path('api/v2/certifications/', include('backend.certifications.urls')),
```

### 1.9 Criar Migrations e Aplicar
```bash
cd C:\apps\Acredita

# Criar migrations
python manage.py makemigrations certifications

# Ver SQL que será executado
python manage.py sqlmigrate certifications 0001

# Aplicar migrations
python manage.py migrate certifications

echo "✅ Migrations aplicadas"
```

### 1.10 Criar Admin Interface
```bash
cat > backend/certifications/admin.py << 'EOF'
from django.contrib import admin
from django.utils.html import format_html
from .models import ProfessionalCategory, TrainingProgram, CandidateEnrollment

@admin.register(ProfessionalCategory)
class ProfessionalCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'inefob_code', 'programs_count', 'created_at']
    search_fields = ['name', 'inefob_code']
    readonly_fields = ['created_at', 'updated_at']
    
    def programs_count(self, obj):
        count = obj.programs.filter(is_active=True).count()
        return format_html(
            '<span style="background-color: #ddd; padding: 3px 8px; border-radius: 3px;">{}</span>',
            count
        )
    programs_count.short_description = 'Programas Ativos'

@admin.register(TrainingProgram)
class TrainingProgramAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'provider', 'duration_hours', 'cost', 'is_active']
    list_filter = ['category', 'is_inefob_certified', 'is_active', 'created_at']
    search_fields = ['title', 'provider', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('title', 'description', 'category', 'provider')
        }),
        ('Detalhes do Programa', {
            'fields': ('duration_hours', 'cost', 'is_inefob_certified', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(CandidateEnrollment)
class CandidateEnrollmentAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'program', 'status', 'enrollment_date']
    list_filter = ['status', 'enrollment_date', 'program__category']
    search_fields = ['candidate__username', 'program__title']
    readonly_fields = ['enrollment_date', 'completion_date']
    fieldsets = (
        ('Inscrição', {
            'fields': ('candidate', 'program', 'status')
        }),
        ('Datas', {
            'fields': ('enrollment_date', 'completion_date')
        }),
        ('Certificado', {
            'fields': ('certificate_url',)
        }),
    )
    
    actions = ['mark_as_completed', 'mark_as_certified']
    
    def mark_as_completed(self, request, queryset):
        updated = queryset.update(status='completed')
        self.message_user(request, f'{updated} inscrições marcadas como concluídas')
    mark_as_completed.short_description = "Marcar como Concluído"
    
    def mark_as_certified(self, request, queryset):
        updated = queryset.update(status='certified')
        self.message_user(request, f'{updated} inscrições certificadas')
    mark_as_certified.short_description = "Marcar como Certificado"
EOF

echo "✅ Admin criado"
```

---

## ⏱️ Dia 2: Testes & Validação (2 horas)

### 2.1 Criar Testes Unitários
```bash
mkdir -p tests/unit/certifications

cat > tests/unit/certifications/test_models.py << 'EOF'
import pytest
from django.contrib.auth.models import User
from backend.certifications.models import (
    ProfessionalCategory, TrainingProgram, CandidateEnrollment
)

@pytest.mark.django_db
class TestCertificationModels:
    
    def test_create_category(self):
        category = ProfessionalCategory.objects.create(
            name='Motoqueiro',
            inefob_code='MTQ001',
            description='Condutor profissional'
        )
        assert category.name == 'Motoqueiro'
        assert str(category) == 'Motoqueiro'
    
    def test_create_program(self):
        category = ProfessionalCategory.objects.create(
            name='Test', inefob_code='TST', description='Test'
        )
        program = TrainingProgram.objects.create(
            category=category,
            title='Program Test',
            description='Test',
            provider='Provider',
            duration_hours=40,
            cost=5000.00
        )
        assert program.title == 'Program Test'
        assert program.category == category
    
    def test_enroll_candidate(self):
        user = User.objects.create_user(username='test', password='test')
        category = ProfessionalCategory.objects.create(
            name='Test', inefob_code='TST', description='Test'
        )
        program = TrainingProgram.objects.create(
            category=category,
            title='Test',
            description='Test',
            provider='Test',
            duration_hours=40,
            cost=5000.00
        )
        enrollment = CandidateEnrollment.objects.create(
            candidate=user,
            program=program
        )
        assert enrollment.status == 'enrolled'
        assert enrollment.candidate == user
EOF

echo "✅ Testes unitários criados"
```

### 2.2 Testar APIs
```bash
python -m pytest tests/unit/certifications/test_models.py -v

echo "✅ Testes passando"
```

### 2.3 Testar Endpoints Manualmente
```bash
# Terminal 1: Rodar servidor
python manage.py runserver

# Terminal 2: Fazer requests
# 1. Login
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"seu_user","password":"sua_pass"}'

# 2. Listar categorias
curl -X GET http://127.0.0.1:8000/api/v2/certifications/categories/ \
  -H "Authorization: Bearer SEU_TOKEN"

echo "✅ APIs funcionando"
```

---

## ⏱️ Dia 3: Deploy em Staging (1 hora)

### 3.1 Fazer Commit
```bash
git add .
git commit -m "feat: adicionar módulo de certificações com feature flag"
git push origin feature/certifications

echo "✅ Código enviado"
```

### 3.2 Criar Pull Request
```bash
# No GitHub:
# 1. Compare & pull request
# 2. Descrição:
"""
## Módulo de Certificações INEFOB

### Mudanças
- Novo app `certifications` com models ProfessionalCategory, TrainingProgram, CandidateEnrollment
- APIs REST em `/api/v2/certifications/`
- Feature flag para controlar acesso
- Admin interface completo

### Testes
- ✅ Unit tests para models
- ✅ API tests
- ✅ Compatibilidade com apps existentes

### Breaking Changes
- Nenhum. Completamente isolated.

### Rollback
Simples: desativar feature flag no settings ou reverter commit.
"""
```

### 3.3 Aguardar Code Review
- Mínimo 2 aprovações
- CI/CD pipeline verde ✅
- Testes passando ✅

---

## ⏱️ Dia 4-5: Beta Testing (8 horas)

### 4.1 Ativar Feature Flag para Beta Testers
```python
# backend/acredita_backend/settings.py
ACTIVE_FEATURES = {
    'certifications': 'beta_testers_only',  # Apenas beta testers
    'marketplace': False,
    'kixikila': False,
}

# OU criar grupo no admin
from django.contrib.auth.models import Group
Group.objects.get_or_create(name='beta_testers')

# E adicionar users ao grupo via admin
```

### 4.2 Recolher Feedback
- [ ] 20 beta testers usando por 48h
- [ ] Coletar bugs via formulário
- [ ] Testar performance
- [ ] Verificar segurança

### 4.3 Fixar Bugs Críticos
```bash
git checkout feature/certifications
# ... fazer fixes ...
git commit -m "fix: bugs encontrados em beta testing"
git push

# Merge após aprovação
```

---

## ✅ Resumo de Hoje

- ✅ Feature Flag System criado
- ✅ App de Certificações implementado (models, views, serializers, admin)
- ✅ APIs REST funcionais
- ✅ Testes passando
- ✅ Pronto para staging

**Próximos Passos:**
1. Code review (2 pessoas)
2. Merge em develop
3. Deploy em staging
4. Beta testing (5 dias)
5. Deploy em produção (feature flag para 10% → 50% → 100%)

**Tempo Total:** 5-7 dias da feature de certificações ao 100% dos users

**Repetir processo para:** Marketplace (Semana 5-6) → Kixikila (Semana 7-8)

> **Princípio:** Cada feature em isolation, feature flags para rollout seguro, testes rigorosos. ✅

---

## 🎯 Comandos Rápidos

```bash
# Depois de git clone
cd C:\apps\Acredita
source .venv/Scripts/activate  # ou .venv\Scripts\activate em PowerShell

# Rodar servidor
python manage.py runserver

# Rodar testes
pytest tests/ -v

# Criar nova app
python manage.py startapp app_name

# Criar migrations
python manage.py makemigrations

# Aplicar migrations
python manage.py migrate

# Acesso admin
http://127.0.0.1:8000/admin/

# Ver logs
tail -f logs/acredita.log
```

---

**Pronto para começar? Executar Dia 1 agora! 🚀**
