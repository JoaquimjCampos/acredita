# 🚀 ROADMAP IMPLEMENTAÇÃO RBAC - PRÓXIMOS 30 DIAS (REVISADO - INCLUSIVO)

## Resumo Executivo

Baseado em **Ecossistema Inclusivo**, implementar RBAC que abre criação/venda a TODOS com verificação gradual:

- **Sprint 1 (Dias 1-5):** Trust Score System - base para inclusão
- **Sprint 2 (Dias 6-15):** Marketplace inclusivo (voters podem vender com verificação)
- **Sprint 3 (Dias 16-25):** Kixikila + Blog com tier system
- **Sprint 4 (Dias 26-30):** Testing, polish, deployment

---

## SPRINT 1: Trust Score System (Dias 1-5)

### Objetivo
Implementar **Trust Score** que permite voters criar conteúdo/vender com verificação progressiva.

### Filosofia
- Ninguém é bloqueado permanentemente
- Transparência total: "Você precisa de X para criar listings"
- Incentivos claros: "5 votos = 5 pontos trust"
- Appeals process: sempre há caminho para resolver

### Tarefas

#### 1.1 Create UserTrustScore Model (Dia 1)
**File:** `backend/accounts/models.py`

```python
class UserTrustScore(models.Model):
    """Track trust/reputation score for progressive access"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='trust_score')
    
    # Verification
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    profile_complete = models.BooleanField(default=False)
    
    # Engagement metrics
    votes_cast = models.IntegerField(default=0)
    content_published = models.IntegerField(default=0)
    positive_feedback_received = models.IntegerField(default=0)
    reports_filed = models.IntegerField(default=0)
    
    # Creator metrics
    sales_completed = models.IntegerField(default=0)
    average_rating = models.FloatField(default=0.0)
    dispute_count = models.IntegerField(default=0)
    
    # Account health
    account_age_days = models.IntegerField(default=0)
    last_flagged_date = models.DateTimeField(null=True, blank=True)
    flag_reason = models.CharField(max_length=255, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @property
    def total_score(self):
        """Calculate total trust score (0-100)"""
        score = 0
        
        # Account age (max 10)
        score += min(10, self.account_age_days / 36.5)
        
        # Verification (max 15)
        score += self.email_verified * 5
        score += self.phone_verified * 5
        score += self.profile_complete * 5
        
        # Engagement (max 30)
        score += min(10, self.votes_cast / 10)
        score += min(10, self.content_published * 3)
        score += min(10, self.positive_feedback_received)
        
        # Creator (max 25)
        score += min(10, self.sales_completed * 2)
        score += min(10, self.average_rating * 2)
        score += max(0, 5 - (self.dispute_count * 2.5))
        
        # Penalties
        if self.flag_reason:
            score *= 0.5
        
        return min(100, max(0, score))
    
    def can_create_marketplace_listing(self) -> bool:
        """Voter needs trust_score >= 15 + verification"""
        if self.user.user_type in ['participant', 'mentor', 'admin']:
            return True
        
        return (
            self.total_score >= 15 and 
            self.email_verified and 
            self.phone_verified
        )
    
    def can_create_kixikila_group(self) -> bool:
        """Voter needs paid subscription OR high trust"""
        if self.user.user_type in ['participant', 'mentor', 'admin']:
            return True
        
        # Voter with subscription
        subscription = Subscription.objects.filter(user=self.user, active=True).first()
        if subscription:
            return True
        
        # OR high trust score
        return (
            self.total_score >= 20 and 
            self.email_verified and 
            self.phone_verified
        )
    
    def can_publish_article(self) -> bool:
        """Voters need approval, others auto-publish"""
        if self.user.user_type in ['participant', 'mentor', 'admin']:
            return True
        
        return self.total_score >= 25 and self.profile_complete
```

Migration:
```bash
python manage.py makemigrations accounts
python manage.py migrate
```

**Time:** 45 min  
**Review:** Backend lead

---

#### 1.2 Create Trust Score Endpoints (Dia 2)
**File:** `backend/accounts/views.py`

```python
class UserTrustScoreViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'])
    def my_trust(self, request):
        """Get own trust score + progress"""
        trust = request.user.trust_score
        
        return Response({
            'total_score': trust.total_score,
            'verification': {
                'email': trust.email_verified,
                'phone': trust.phone_verified,
                'profile': trust.profile_complete,
            },
            'engagement': {
                'votes': trust.votes_cast,
                'content': trust.content_published,
                'feedback': trust.positive_feedback_received,
            },
            'creator': {
                'sales': trust.sales_completed,
                'rating': trust.average_rating,
                'disputes': trust.dispute_count,
            },
            'next_milestones': [
                {'score': 15, 'unlocks': 'Marketplace Creator', 'done': trust.total_score >= 15},
                {'score': 20, 'unlocks': 'Kixikila Group Creator', 'done': trust.total_score >= 20},
                {'score': 25, 'unlocks': 'Auto-publish Blog Posts', 'done': trust.total_score >= 25},
            ],
        })
```

**Time:** 30 min

---

#### 1.3 Trust Score Migrations & Signal Handlers (Dia 2-3)
**File:** `backend/accounts/signals.py`

```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_save, sender=User)
def create_trust_score(sender, instance, created, **kwargs):
    if created:
        UserTrustScore.objects.create(user=instance)

@receiver(post_save, sender=User)
def update_account_age(sender, instance, **kwargs):
    """Update account age daily"""
    trust = instance.trust_score
    age_days = (timezone.now() - instance.date_joined).days
    if age_days > trust.account_age_days:
        trust.account_age_days = age_days
        trust.save()
```

**Time:** 30 min

---

#### 1.4 Frontend Trust Score Display (Dia 3-4)
**File:** `frontend/src/hooks/useTrustScore.ts`

```typescript
export function useTrustScore() {
  const { user } = useAuth();
  const [trust, setTrust] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    apiClient.get('/api/accounts/trust/my_trust/')
      .then(data => setTrust(data))
      .finally(() => setLoading(false));
  }, [user]);
  
  return { trust, loading };
}
```

**File:** `frontend/src/components/TrustScoreCard.tsx`

```typescript
export const TrustScoreCard = () => {
  const { trust, loading } = useTrustScore();
  
  if (!trust) return null;
  
  const progress = (trust.total_score / 100) * 100;
  
  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
      <h3 className="font-bold mb-4">Pontuação de Confiança</h3>
      
      <ProgressBar value={trust.total_score} max={100} />
      
      <div className="mt-4 text-sm text-gray-600">
        {trust.next_milestones.map(m => (
          <div key={m.score} className={cn('flex items-center gap-2', m.done && 'opacity-50')}>
            {m.done ? <CheckIcon /> : <LockIcon />}
            <span>{m.score} pts: {m.unlocks}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Complete verificações para ganhar pontos:</p>
        <ul className="mt-2">
          {!trust.verification.email && (
            <li>✓ Confirmar email (+5 pts)</li>
          )}
          {!trust.verification.phone && (
            <li>✓ Confirmar telefone (+5 pts)</li>
          )}
          {!trust.verification.profile && (
            <li>✓ Completar perfil (+5 pts)</li>
          )}
        </ul>
      </div>
    </Card>
  );
};
```

**Time:** 1 hour

---

#### 1.5 Update Permission Classes (Dia 4-5)
**File:** `backend/core/rbac_permissions.py`

```python
class CanCreateMarketplaceListing(permissions.BasePermission):
    """Check trust score + role"""
    message = "Complete verificações para vender (trust score insuficiente)"
    
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        
        user = request.user
        if not user.is_authenticated:
            return False
        
        # Participant/Mentor/Admin: unlimited
        if user.user_type in ['participant', 'mentor', 'admin']:
            return True
        
        # Voter: needs trust score + verification
        trust = user.trust_score
        return trust.can_create_marketplace_listing()


class CanCreateKixikilaGroup(permissions.BasePermission):
    """Check subscription or trust score"""
    message = "Subscrição ou trust score elevada necessária"
    
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        
        user = request.user
        if not user.is_authenticated:
            return False
        
        if user.user_type in ['participant', 'mentor', 'admin']:
            return True
        
        trust = user.trust_score
        return trust.can_create_kixikila_group()
```

**Time:** 30 min

---

#### 1.6 Integration Tests (Dia 5)
**File:** `backend/tests/test_trust_score.py`

```python
def test_voter_cannot_create_listing_without_trust():
    voter = User.objects.create_user(username='voter1', user_type='voter')
    assert not voter.trust_score.can_create_marketplace_listing()

def test_voter_can_create_after_verification():
    voter = User.objects.create_user(username='voter1', user_type='voter')
    trust = voter.trust_score
    trust.email_verified = True
    trust.phone_verified = True
    trust.votes_cast = 20  # Score >= 15
    trust.save()
    
    assert trust.can_create_marketplace_listing()

def test_participant_always_can_create():
    participant = User.objects.create_user(username='part1', user_type='participant')
    assert participant.trust_score.can_create_marketplace_listing()
```

**Time:** 1 hour

---

#### 1.2 Marketplace - Bloquear Voters (Dia 1-2)
**File:** `backend/marketplace/views.py`

Aplicar permission em create/update/delete:

```python
from backend.core.rbac_permissions import IsParticipantOrHigher

class ListingViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsParticipantOrHigher()]  # ← Adicionar
        return [AllowAny()]

class OrderViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action in ['create']:
            return [IsParticipantOrHigher()]  # ← Adicionar
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsOwnerOrAdmin()]
        return [AllowAny()]
```

**Time:** 30 min  
**Test:** POST /api/v2/marketplace/listings/ como voter → 403  
**Test:** POST /api/v2/marketplace/listings/ como participant → 201

---

#### 1.3 Kixikila - Bloquear Voters (Dia 2)
**File:** `backend/kixikila/views.py`

```python
class GroupViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action in ['create']:
            return [IsParticipantOrHigher()]
        return [AllowAny()]

class MembershipViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action in ['create']:
            return [IsParticipantOrHigher()]
        return [AllowAny()]

class PayoutViewSet(viewsets.ViewSet):
    def get_permissions(self):
        return [IsParticipantOrHigher()]
```

**Time:** 30 min  
**Test:** POST /api/v2/kixikila/groups/ como voter → 403  
**Test:** POST /api/v2/kixikila/payouts/ como voter → 403

---

#### 1.4 Certificações - Bloquear Voters (Dia 3)
**File:** `backend/certifications/views.py`

```python
class CandidateEnrollmentViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action in ['create']:
            return [IsParticipantOrHigher()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsOwnerOrAdmin()]
        if self.action in ['complete']:
            return [IsOwnerOrAdmin()]
        return [AllowAny()]
```

**Time:** 20 min  
**Test:** POST /api/v2/certifications/enrollments/ como voter → 403

---

#### 1.5 Unit Tests (Dia 3-4)
**File:** `backend/core/tests/test_rbac_permissions.py`

```python
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from backend.core.rbac_permissions import IsParticipantOrHigher

User = get_user_model()

class IsParticipantOrHigherTestCase(TestCase):
    def setUp(self):
        self.voter = User.objects.create_user(
            username='voter1',
            password='test',
            user_type='voter'
        )
        self.participant = User.objects.create_user(
            username='part1',
            password='test',
            user_type='participant'
        )
        self.client = APIClient()

    def test_voter_blocked(self):
        self.client.force_authenticate(user=self.voter)
        response = self.client.post('/api/v2/marketplace/listings/', {})
        self.assertEqual(response.status_code, 403)

    def test_participant_allowed(self):
        self.client.force_authenticate(user=self.participant)
        response = self.client.post('/api/v2/marketplace/listings/', {
            'title': 'Test',
            'description': 'Test',
            'price': 100,
        })
        self.assertIn(response.status_code, [201, 400])  # 400 = validation, 201 = success
```

**Time:** 1 hour  
**Coverage:** 100% permission classes

---

#### 1.6 Integration Test (Dia 4-5)
**File:** `backend/tests/test_role_flow.py`

```python
def test_voter_cannot_access_marketplace():
    """Eleitor tenta criar listing → bloqueado"""
    # ...

def test_voter_cannot_access_kixikila():
    """Eleitor tenta criar grupo → bloqueado"""
    # ...

def test_participant_can_create_listing():
    """Participant cria listing → sucesso"""
    # ...

def test_participant_can_claim_payout():
    """Participant reclama payout → sucesso"""
    # ...
```

**Time:** 1 hour

---

### Sprint 1 Deliverables
- ✅ 3 permission classes novas
- ✅ 4 módulos com voter exclusion
- ✅ 2 test suites completas
- ✅ 0 breaking changes

---

## SPRINT 2: Features & Mentor Actions (Dias 6-15)

### Objetivo
Implementar features endpoint + mentor-specific actions.

### Tarefas

#### 2.1 Features Endpoint (Dia 6)
**File:** `backend/core/views.py`

Adicionar action em `MeDashboardViewSet`:

```python
@action(detail=False, methods=['get'])
def features(self, request):
    """Retorna módulos/features disponíveis para user"""
    user = request.user
    
    is_participant_or_higher = user.user_type in ['participant', 'mentor', 'admin']
    
    return Response({
        'voting': True,  # todos
        'blog_read': True,  # todos
        'marketplace': is_participant_or_higher,
        'kixikila': is_participant_or_higher,
        'certifications': is_participant_or_higher,
        'reality_tv': True,  # todos
        'blog_write': user.user_type in ['mentor', 'admin'],
        'certifications_grade': user.user_type in ['mentor', 'admin'],
        'admin_panel': user.is_staff,
    })
```

**Time:** 30 min  
**Test:** GET /api/v2/core/me/features/ como voter → marketplace: false  
**Test:** GET /api/v2/core/me/features/ como participant → marketplace: true

---

#### 2.2 Mentor Feedback Action (Dia 7)
**File:** `backend/participants/views.py`

```python
@action(detail=True, methods=['post'])
def mentor_feedback(self, request, pk=None):
    """Mentor adiciona feedback a participant"""
    from backend.core.rbac_permissions import IsMentorOrAdmin
    
    permission_classes = [IsMentorOrAdmin]
    if not all(perm.has_permission(request, self) for perm in [p() for p in permission_classes]):
        return Response({'error': 'Apenas mentores'}, status=403)
    
    participant = self.get_object()
    feedback = request.data.get('feedback', '')
    score = request.data.get('score')
    
    participant.mentor_feedback = feedback
    if score:
        participant.mentor_score = score
    participant.save()
    
    return Response({
        'id': participant.id,
        'mentor_feedback': feedback,
        'mentor_score': participant.mentor_score,
    })
```

**Time:** 45 min  
**Test:** POST /api/participants/{id}/mentor_feedback/ como voter → 403  
**Test:** POST /api/participants/{id}/mentor_feedback/ como mentor → 200

---

#### 2.3 Certifications - Mentor Grading (Dia 8)
**File:** `backend/certifications/views.py`

```python
@action(detail=True, methods=['post'])
def grade(self, request, pk=None):
    """Mentor/Admin grava resultado de avaliação"""
    from backend.core.rbac_permissions import IsMentorOrAdmin
    
    permission_classes = [IsMentorOrAdmin]
    if not all(perm.has_permission(request, self) for perm in [p() for p in permission_classes]):
        return Response({'error': 'Apenas mentores'}, status=403)
    
    enrollment = self.get_object()
    score = request.data.get('score')
    status = request.data.get('status', 'pending')  # pass/fail/pending
    
    result = AssessmentResult.objects.create(
        enrollment=enrollment,
        score=score,
        status=status,
        graded_by=request.user,
    )
    
    return Response({
        'id': result.id,
        'score': score,
        'status': status,
    })
```

**Time:** 1 hour  
**Test:** POST /api/v2/certifications/enrollments/{id}/grade/ como mentor → 201

---

#### 2.4 Certifications - Mentor Certification (Dia 9-10)
**File:** `backend/certifications/views.py`

```python
@action(detail=True, methods=['post'])
def certify(self, request, pk=None):
    """Mentor/Admin emite certificado"""
    from backend.core.rbac_permissions import IsMentorOrAdmin
    
    permission_classes = [IsMentorOrAdmin]
    if not all(perm.has_permission(request, self) for perm in [p() for p in permission_classes]):
        return Response({'error': 'Apenas mentores/admin'}, status=403)
    
    enrollment = self.get_object()
    
    # Validar que enrollment tem score passing
    latest_result = enrollment.assessment_results.order_by('-created_at').first()
    if not latest_result or latest_result.status != 'pass':
        return Response({'error': 'Candidato não passou'}, status=400)
    
    cert_code = f"CERT-{enrollment.program.id}-{enrollment.candidate.id}-{timezone.now().strftime('%Y%m%d')}"
    
    enrollment.status = 'certified'
    enrollment.certificate_code = cert_code
    enrollment.certified_by = request.user
    enrollment.certified_at = timezone.now()
    enrollment.save()
    
    return Response({
        'status': 'certified',
        'certificate_code': cert_code,
    })
```

**Time:** 1 hour  
**Test:** POST /api/v2/certifications/enrollments/{id}/certify/ como mentor → 200

---

#### 2.5 Seasons - Mentor Feedback (Dia 10-11)
**File:** `backend/seasons/views.py`

```python
@action(detail=True, methods=['post'])
def mentor_feedback(self, request, pk=None):
    """Mentor adiciona feedback a episode_participant"""
    from backend.core.rbac_permissions import IsMentorOrAdmin
    
    permission_classes = [IsMentorOrAdmin]
    if not all(perm.has_permission(request, self) for perm in [p() for p in permission_classes]):
        return Response({'error': 'Apenas mentores'}, status=403)
    
    ep_part = self.get_object()
    feedback = request.data.get('feedback', '')
    score = request.data.get('performance_score')
    
    ep_part.mentor_feedback = feedback
    if score:
        ep_part.performance_score = score
    ep_part.save()
    
    return Response({
        'id': ep_part.id,
        'feedback': feedback,
        'performance_score': ep_part.performance_score,
    })
```

**Time:** 45 min

---

#### 2.6 Integration Tests (Dia 11-15)
**File:** `backend/tests/test_mentor_actions.py`

- Test feedback creation
- Test grading flow
- Test certification flow
- Test permission denials

**Time:** 3 hours

---

### Sprint 2 Deliverables
- ✅ Features endpoint
- ✅ 3 mentor actions implementadas
- ✅ Integration tests completos
- ✅ Documentação atualizada

---

## SPRINT 3: Dashboard & Frontend PLG (Dias 16-25)

### Objetivo
Dashboard role-aware + frontend com feature flags.

### Tarefas

#### 3.1 Role-Aware Dashboard Backend (Dia 16-17)
**File:** `backend/core/views.py`

Atualizar `dashboard` action:

```python
@action(detail=False, methods=['get'])
def dashboard(self, request):
    user = request.user
    
    # Base response
    response = {
        'user': {
            'id': user.id,
            'username': user.username,
            'user_type': user.user_type,
        },
        'trust': calculate_trust_score(user),
    }
    
    # Role-specific data
    if user.user_type == 'voter':
        response['voting_stats'] = get_voting_stats(user)
    
    elif user.user_type == 'participant':
        response['marketplace'] = get_participant_marketplace(user)
        response['kixikila'] = get_participant_kixikila(user)
        response['certifications'] = get_participant_certifications(user)
        response['reality'] = get_participant_reality(user)
    
    elif user.user_type == 'mentor':
        response['cohort_stats'] = get_mentor_cohort_stats(user)
        response['certification_queue'] = get_mentor_certification_queue(user)
    
    elif user.is_staff:
        response['global_stats'] = get_global_stats()
        response['moderation_queue'] = get_moderation_queue()
    
    return Response(response)
```

**Time:** 2 hours  
**Test:** GET /api/v2/core/me/dashboard/ como cada role → diferentes dados

---

#### 3.2 Frontend Features Hook (Dia 18)
**File:** `frontend/src/hooks/useFeatures.ts`

```typescript
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/api/client';

export interface Features {
  voting: boolean;
  blog_read: boolean;
  marketplace: boolean;
  kixikila: boolean;
  certifications: boolean;
  reality_tv: boolean;
  blog_write: boolean;
  certifications_grade: boolean;
  admin_panel: boolean;
}

export function useFeatures(): Features {
  const { user } = useAuth();
  const [features, setFeatures] = useState<Features>({
    voting: true,
    blog_read: true,
    marketplace: false,
    kixikila: false,
    certifications: false,
    reality_tv: true,
    blog_write: false,
    certifications_grade: false,
    admin_panel: false,
  });
  
  useEffect(() => {
    if (!user) {
      setFeatures({
        voting: true,
        blog_read: true,
        marketplace: false,
        kixikila: false,
        certifications: false,
        reality_tv: true,
        blog_write: false,
        certifications_grade: false,
        admin_panel: false,
      });
      return;
    }
    
    apiClient.get<Features>('/api/v2/core/me/features/')
      .then(data => setFeatures(data))
      .catch(() => {
        // Fallback: local calculation
        const isParticipant = user.user_type !== 'voter';
        const isMentor = user.user_type === 'mentor' || user.is_staff;
        
        setFeatures({
          voting: true,
          blog_read: true,
          marketplace: isParticipant,
          kixikila: isParticipant,
          certifications: isParticipant,
          reality_tv: true,
          blog_write: isMentor,
          certifications_grade: isMentor,
          admin_panel: user.is_staff || false,
        });
      });
  }, [user]);
  
  return features;
}
```

**Time:** 45 min  
**Test:** useFeatures() como voter → marketplace: false  
**Test:** useFeatures() como participant → marketplace: true

---

#### 3.3 Role-Aware Navigation (Dia 19)
**File:** `frontend/src/components/HomepageNav.tsx`

Atualizar para usar `useFeatures`:

```typescript
import { useFeatures } from '../hooks/useFeatures';

const HomepageNav = () => {
  const features = useFeatures();
  const { user } = useAuth();
  
  const modules = [
    { label: 'Votação', path: '/votacao', icon: Heart, feature: 'voting' },
    { label: 'Marketplace', path: '/marketplace', icon: ShoppingCart, feature: 'marketplace', locked: !features.marketplace },
    { label: 'Kixikila', path: '/kixikila', icon: Users, feature: 'kixikila', locked: !features.kixikila },
    { label: 'Certificações', path: '/certificacoes', icon: Award, feature: 'certifications', locked: !features.certifications },
    { label: 'Realidade TV', path: '/reality', icon: Tv, feature: 'reality_tv' },
    { label: 'Blog', path: '/blog', icon: BookOpen, feature: 'blog_read' },
  ];
  
  return (
    <nav className="flex gap-4 overflow-x-auto">
      {modules
        .filter(m => features[m.feature as keyof Features])
        .map(m => (
          <a
            key={m.path}
            href={m.path}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded',
              m.locked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
            )}
            onClick={e => {
              if (m.locked) {
                e.preventDefault();
                navigate('/upgrade');
              }
            }}
          >
            <m.icon className="w-5 h-5" />
            {m.label}
            {m.locked && <Lock className="w-4 h-4" />}
          </a>
        ))}
    </nav>
  );
};
```

**Time:** 1 hour  
**Test:** Navigation mostra/esconde módulos por role

---

#### 3.4 Module Page Protection (Dia 20)
**File:** `frontend/src/pages/MarketplacePage.tsx` (repeat para kixikila, certs)

```typescript
import { useFeatures } from '../hooks/useFeatures';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const MarketplacePage = () => {
  const features = useFeatures();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!features.marketplace) {
      navigate('/upgrade?reason=marketplace');
    }
  }, [features.marketplace]);
  
  if (!features.marketplace) {
    return <LoadingSpinner />;
  }
  
  // ... rest of page
};
```

**Time:** 30 min x 3 modules = 1.5 hours

---

#### 3.5 Dashboard Layout (Dia 21-22)
**File:** `frontend/src/pages/DashboardPage.tsx`

Novo layout baseado em role:

```typescript
const DashboardPage = () => {
  const { user } = useAuth();
  const { data: dashboard } = useDashboard();
  
  if (user.user_type === 'voter') {
    return <VoterDashboard data={dashboard} />;
  } else if (user.user_type === 'participant') {
    return <ParticipantDashboard data={dashboard} />;
  } else if (user.user_type === 'mentor') {
    return <MentorDashboard data={dashboard} />;
  } else if (user.is_staff) {
    return <AdminDashboard data={dashboard} />;
  }
};
```

Criar componentes:
- VoterDashboard (voting stats, leaderboard)
- ParticipantDashboard (marketplace, kixi, certs, reality)
- MentorDashboard (cohort stats, certification queue)
- AdminDashboard (global stats, moderation queue)

**Time:** 3 hours

---

#### 3.6 Upgrade Page Polish (Dia 23-24)
**File:** `frontend/src/pages/UpgradePage.tsx`

Atualizar com role-specific CTAs:

```typescript
const UPGRADE_TIERS = {
  voter_to_participant: {
    title: 'Participante Acesso Completo',
    price: 'Gratuito/Ajustado',
    features: [
      'Criar listagens no Marketplace',
      'Criar e gerenciar grupos Kixikila',
      'Inscrever em certificações',
      'Participar em Reality TV',
      'Acesso ao Dashboard pessoal',
    ],
    cta: 'Upgrade Agora',
  },
  participant_to_mentor: {
    title: 'Mentor - Eduque e Certifique',
    price: 'Premium',
    features: [
      'Avaliar e certificar candidatos',
      'Escrever artigos no blog',
      'Gerir coortes de participantes',
      'Dashboard de mentoria',
    ],
    cta: 'Aplicar como Mentor',
  },
};
```

**Time:** 1 hour

---

#### 3.7 E2E Tests (Dia 24-25)
**File:** `frontend/cypress/e2e/rbac.cy.ts`

```typescript
describe('RBAC - Role-based Feature Access', () => {
  it('voter cannot access marketplace', () => {
    cy.login('voter@test.com', 'password');
    cy.visit('/marketplace');
    cy.url().should('include', '/upgrade');
  });
  
  it('participant can access marketplace', () => {
    cy.login('participant@test.com', 'password');
    cy.visit('/marketplace');
    cy.get('[data-testid="listing-create"]').should('be.visible');
  });
  
  it('dashboard shows correct data by role', () => {
    cy.login('participant@test.com', 'password');
    cy.visit('/dashboard');
    cy.get('[data-testid="marketplace-card"]').should('be.visible');
  });
});
```

**Time:** 2 hours

---

### Sprint 3 Deliverables
- ✅ Role-aware dashboard backend
- ✅ Features hook frontend
- ✅ Role-aware navigation
- ✅ Protected pages
- ✅ Dashboard layouts por role
- ✅ E2E tests

---

## SPRINT 4: Testing, Polish & Deployment (Dias 26-30)

### Objetivo
QA final, performance, deployment.

### Tarefas

#### 4.1 Comprehensive Testing (Dia 26-27)
- [ ] Unit tests: 100% permission classes
- [ ] Integration tests: role flows
- [ ] E2E tests: critical paths
- [ ] Security audit: no bypasses
- [ ] Performance: dashboard loading < 500ms

**Time:** 4 hours

#### 4.2 Documentation (Dia 28)
- [ ] RBAC implementation guide
- [ ] Role transition documentation
- [ ] API permission reference
- [ ] Frontend feature flag guide
- [ ] Admin handbook

**Time:** 2 hours

#### 4.3 Performance Optimization (Dia 28-29)
- [ ] Cache core dashboard (5 min)
- [ ] Cache features endpoint (10 min)
- [ ] Optimize dashboard queries (select_related)
- [ ] Lazy load dashboard components

**Time:** 2 hours

#### 4.4 Deployment Preparation (Dia 29-30)
- [ ] Create migrations
- [ ] Backup database
- [ ] Staging environment test
- [ ] Rollback plan
- [ ] Deploy to production

**Time:** 2 hours

---

## RESUMO CRONOGRAMA

| Sprint | Dias | Objetivo | Deliverables |
|--------|------|----------|--------------|
| 1 | 1-5 | Segurança | 4 módulos com voter exclusion |
| 2 | 6-15 | Features | Mentor actions + features endpoint |
| 3 | 16-25 | Frontend | Dashboard role-aware + PLG |
| 4 | 26-30 | QA | Testing, docs, deployment |

---

## RECURSOS NECESSÁRIOS

- **Backend:** 1-2 devs (Python/Django)
- **Frontend:** 1 dev (React/TypeScript)
- **QA:** 0.5 dev (testing)
- **DevOps:** 0.5 dev (deployment)
- **Total:** ~4 dev-weeks

---

## DEPENDÊNCIAS & RISCOS

### Dependências
- ✅ User model + user_type (JÁ FEITO)
- ✅ RBAC permission classes (JÁ FEITO)
- ⚠️ Feature flags por module (SPRINT 2)
- ⚠️ Role-aware dashboard (SPRINT 3)

### Riscos
- **Risk 1:** Voters com dados cached antes de upgrade → Mitigar com cache invalidation
- **Risk 2:** Performance em dashboard com muitos dados → Mitigar com aggregation + caching
- **Risk 3:** Breaking changes em API → Mitigar com versioning + deprecation warnings

---

## KPIs SUCCESS

- ✅ 0 voters accessing premium modules
- ✅ Dashboard loads < 500ms
- ✅ 100% test coverage (permissions)
- ✅ 0 security vulnerabilities
- ✅ Feature discovery rate > 80%

