# 🏛️ ARQUITETURA UNIFICADA: Modelo de Dados & Business Logic

**Data**: Dezembro 2025  
**Objetivo**: Proposta de integração coesiva dos 3 pilares  
**Escopo**: UserProfile, Trust System, Analytics unificados

---

## 📊 VISÃO GERAL DO MODELO UNIFICADO

### Contexto Atual

Os 3 pilares têm **modelos independentes** mas **usuários compartilhados**:

```
Certificações:
  └─ User → CandidateEnrollment → TrainingProgram → Certificate

Marketplace:
  └─ User → ServiceProvider → ServiceListing → ServiceOrder → Review

Kixikila:
  └─ User → KixikilaMembership → KixikilaGroup → Contribution → Rating
```

**Problema**: 
- ❌ Sem conexão entre sistemas
- ❌ Reputação desintegrada (3 scores diferentes)
- ❌ Profile fragmentado (3 perfis diferentes)

**Solução**: 
- ✅ Modelo unificado de User
- ✅ Trust Score integrado
- ✅ User Dashboard holístico

---

## 🔗 MODELO DE DADOS PROPOSTO

### 1. Extended User Model

```python
# backend/accounts/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    """
    Extended user model com suporte integrado para 3 pilares
    """
    
    # Profile
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    location_province = models.CharField(max_length=50, blank=True, null=True)
    location_municipality = models.CharField(max_length=50, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True, unique=True)
    id_document = models.CharField(max_length=50, blank=True, null=True, unique=True)
    
    # Account Status
    is_verified = models.BooleanField(default=False)  # KYC verified
    is_provider = models.BooleanField(default=False)  # Can create marketplace listings
    is_instructor = models.BooleanField(default=False)  # Can teach certifications
    
    # Unified Trust System (0-100)
    trust_score = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Trust breakdown (for insights)
    certification_trust = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    marketplace_trust = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    kixikila_trust = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Statistics
    total_courses_completed = models.IntegerField(default=0)
    total_services_completed = models.IntegerField(default=0)
    total_contributions_made = models.IntegerField(default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'accounts_user'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.email} ({self.get_full_name()})"
    
    @property
    def trust_level(self) -> str:
        """Compute trust level based on score"""
        if self.trust_score >= 90:
            return 'CHAMPION'
        elif self.trust_score >= 70:
            return 'TRUSTED'
        elif self.trust_score >= 50:
            return 'CONTRIBUTOR'
        else:
            return 'BEGINNER'
    
    @property
    def is_complete_profile(self) -> bool:
        """Check if user has filled essential profile info"""
        required = [
            self.first_name,
            self.last_name,
            self.email,
            self.phone,
            self.location_province
        ]
        return all(required)
    
    def calculate_trust_score(self) -> int:
        """
        Calculate overall trust score from 3 pillars
        
        Formula:
        - Certification: 0-40 points (foundational trust)
        - Marketplace: 0-35 points (execution trust)
        - Kixikila: 0-25 points (community trust)
        
        Total: 0-100
        """
        score = 0
        
        # Certification component
        cert_weight = min(
            self.total_courses_completed * 5,  # 5 pts per course
            40
        )
        score += cert_weight
        
        # Marketplace component
        market_ratings = getattr(self, 'reviews', [])
        if market_ratings.exists():
            avg_rating = market_ratings.aggregate(
                avg=models.Avg('rating')
            )['avg'] or 0
            market_weight = int((avg_rating / 5) * 35)  # Normalize to 35
            score += market_weight
        
        # Kixikila component
        kix_contributions = self.kixikila_contributions.filter(
            status='confirmed'
        ).count()
        kix_weight = min(kix_contributions * 3, 25)  # 3 pts per confirmed contribution
        score += kix_weight
        
        return min(score, 100)
    
    def update_trust_score(self):
        """Recalculate and save trust score"""
        new_score = self.calculate_trust_score()
        self.trust_score = new_score
        
        # Update pillar-specific scores
        self.certification_trust = min(self.total_courses_completed * 5, 40)
        self.marketplace_trust = self._calculate_marketplace_trust()
        self.kixikila_trust = min(self.total_contributions_made * 3, 25)
        
        self.save(update_fields=[
            'trust_score',
            'certification_trust',
            'marketplace_trust',
            'kixikila_trust'
        ])
    
    def _calculate_marketplace_trust(self) -> int:
        """Helper: calculate marketplace-specific trust"""
        reviews = self.marketplace_listings.aggregate(
            avg_rating=models.Avg('reviews__rating'),
            review_count=models.Count('reviews')
        )
        
        if reviews['review_count'] == 0:
            return 0
        
        avg = reviews['avg_rating'] or 0
        normalized = int((avg / 5) * 35)
        return min(normalized, 35)
```

### 2. User Profile View (Unified)

```python
# backend/accounts/models.py

class UserProfile(models.Model):
    """
    Aggregated user profile data for quick dashboard access
    
    Updated via signals when related models change
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Certifications
    certificates_earned = models.IntegerField(default=0)
    current_enrollments = models.IntegerField(default=0)
    
    # Marketplace
    active_listings = models.IntegerField(default=0)
    completed_orders = models.IntegerField(default=0)
    average_rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        default=0.0
    )
    
    # Kixikila
    active_groups = models.IntegerField(default=0)
    total_saved = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Visibility
    is_public = models.BooleanField(default=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'accounts_userprofile'
        indexes = [
            models.Index(fields=['user', 'updated_at'])
        ]
    
    def __str__(self):
        return f"Profile of {self.user.email}"
    
    @classmethod
    def get_or_create_for_user(cls, user):
        """Get or create profile for user"""
        profile, created = cls.objects.get_or_create(user=user)
        return profile
```

### 3. Achievement & Badge System (Unified)

```python
# backend/accounts/models.py

class Badge(models.Model):
    """
    Achievement badges earned across all pillars
    """
    BADGE_CATEGORIES = [
        ('certification', 'Certificação'),
        ('marketplace', 'Marketplace'),
        ('kixikila', 'Kixikila'),
        ('engagement', 'Engajamento'),
    ]
    
    BADGE_TYPES = [
        ('FIRST_COURSE', 'Primeiro Curso'),
        ('CERTIFIED_EXPERT', 'Expert Certificado'),
        ('TRUSTED_PROVIDER', 'Fornecedor Confiável'),
        ('MARKETPLACE_MASTER', 'Master do Marketplace'),
        ('KIXIKILA_CONTRIBUTOR', 'Contribuidor Kixikila'),
        ('KIXIKILA_CHAMPION', 'Champion Kixikila'),
        ('COMMUNITY_HELPER', 'Ajudante da Comunidade'),
    ]
    
    name = models.CharField(max_length=100, choices=BADGE_TYPES)
    category = models.CharField(max_length=20, choices=BADGE_CATEGORIES)
    description = models.TextField()
    icon = models.CharField(max_length=20)  # emoji or icon name
    requirements = models.JSONField()  # {min_score: 70, min_courses: 3, etc}
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'accounts_badge'
        unique_together = ['name', 'category']


class UserBadge(models.Model):
    """
    Badge instance - user earning a badge
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'accounts_userbadge'
        unique_together = ['user', 'badge']
        ordering = ['-earned_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.badge.name}"
```

### 4. Activity Log (Unified)

```python
# backend/accounts/models.py

class UserActivity(models.Model):
    """
    Audit trail - todas as ações importantes do usuário
    """
    ACTIVITY_TYPES = [
        ('ENROLLED_COURSE', 'Inscrito em Curso'),
        ('COMPLETED_COURSE', 'Completou Curso'),
        ('CREATED_LISTING', 'Criou Serviço'),
        ('COMPLETED_ORDER', 'Completou Pedido'),
        ('CREATED_GROUP', 'Criou Grupo Kixikila'),
        ('MADE_CONTRIBUTION', 'Fez Contribuição'),
        ('EARNED_BADGE', 'Earned Badge'),
        ('RECEIVED_REVIEW', 'Received Review'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    description = models.TextField()
    related_object_id = models.IntegerField(blank=True, null=True)
    related_object_type = models.CharField(max_length=50, blank=True)
    metadata = models.JSONField(default=dict)  # Extra context
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'accounts_useractivity'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['activity_type', '-created_at'])
        ]
```

---

## 🔄 SIGNALS & AUTOMATION

### Auto-update Trust Score

```python
# backend/accounts/signals.py

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from certifications.models import CandidateEnrollment
from marketplace.models import ServiceOrder, MarketplaceReview
from kixikila.models import KixikilaContribution

@receiver(post_save, sender=CandidateEnrollment)
def on_enrollment_completed(sender, instance, created, **kwargs):
    """Update trust score when course completed"""
    if instance.status == 'completed' and not created:
        user = instance.candidate
        user.total_courses_completed = CandidateEnrollment.objects.filter(
            candidate=user,
            status='completed'
        ).count()
        user.update_trust_score()
        
        # Award badge if applicable
        from accounts.models import Badge, UserBadge
        badge = Badge.objects.filter(name='FIRST_COURSE').first()
        if badge and user.total_courses_completed == 1:
            UserBadge.objects.get_or_create(user=user, badge=badge)

@receiver(post_save, sender=ServiceOrder)
def on_order_completed(sender, instance, **kwargs):
    """Update trust score when marketplace order completed"""
    if instance.status == 'completed':
        user = instance.provider.user
        user.total_services_completed = ServiceOrder.objects.filter(
            provider__user=user,
            status='completed'
        ).count()
        user.update_trust_score()

@receiver(post_save, sender=KixikilaContribution)
def on_contribution_confirmed(sender, instance, **kwargs):
    """Update trust score when Kixikila contribution confirmed"""
    if instance.status == 'confirmed':
        user = instance.member.user
        user.total_contributions_made = KixikilaContribution.objects.filter(
            member__user=user,
            status='confirmed'
        ).count()
        user.update_trust_score()

# Register all signals
apps.ready()
```

---

## 📊 ANALYTICS ENDPOINTS (UNIFIED)

### 1. User Dashboard Stats

```python
# backend/accounts/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class UserViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """
        Retorna estatísticas unificadas do usuário para dashboard
        
        GET /api/accounts/me/dashboard_stats/
        """
        user = request.user
        user.update_trust_score()
        
        from certifications.models import CandidateEnrollment
        from marketplace.models import ServiceOrder
        from kixikila.models import KixikilaGroup
        
        return Response({
            'user': {
                'id': user.id,
                'name': user.get_full_name(),
                'email': user.email,
                'avatar': user.avatar.url if user.avatar else None,
                'trust_score': user.trust_score,
                'trust_level': user.trust_level,
                'is_verified': user.is_verified,
            },
            'certifications': {
                'total_enrolled': CandidateEnrollment.objects.filter(
                    candidate=user
                ).count(),
                'total_completed': user.total_courses_completed,
                'trust_contribution': user.certification_trust,
            },
            'marketplace': {
                'active_listings': user.marketplace_listings.filter(
                    is_active=True
                ).count(),
                'completed_orders': user.total_services_completed,
                'average_rating': user.profile.average_rating,
                'trust_contribution': user.marketplace_trust,
            },
            'kixikila': {
                'active_groups': KixikilaGroup.objects.filter(
                    members__user=user,
                    status='active'
                ).distinct().count(),
                'total_contributions': user.total_contributions_made,
                'trust_contribution': user.kixikila_trust,
            },
            'badges': [
                {
                    'id': badge.id,
                    'name': badge.badge.name,
                    'icon': badge.badge.icon,
                    'earned_at': badge.earned_at.isoformat(),
                }
                for badge in user.badges.all()
            ],
            'recent_activity': [
                {
                    'type': activity.activity_type,
                    'description': activity.description,
                    'timestamp': activity.created_at.isoformat(),
                }
                for activity in user.activities.all()[:5]
            ],
        })
    
    @action(detail=False, methods=['get'])
    def trust_breakdown(self, request):
        """
        Retorna breakdown detalhado do trust score
        
        GET /api/accounts/me/trust_breakdown/
        """
        user = request.user
        return Response({
            'overall_score': user.trust_score,
            'trust_level': user.trust_level,
            'components': {
                'certification': {
                    'score': user.certification_trust,
                    'max': 40,
                    'description': 'Baseado em cursos concluídos',
                },
                'marketplace': {
                    'score': user.marketplace_trust,
                    'max': 35,
                    'description': 'Baseado em classificações de clientes',
                },
                'kixikila': {
                    'score': user.kixikila_trust,
                    'max': 25,
                    'description': 'Baseado em contribuições pontuais',
                },
            },
            'next_milestone': self._get_next_milestone(user),
        })
    
    def _get_next_milestone(self, user):
        """Retorna próximo badge/level a alcançar"""
        if user.trust_score < 50:
            return {
                'level': 'CONTRIBUTOR',
                'progress': user.trust_score,
                'required': 50,
                'remaining': 50 - user.trust_score,
                'description': 'Complete 10 ações ou ganhe 50 pontos'
            }
        elif user.trust_score < 70:
            return {
                'level': 'TRUSTED',
                'progress': user.trust_score,
                'required': 70,
                'remaining': 70 - user.trust_score,
            }
        else:
            return {
                'level': 'CHAMPION',
                'progress': user.trust_score,
                'required': 100,
                'remaining': max(0, 100 - user.trust_score),
            }
```

### 2. Leaderboard Unificado

```python
# backend/accounts/views.py

@action(detail=False, methods=['get'])
def leaderboard(self, request):
    """
    Leaderboard global por trust score
    
    GET /api/accounts/leaderboard/?limit=100&category=all
    """
    category = request.query_params.get('category', 'all')  # all|certification|marketplace|kixikila
    limit = int(request.query_params.get('limit', 100))
    
    users = User.objects.filter(is_verified=True).order_by('-trust_score')[:limit]
    
    data = []
    for rank, user in enumerate(users, 1):
        data.append({
            'rank': rank,
            'user_id': user.id,
            'name': user.get_full_name(),
            'email': user.email,
            'avatar': user.avatar.url if user.avatar else None,
            'trust_score': user.trust_score,
            'trust_level': user.trust_level,
            'courses_completed': user.total_courses_completed,
            'services_completed': user.total_services_completed,
            'contributions_made': user.total_contributions_made,
            'badges_count': user.badges.count(),
        })
    
    return Response({
        'count': len(data),
        'results': data,
        'category': category,
    })
```

---

## 🎯 FRONTEND INTEGRATION

### User Dashboard Component (Unified)

```typescript
// frontend/src/components/auth/UnifiedUserDashboard.tsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { TrustScoreGauge } from '../common/TrustScoreGauge';
import { Badge } from '../common/Badge';

const UnifiedUserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.get('/api/accounts/me/dashboard_stats/');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  if (loading) return <div>Carregando...</div>;
  if (!stats) return <div>Erro ao carregar</div>;

  return (
    <div className="space-y-8">
      {/* HEADER - Trust Score */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{stats.user.name}</h2>
            <p className="text-blue-100">{stats.user.trust_level}</p>
          </div>
          <div className="text-right">
            <TrustScoreGauge score={stats.user.trust_score} />
          </div>
        </div>
      </div>

      {/* PROGRESS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Certifications */}
        <ProgressCard
          title="Certificações"
          completed={stats.certifications.total_completed}
          color="bg-orange-100"
          icon="🎓"
          trustContribution={stats.certifications.trust_contribution}
        />
        
        {/* Marketplace */}
        <ProgressCard
          title="Marketplace"
          completed={stats.marketplace.completed_orders}
          rating={stats.marketplace.average_rating}
          color="bg-cyan-100"
          icon="🛠️"
          trustContribution={stats.marketplace.trust_contribution}
        />
        
        {/* Kixikila */}
        <ProgressCard
          title="Kixikila"
          completed={stats.kixikila.total_contributions}
          color="bg-violet-100"
          icon="💰"
          trustContribution={stats.kixikila.trust_contribution}
        />
      </div>

      {/* BADGES */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-4">Conquistas</h3>
        <div className="flex flex-wrap gap-4">
          {stats.badges.map((badge: any) => (
            <Badge
              key={badge.id}
              icon={badge.icon}
              name={badge.name}
              earnedAt={new Date(badge.earned_at).toLocaleDateString('pt-AO')}
            />
          ))}
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-bold mb-4">Atividade Recente</h3>
        <div className="space-y-3">
          {stats.recent_activity.map((activity: any, i: number) => (
            <div key={i} className="flex items-center justify-between pb-3 border-b last:border-0">
              <span className="text-gray-700">{activity.description}</span>
              <span className="text-sm text-gray-500">
                {new Date(activity.timestamp).toLocaleDateString('pt-AO')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UnifiedUserDashboard;
```

---

## 🚀 IMPLEMENTAÇÃO

### Passo 1: Migrations

```bash
# Criar migration para extended User model
python manage.py makemigrations accounts

# Criar migration para UserProfile
python manage.py makemigrations accounts

# Aplicar
python manage.py migrate
```

### Passo 2: Populate Existing Data

```python
# backend/accounts/management/commands/populate_trust_scores.py

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate trust scores for existing users'

    def handle(self, *args, **options):
        users = User.objects.all()
        for user in users:
            user.update_trust_score()
            self.stdout.write(f"✓ {user.email}: {user.trust_score}")
```

### Passo 3: Register Signals

```python
# backend/accounts/apps.py

from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
    
    def ready(self):
        import accounts.signals  # Register all signals
```

---

## ✅ BENEFÍCIOS

| Benefício | Impacto |
|-----------|--------|
| **Unified Trust Score** | Users veem progresso holístico |
| **Achievement Badges** | Gamification com propósito |
| **Activity Log** | Transparency & audit trail |
| **Better Analytics** | Entender user journey |
| **Predictive Models** | Churn prediction, engagement scoring |
| **Compliance** | GDPR-ready audit trail |

---

## 📚 PRÓXIMAS ETAPAS

1. ✅ Validar modelo com PM
2. ⏳ Implementar migrations
3. ⏳ Criar signals
4. ⏳ Atualizar serializers
5. ⏳ Criar frontend components
6. ⏳ Teste end-to-end

