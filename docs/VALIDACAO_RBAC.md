# ✅ VALIDAÇÃO RBAC vs ANÁLISE DE PERFIS

## 1. STATUS ATUAL - O QUE ESTÁ IMPLEMENTADO

### Permission Classes Disponíveis (backend/core/rbac_permissions.py)

✅ **Básicas:**
- `IsParticipant` - user_type == 'participant'
- `IsMentor` - user_type == 'mentor'
- `IsVoter` - user_type == 'voter'
- `IsAdminUser` - is_staff == True

✅ **Ownership:**
- `IsOwnerOrAdmin` - object.user == request.user OR is_staff
- `IsOwnerOrReadOnly` - read-only for all, write for owner/admin

✅ **Module-Specific:**
- `CanCreateKixikila` - participant OR admin (safe methods allowed for auth)
- `CanCreateMarketplaceListing` - participant OR admin (safe methods allowed)
- `CanCreateCertificationCourse` - mentor OR admin (safe methods allowed)
- `CanCreateBlogPost` - mentor OR admin (safe methods allowed)
- `CanPublishContent` - mentor OR admin
- `CanModerateContent` - mentor OR admin

---

## 2. APLICAÇÃO ATUAL POR MÓDULO

### Participantes (backend/participants/views.py)
**Permissões Necessárias:**
- List/Detail: AllowAny (public)
- Update own: IsAuthenticated + IsOwnerOrAdmin
- Dashboard: IsAuthenticated

**Status:** ⚠️ INCOMPLETO
- Falta aplicar `IsOwnerOrAdmin` em PUT/PATCH
- Dashboard não força `IsAuthenticated`

### Votação (backend/voting/views.py)
**Permissões Necessárias:**
- List votable: AllowAny
- Cast vote: IsAuthenticated
- Leaderboard: AllowAny

**Status:** ✅ OK
- Usa `IsAuthenticated` corretamente

### Marketplace (backend/marketplace/views.py)
**Permissões Necessárias:**
- List: AllowAny
- Create Listing: `CanCreateMarketplaceListing`
- Order: IsAuthenticated + not voter

**Status:** ⚠️ INCOMPLETO
- Falta restringir voters
- Falta validação de ordering (seller)

### Kixikila (backend/kixikila/views.py)
**Permissões Necessárias:**
- List: AllowAny
- Create Group: `CanCreateKixikila`
- Join: IsAuthenticated + not voter
- Claim Payout: IsAuthenticated + owner

**Status:** ⚠️ INCOMPLETO
- Falta restringir voters
- Falta validação de payout claims

### Certificações (backend/certifications/views.py)
**Permissões Necessárias:**
- List Programs: AllowAny
- Enroll: IsAuthenticated + not voter
- Complete: IsAuthenticated + owner
- Certify: IsAdminUser OR `IsMentor` + owner turma

**Status:** ⚠️ PARCIAL
- Enroll usa IsAuthenticated (sem restringir voter)
- Certify usa IsAdminUser (deveria ser mentor + owner)

### Temporadas/Reality (backend/seasons/views.py)
**Permissões Necessárias:**
- List: AllowAny
- Create Episode: IsAdminUser
- Join: IsAuthenticated
- Feedback: IsMentor + owner turma

**Status:** ✅ PARCIAL
- Create usa IsAdminUser ✅
- List usa AllowAny ✅
- Falta actions para feedback

### Blog (backend/blog/views.py)
**Permissões Necessárias:**
- List: AllowAny
- Detail: AllowAny
- Create: `CanCreateBlogPost` (mentor OR admin)
- Update: IsOwnerOrAdmin
- Publish: `CanPublishContent`

**Status:** ⚠️ FALTANTE
- Verificar se permissions_classes está aplicada

### Core Dashboard (backend/core/views.py)
**Permissões Necessárias:**
- Dashboard: IsAuthenticated (qualquer user type)
- Revenue: IsAuthenticated (participant+)
- Activity: IsAuthenticated

**Status:** ✅ OK
- Usa `IsAuthenticated` corretamente

---

## 3. GAPS CRÍTICOS A PREENCHER

### Gap 1: Voter Exclusion (Exclusão de Eleitor)
**Problema:** Voters conseguem acessar módulos restritos
**Solução:** Criar permission class `NotVoter` ou `IsParticipantOrHigher`

```python
class IsParticipantOrHigher(permissions.BasePermission):
    """Allow participant, mentor, admin (NOT voter)"""
    message = "Eleitors não têm acesso a este módulo."
    
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        return request.user.user_type in ['participant', 'mentor', 'admin']
```

**Aplicar em:**
- Marketplace (create, order)
- Kixikila (create, join, payout)
- Certificações (enroll, complete)

### Gap 2: Mentor-Specific Actions
**Problema:** Mentor actions (feedback, grade, certify) não distinguem mentores
**Solução:** Criar permission combos

```python
class IsMentorOrAdmin(permissions.BasePermission):
    """Allow mentor or admin"""
    def has_permission(self, request, view):
        return (request.user 
                and request.user.is_authenticated 
                and request.user.user_type in ['mentor', 'admin'])

class IsMentorOfCohort(permissions.BasePermission):
    """Allow mentor of cohort or admin"""
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        # obj must have 'mentor' or 'cohort' field linking to request.user
        return hasattr(obj, 'mentor') and obj.mentor == request.user
```

**Aplicar em:**
- Certificações certify action
- Seasons feedback action
- Participant mentor_feedback action

### Gap 3: Role-Based Dashboard Aggregation
**Problema:** Core dashboard retorna todos os dados, frontend filtra
**Solução:** Backend retorna apenas dados relevantes por role

```python
def dashboard(self, request):
    user = request.user
    data = {}
    
    if user.user_type in ['participant', 'voter']:
        data['trust'] = calculate_trust(user)
        data['marketplace'] = get_participant_marketplace(user) if user.user_type == 'participant' else {}
        data['kixikila'] = get_participant_kixikila(user) if user.user_type == 'participant' else {}
    
    if user.user_type in ['mentor', 'admin']:
        data['cohort_stats'] = get_mentor_cohort_stats(user)
    
    if user.is_staff:
        data['global_stats'] = get_global_stats()
    
    return Response(data)
```

### Gap 4: Feature Flags por User Type
**Problema:** Frontend não sabe quais módulos mostrar
**Solução:** Endpoint `/api/me/features/` que retorna módulos disponíveis

```python
@action(detail=False, methods=['get'])
def features(self, request):
    """Retorna features disponíveis para o user"""
    user = request.user
    features = {
        'voting': True,  # all
        'blog_read': True,  # all
        'marketplace': user.user_type in ['participant', 'mentor', 'admin'],
        'kixikila': user.user_type in ['participant', 'admin'],
        'certifications': user.user_type in ['participant', 'mentor', 'admin'],
        'reality_tv': True,  # all can participate
        'blog_write': user.user_type in ['mentor', 'admin'],
        'admin_panel': user.is_staff,
    }
    return Response(features)
```

---

## 4. PLANO DE IMPLEMENTAÇÃO (Prioridade)

### Nível 1: CRÍTICO (Segurança)
- [ ] Implementar `IsParticipantOrHigher` permission class
- [ ] Aplicar em Marketplace (create endpoint)
- [ ] Aplicar em Kixikila (create endpoint)
- [ ] Aplicar em Certificações (enroll endpoint)
- [ ] Testes unitários para cada permission

### Nível 2: IMPORTANTE (Funcionalidade)
- [ ] Implementar `IsMentorOrAdmin` permission class
- [ ] Implementar `IsMentorOfCohort` for certifications
- [ ] Adicionar mentor_feedback action em Participants
- [ ] Adicionar features endpoint em Core

### Nível 3: ENHANCEMENT (UX)
- [ ] Role-based dashboard aggregation
- [ ] Feature flags no frontend
- [ ] Role-aware navigation rendering
- [ ] Progressive disclosure (Upgrade CTAs)

### Nível 4: POLISH (Admin)
- [ ] Audit logging para actions críticas
- [ ] Rate limiting por endpoint
- [ ] Soft delete para participants/users
- [ ] Performance optimization (caching)

---

## 5. QUICK FIXES (5 MIN CADA)

### Fix 1: Adicionar NotVoter Validação em Marketplace
**File:** `backend/marketplace/views.py`

```python
from backend.core.rbac_permissions import IsParticipantOrHigher

class ListingViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [IsParticipantOrHigher()]  # ← Adicionar
        return [AllowAny()]
```

### Fix 2: Adicionar Features Endpoint
**File:** `backend/core/views.py`

```python
class MeDashboardViewSet(viewsets.ViewSet):
    # ... existing code ...
    
    @action(detail=False, methods=['get'])
    def features(self, request):
        user = request.user
        return Response({
            'marketplace': user.user_type != 'voter',
            'kixikila': user.user_type != 'voter',
            'certifications': user.user_type != 'voter',
            'blog_write': user.user_type in ['mentor', 'admin'],
            'admin': user.is_staff,
        })
```

### Fix 3: Frontend Feature Guard
**File:** `frontend/src/services/useFeatures.ts`

```typescript
export function useFeatures() {
  const { user } = useAuth();
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    if (!user) {
      setFeatures({});
      return;
    }
    
    apiClient.get('/api/v2/core/me/features/')
      .then(data => setFeatures(data))
      .catch(() => {
        // Fallback: calculate locally
        setFeatures({
          marketplace: user.user_type !== 'voter',
          kixikila: user.user_type !== 'voter',
        });
      });
  }, [user]);
  
  return features;
}
```

---

## 6. CHECKLIST VALIDAÇÃO FINAL

### Backend
- [ ] Todas permission classes aplicadas corretamente
- [ ] Todos SAFE_METHODS (GET, HEAD, OPTIONS) permitem AllowAny/read
- [ ] Todos UNSAFE_METHODS (POST, PUT, PATCH, DELETE) verificam permissão
- [ ] Voter explicitamente excluído de módulos restritos
- [ ] Mentor diferenciado de Admin em actions específicas
- [ ] Tests: 100% coverage de permission classes

### Frontend
- [ ] Role-aware nav rendering
- [ ] Features endpoint consumido
- [ ] Módulos desabilitados não aparecem no nav
- [ ] Upgrade CTA para voters acessando locked modules
- [ ] Tests: permission checks para rotas protegidas

### Database
- [ ] Migrations appleid
- [ ] Test users criados (1 voter, 1 participant, 1 mentor, 1 admin)
- [ ] Dados de teste completos

---

## 7. PRÓXIMAS MILESTONES

**Semana 1:** Implementar Nível 1 (Crítico)
**Semana 2:** Implementar Nível 2 (Importante)
**Semana 3:** Implementar Nível 3 (Enhancement)
**Semana 4:** Polish + QA + Deployment

