# 🌍 ECOSSISTEMA INCLUSIVO - REVISÃO PROFUNDA

## PREMISSA FUNDAMENTAL

**Todos os perfis (Voters, Participants, Mentors, Admins) são CLIENTES e CRIADORES de valor.**

- **Voters:** Consumem serviços (votam, consomem conteúdo, compram no marketplace)
- **Participants:** Oferecem serviços + aprendem + criam conteúdo
- **Mentors:** Educam + mentem + consomem plataforma
- **Admins:** Guardam integridade + facilitam ecossistema

Nenhum deve ser tratado como "second-class citizen".

---

## PROBLEMA COM MODELO ANTERIOR

❌ **Voter exclusion** do marketplace/kixikila é **discriminatório**
- Voters são consumidores de serviços (buying power)
- Voters são geradores de conteúdo (reviews, votos, engagement)
- Voters financiam plataforma (potencial subscrição)

✅ **Nova abordagem:** Permissões baseadas em **RESPONSABILIDADE**, não em **RESTRIÇÃO**

---

## NOVO MODELO: 4 CAPACIDADES + ROLES

### Capacidades (O que você PODE fazer)
1. **Consumir** (ler, comprar, votar, aprender)
2. **Criar** (publicar, vender, ensinar)
3. **Moderar** (avaliar qualidade, feedback)
4. **Governar** (políticas, features, suspensões)

### Responsabilidades (O que você DEVE fazer)
1. **Consumidor:** Pagar/respeitar termos
2. **Criador:** Garantir qualidade, suporte
3. **Moderador:** Imparcialidade, auditoria
4. **Governante:** Equidade, escalabilidade

---

## MATRIZ REVISADA - INCLUSIVA

```
┌───────────────────┬─────────┬──────────────┬────────┬───────┐
│ Capacidade        │ Voter   │ Participant  │ Mentor │ Admin │
├───────────────────┼─────────┼──────────────┼────────┼───────┤
│ CONSUMIR          │         │              │        │       │
│ - Ler conteúdo    │ ✅      │ ✅           │ ✅     │ ✅    │
│ - Ver blog        │ ✅      │ ✅           │ ✅     │ ✅    │
│ - Votar           │ ✅      │ ✅           │ ✅     │ ✅    │
│ - Comprar serviços│ ✅      │ ✅           │ ✅     │ ✅    │
│ - Assistir cursos │ ✅ R    │ ✅ W         │ ✅ W   │ ✅    │
│                   │         │              │        │       │
│ CRIAR             │         │              │        │       │
│ - Vender serviço  │ ⚠️ L1   │ ✅           │ ⚠️ L2  │ ✅    │
│ - Criar grupo kixi│ ⚠️ L1   │ ✅           │ ⚠️ L2  │ ✅    │
│ - Escrever artigo │ ❌      │ ⚠️ L2        │ ✅     │ ✅    │
│ - Ensinar/mentor  │ ❌      │ ❌           │ ✅     │ ✅    │
│ - Participar show │ ⚠️ L3   │ ✅           │ ⚠️ L2  │ ✅    │
│                   │         │              │        │       │
│ MODERAR           │         │              │        │       │
│ - Dar feedback    │ ✅ L2   │ ✅ L1        │ ✅ L0  │ ✅    │
│ - Reportar abuso  │ ✅      │ ✅           │ ✅     │ ✅    │
│ - Avaliar/score   │ ❌      │ ⚠️ L3        │ ✅     │ ✅    │
│                   │         │              │        │       │
│ GOVERNAR          │         │              │        │       │
│ - Editar políticas│ ❌      │ ❌           │ ❌     │ ✅    │
│ - Suspender user  │ ❌      │ ❌           │ ❌     │ ✅    │
│ - Feature content │ ❌      │ ❌           │ ❌     │ ✅    │
└───────────────────┴─────────┴──────────────┴────────┴───────┘

Legenda:
✅    = Acesso total
✅ R  = Acesso restrito (leitura)
✅ W  = Acesso escrita
⚠️ L# = Nível de verificação (L0=nenhuma, L3=máxima)
❌    = Sem acesso
```

---

## DETALHAMENTO POR CAPACIDADE

### 1. CONSUMIR (Consumer Model)

#### Blog & Conteúdo
**Todos:** Ler gratuitamente
```
✅ GET /api/blog/posts/
✅ GET /api/blog/posts/{id}/
✅ POST /api/blog/posts/{id}/comments/  (com moderation)
```

#### Votação
**Todos:** Votar gratuitamente
```
✅ GET /api/voting/participants/
✅ POST /api/voting/vote/  (1 voto por user/season)
✅ GET /api/voting/leaderboard/
```

#### Marketplace (NOVO - Inclusivo)
**Voters + Participants:** Comprar serviços
```
✅ GET /api/v2/marketplace/listings/
✅ GET /api/v2/marketplace/categories/
✅ POST /api/v2/marketplace/orders/  (como buyer)
✅ GET /api/v2/marketplace/orders/  (própros)
```

#### Kixikila (NOVO - Inclusivo)
**Voters + Participants:** Participar/comprar
```
✅ GET /api/v2/kixikila/groups/
✅ POST /api/v2/kixikila/memberships/  (join como member)
✅ GET /api/v2/kixikila/earnings/  (own payout)
```

#### Certificações (NOVO - Inclusivo)
**Voters podem:** Auditar cursos (audit-only enrollment)
**Participants:** Certificação completa
```
✅ GET /api/v2/certifications/programs/
⚠️ POST /api/v2/certifications/enrollments/?audit=true  (voter)
✅ POST /api/v2/certifications/enrollments/  (participant)
✅ GET /api/v2/certifications/enrollments/  (própro)
```

---

### 2. CRIAR (Creator Model)

#### Vender Serviços (Marketplace)
**Níveis de Confiança:**

**Level 0 (Voter):** ID verificada + reptuação mínima
- Pré-requisito: email confirmado + phone verificado
- Limite: 5 listagens, valor máximo $100/serviço
- Requerido: perfil completo + foto

```python
class MarketplaceCreatorPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        
        user = request.user
        if not user.is_authenticated:
            return False
        
        # Voter precisa de verificação extra
        if user.user_type == 'voter':
            return (
                user.email_verified and
                user.phone_verified and
                user.profile_complete and
                MarketplaceRating.objects.filter(seller=user).count() >= 0 and
                MarketplaceListing.objects.filter(seller=user).count() < 5
            )
        
        # Participant: sem limite
        if user.user_type == 'participant':
            return True
        
        # Mentor/Admin: unrestricted
        return user.is_staff or user.user_type == 'mentor'
```

**Level 1 (Voter - Verificado):** Sem limite (após 10 vendas + 4.5 rating)
```python
# Após atingir benchmarks:
voter.marketplace_tier = 'verified'
```

**Level 2 (Participant):** Unlimited, todas features
**Level 3 (Mentor):** Unlimited + mentoring features
**Level 4 (Admin):** Unrestricted

---

#### Criar Grupo Kixikila
**Mesma lógica que Marketplace:**

**Level 0 (Voter):** Pode criar grupo, mas precisa:
- Email + phone verificado
- Plano mínimo ($9.99/mês ou pago)
- Limite: 1 grupo ativo

```python
class KixikilaCreatorPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        
        user = request.user
        if not user.is_authenticated:
            return False
        
        # Voter precisa de subscription
        if user.user_type == 'voter':
            subscription = Subscription.objects.filter(user=user, active=True).first()
            if not subscription:
                raise PermissionDenied("Subscrição necessária para criar grupos")
            
            active_groups = KixikilaGroup.objects.filter(creator=user, is_active=True).count()
            return active_groups < 1
        
        # Participant: sem limite
        if user.user_type == 'participant':
            return True
        
        return user.is_staff or user.user_type == 'mentor'
```

**Level 1 (Voter - Paid):** 1 grupo ativo + features básicas
**Level 2 (Participant):** Unlimited + analytics
**Level 3+ (Mentor/Admin):** Unrestricted

---

#### Publicar Artigos (Blog)
**Inclusivo com moderação:**

**Voter:** Pode submeter, precisa aprovação
```python
class BlogCreatorPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method == 'GET':
            return True
        
        if request.method in ['POST', 'PATCH']:
            user = request.user
            if not user.is_authenticated:
                return False
            
            # Voter: pode submeter (draft)
            if user.user_type == 'voter':
                return True
            
            # Mentor/Participant: pode publicar direto
            if user.user_type in ['mentor', 'participant']:
                return True
            
            return user.is_staff
```

**Post workflow:**
```
Voter submete → Estado: DRAFT
                ↓
            Mentor/Admin revisa
                ↓
            ✅ PUBLISHED ou ❌ REJECTED
```

---

#### Participar em Reality TV
**Incluindo Voters:**

**Voter:** Pode participar com:
- Registro simples
- Aprovação por admin
- Limite: 1 season por ano

**Participant:** Aprovação automática, unlimited

---

### 3. MODERAR (Moderation Model)

#### Feedback & Reviews
**Todos podem dar feedback (com reputação):**

```
Voter feedback       → visibilidade baixa (0-10 readers)
Participant feedback → visibilidade média (50+ readers)
Mentor feedback      → visibilidade alta (200+ readers)
Admin action         → visibilidade máxima (site-wide)
```

**Implementação:**
```python
class FeedbackVisibilitySerializer(serializers.ModelSerializer):
    visibility = serializers.SerializerMethodField()
    
    def get_visibility(self, obj):
        user_type = obj.author.user_type
        
        multipliers = {
            'voter': 1,
            'participant': 5,
            'mentor': 20,
            'admin': 999,
        }
        
        # Também considerar reputação
        reputation = UserReputation.objects.get(user=obj.author).score
        
        return multipliers.get(user_type, 1) * min(1.5, reputation / 100)
```

#### Reportar Abuso
**Todos:** Podem reportar (anônimo ou não)

```
Report by Voter       → 1 ponto peso
Report by Participant → 5 pontos peso
Report by Mentor      → 20 pontos peso
Consensus threshold   → 10+ pontos ou 5+ diferentes users
```

---

### 4. GOVERNAR (Governance Model)

**Apenas Admins:** Políticas, suspensões, features globais

```
Admin só
├── Editar termos
├── Suspender usuarios
├── Feature/unfeature
├── Audit logs
└── System-wide decisions
```

---

## BOAS PRÁTICAS DE ECOSSISTEMA INCLUSIVO

### 1. Onboarding Gradual
```
New User (Voter)
    ↓
[Email verified] → Acesso às features básicas
    ↓
[Phone verified] → Pode comprar/participar
    ↓
[Perfil completo + 1 interação positiva] → Pode criar (marketplace)
    ↓
[10 vendas + 4.5 rating] → Tier "Verified Seller"
    ↓
[Aplicação + mentor approval] → Pode ser Mentor
    ↓
[Mentor performance + admin approval] → Peut ser Admin
```

### 2. Reputação & Trust Score

Cada user tem **Trust Score** que abre features:

```python
class UserTrustScore(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # Score components
    account_age = models.IntegerField(default=0)  # days
    verified_email = models.BooleanField(default=False)
    verified_phone = models.BooleanField(default=False)
    profile_complete = models.BooleanField(default=False)
    
    # Engagement
    votes_cast = models.IntegerField(default=0)
    content_published = models.IntegerField(default=0)
    positive_feedback_count = models.IntegerField(default=0)
    reports_filed = models.IntegerField(default=0)
    
    # Seller metrics
    sales_completed = models.IntegerField(default=0)
    average_rating = models.FloatField(default=0.0)
    dispute_count = models.IntegerField(default=0)
    
    @property
    def total_score(self):
        return (
            (self.account_age / 365) * 10 +  # 0-10 pts
            (self.verified_email * 5) +
            (self.verified_phone * 5) +
            (self.profile_complete * 5) +
            min(10, self.votes_cast / 10) +
            min(15, self.content_published * 3) +
            min(20, self.positive_feedback_count) +
            min(10, self.sales_completed) +
            (self.average_rating * 5) -
            (self.dispute_count * 10)
        )
    
    def can_create_marketplace_listing(self):
        return self.total_score >= 10 or self.user.user_type in ['participant', 'mentor', 'admin']
    
    def can_create_kixikila_group(self):
        return (
            (self.total_score >= 15 and self.verified_email and self.verified_phone) or
            self.user.user_type in ['participant', 'mentor', 'admin']
        )
```

### 3. Transparência & Appeal
- Tudo que bloqueia → tem explicação + CTA para remediar
- Usuário pode apelar qualquer rejeição
- Dashboard claro: "Ganhe 5 pontos trust votando"

```typescript
// Frontend: TrustScoreProgressBar
const TrustProgress = ({ user }: { user: User }) => {
  const score = user.trust_score.total_score;
  const nextLevel = Math.ceil(score / 5) * 5;
  
  const actions = [
    { label: 'Confirmar email', points: 5, done: user.email_verified },
    { label: 'Confirmar telefone', points: 5, done: user.phone_verified },
    { label: 'Completar perfil', points: 5, done: user.profile_complete },
    { label: 'Votar 10x', points: 10, done: user.trust_score.votes_cast >= 10 },
  ];
  
  return (
    <div>
      <ProgressBar value={score} max={nextLevel} />
      <p>{score} / {nextLevel} pontos</p>
      <ul>
        {actions.map(a => (
          <li key={a.label} className={a.done ? 'done' : 'pending'}>
            {a.label} (+{a.points} pontos)
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### 4. Freemium Model

**Voter (Free):**
- Votar ilimitado
- Ler conteúdo
- Comprar serviços
- Criar marketplace listing (com verificação)
- 1 grupo kixikila (com subscrição $9.99/mês)

**Participant (Free or Paid):**
- Tudo que Voter + sem limites
- Criar cursos
- Vender serviços premium
- Múltiplos grupos kixikila

**Mentor ($99/mês):**
- Tudo que Participant
- Certificar
- Turmas
- Analytics avançado

**Admin (Salário):**
- Tudo unrestricted

### 5. Community First
- Não há "second class citizens"
- Todos têm voz (weighted by trust)
- Transparência em decisões
- Appeals process for everything

---

## MATRIZ REVISADA - INCLUSIVA

```
┌──────────────────────┬────────────┬──────────────┬────────┬───────┐
│ Feature              │ Voter      │ Participant  │ Mentor │ Admin │
├──────────────────────┼────────────┼──────────────┼────────┼───────┤
│ Votar                │ ✅ Free    │ ✅ Free      │ ✅ ✨  │ ✅ ✨ │
│ Comprar serviços     │ ✅ Free    │ ✅ Free      │ ✅ ✨  │ ✅ ✨ │
│ Ler blog             │ ✅ Free    │ ✅ Free      │ ✅ ✨  │ ✅ ✨ │
│ Escrever comentário  │ ✅ Free    │ ✅ Free      │ ✅ ✨  │ ✅ ✨ │
│ Reportar abuso       │ ✅ Free    │ ✅ Free      │ ✅ ✨  │ ✅ ✨ │
│                      │            │              │        │       │
│ Criar marketplace    │ ⚠️ L3 $    │ ✅ Free      │ ✅ ✨  │ ✅ ✨ │
│ Criar grupo kixikila │ ⚠️ L3 $    │ ✅ Free      │ ✅ ✨  │ ✅ ✨ │
│ Publicar artigo      │ ⚠️ Review  │ ✅ Free      │ ✅ ✨  │ ✅ ✨ │
│ Participar Reality   │ ⚠️ Approval│ ✅ Free      │ ✅ ✨  │ ✅ ✨ │
│                      │            │              │        │       │
│ Dar feedback         │ ✅ L0      │ ✅ L1        │ ✅ L2  │ ✅ L3 │
│ Avaliar (stars)      │ ⚠️ L2      │ ✅ L1        │ ✅ L0  │ ✅ L3 │
│ Moderar comentários  │ ❌         │ ⚠️ L3        │ ✅ L1  │ ✅ L0 │
│ Certificar           │ ❌         │ ❌           │ ✅ L0  │ ✅ L0 │
│                      │            │              │        │       │
│ Admin panel          │ ❌         │ ❌           │ ❌     │ ✅ L0 │
│ Edit policies        │ ❌         │ ❌           │ ❌     │ ✅ L0 │
│ Suspend user         │ ❌         │ ❌           │ ❌     │ ✅ L0 │
└──────────────────────┴────────────┴──────────────┴────────┴───────┘

✅ Free   = Sem custo, sem pré-requisitos
⚠️ L#    = Pré-requisitos de confiança/verificação
⚠️ Review = Precisa aprovação
⚠️ $     = Requer subscrição ou verificação
✨       = Feature premium/enhanced para este tier
```

---

## IMPLEMENTAÇÃO - PRIORIDADE

### Fase 1: Trust Score System (Semana 1)
- [ ] UserTrustScore model + migration
- [ ] Trust score calculation logic
- [ ] Frontend progress indicator
- [ ] Feature gates baseado em trust

### Fase 2: Marketplace Inclusão (Semana 2)
- [ ] Voter seller com verification
- [ ] Tier system (Free, Verified, Unlimited)
- [ ] Rating/feedback system

### Fase 3: Kixikila Inclusão (Semana 3)
- [ ] Voter group creation com payment
- [ ] Subscription model integration
- [ ] Tier unlocks

### Fase 4: Blog & Content (Semana 4)
- [ ] Voter submission + approval workflow
- [ ] Moderation queue
- [ ] Publishing levels

### Fase 5: Reality TV Inclusão (Semana 5)
- [ ] Voter application + admin approval
- [ ] Season participation for all tiers

---

## BENEFÍCIOS DO NOVO MODELO

✅ **Inclusão:** Todos podem criar/vender (com verificação)
✅ **Segurança:** Trust score garante qualidade
✅ **Monetização:** Freemium abre múltiplas revenue streams
✅ **Engagement:** Voters têm incentivos claros para avançar
✅ **Equidade:** Nenhum usuário é bloqueado indefinidamente
✅ **Transparência:** Rules claras e appeals process
✅ **Community:** Crescimento vertical (voter → participant → mentor)

---

## CONCLUSÃO

**Ecossistema inclusivo não significa sem guardrails.**

É equilibrar:
- **Abertura** (qualquer um pode começar)
- **Qualidade** (trust score garante padrão)
- **Justiça** (transparency + appeals)
- **Sustentabilidade** (freemium + premium tiers)

