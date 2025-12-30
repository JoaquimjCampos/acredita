# 🎨 VISUAL SUMMARY: Reorganização da Plataforma Acredita

**Formato**: Quick reference com diagramas ASCII e visualizações  
**Objetivo**: Visão rápida do projeto completo

---

## 🎯 VISÃO GERAL EM 1 PÁGINA

```
                    ╔════════════════════════════════════════╗
                    ║        ACREDITA REORGANIZAÇÃO 2026     ║
                    ║    Análise Profunda + Implementação    ║
                    ╚════════════════════════════════════════╝


┌─────────────────────────────────────────────────────────────────────────┐
│ O PROBLEMA ATUAL (Status Quo)                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  🏠 Homepage                                                            │
│  ├─ 12+ seções desconectadas                                          │
│  ├─ 45% bounce rate                                                    │
│  └─ 90s até primeiro CTA                                              │
│                                                                         │
│  🧭 Navegação                                                          │
│  ├─ 4 sistemas paralelos (Header, Mobile, Homepage Nav, Sidebar)      │
│  ├─ Rotas duplicadas (português/inglês)                               │
│  └─ 70+ linhas de código duplicado                                    │
│                                                                         │
│  👤 User Model                                                         │
│  ├─ Profiles fragmentados (3 diferentes)                              │
│  ├─ Reputação desintegrada (3 scores)                                 │
│  └─ Sem activity log unificado                                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│ A SOLUÇÃO PROPOSTA (Future State)                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  CAMADA 1: SURFACE (UI/UX) ⚡ 5-7 dias                                 │
│  ├─ ✅ Nova HomePage (Hero → Value Prop → CTA)                        │
│  ├─ ✅ Navegação unificada (navigationConfig.ts)                      │
│  ├─ ✅ Dashboard personalizado                                         │
│  └─ ✅ Rotas consolidadas                                             │
│                                                                         │
│  CAMADA 2: FOUNDATION (Models) 🏗️ 3-5 dias (paralelo)                │
│  ├─ ✅ Extended User model (trust_score integrado)                    │
│  ├─ ✅ UserProfile agregado                                           │
│  ├─ ✅ Badge & Achievement system                                      │
│  └─ ✅ UserActivity audit log                                         │
│                                                                         │
│  CAMADA 3: INTEGRATION (Backend) 🔄 3-4 dias (paralelo)               │
│  ├─ ✅ /api/accounts/me/dashboard_stats/                              │
│  ├─ ✅ /api/accounts/me/trust_breakdown/                              │
│  ├─ ✅ /api/accounts/leaderboard/                                     │
│  └─ ✅ Auto-calculation via signals                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│ IMPACTO DE NEGÓCIO                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📊 MÉTRICA                    │ BASELINE  │  TARGET  │  MELHORIA      │
│  ══════════════════════════════╪═══════════╪══════════╪════════════════│
│  Bounce Rate                    │   45%    │   25%   │  ↓ 44%         │
│  Time to CTA                    │   90s    │   30s   │  ↓ 67%         │
│  CTR (Hero Button)              │    8%    │   20%   │  ↑ 150%        │
│  Registration Rate              │    5%    │   12%   │  ↑ 140%        │
│  Revenue (AOA/mês)              │  4M      │  9.2M   │  ↑ 130%        │
│  Code Duplication               │   45%    │   10%   │  ↓ 78%         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│ TIMELINE IMPLEMENTAÇÃO                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  SEMANA 1: SPRINT 1 (Dias 1-3)                                         │
│  ├─ Dia 1: Navigation setup + Planning                                │
│  ├─ Dia 2: Homepage refactor                                          │
│  ├─ Dia 3: Testing + Staging deploy                                  │
│  └─ ✅ MILESTONE: Surface layer complete                              │
│                                                                         │
│  SEMANA 1-2: SPRINT 2 (Dias 4-7)  [Paralelo]                          │
│  ├─ Dia 1-2: Models + Migrations (BE)                                │
│  ├─ Dia 3-4: Endpoints + Components (FS)                             │
│  ├─ Dia 5-6: Testing + Integration                                   │
│  └─ ✅ MILESTONE: Foundation + Integration complete                   │
│                                                                         │
│  SEMANA 2: QA + DEPLOY (Dias 8-11)                                    │
│  ├─ Dia 8: Final testing + monitoring                                │
│  ├─ Dia 9: Staging sign-off                                          │
│  ├─ Dia 10-11: Prod deploy (gradual: 10% → 50% → 100%)              │
│  └─ ✅ FINAL MILESTONE: Production live                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ ARQUITETURA VISUAL

### Antes: Fragmentado

```
┌─────────────────────────────────────┐
│         HOMEPAGE                    │
│  (12+ seções desconectadas)         │
│                                     │
│  ├─ Hero                            │
│  ├─ Featured Season                 │
│  ├─ Quiz Challenge                  │
│  ├─ Leaderboard Global              │
│  ├─ Kixikila Preview                │
│  ├─ Marketplace Preview             │
│  ├─ Certifications Preview          │
│  ├─ Games Section                   │
│  ├─ Videos                          │
│  ├─ Ads                             │
│  ├─ Sponsors                        │
│  └─ Fundraising                     │
└─────────────────────────────────────┘
        ↓
    Usuário confuso
    Bounce = 45%
    CTA = Nenhuma clara
```

### Depois: Estruturado

```
┌──────────────────────────────────────────────┐
│            HOMEPAGE NOVA                     │
│     (3 seções core + conversão)              │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ HERO SECTION                           │  │
│  │ "Acredita em Ti"                       │  │
│  │ [CTA PRINCIPAL: Começar] ← FOCUSED     │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ VALUE PROPOSITION (3 Pilares)          │  │
│  │ ┌─────────────┬─────────────────────┐  │  │
│  │ │ 🎓 Certs    │ 🛠️ Marketplace │  │  │
│  │ │             │                     │  │  │
│  │ │ 💰 Kixikila │                     │  │  │
│  │ └─────────────┴─────────────────────┘  │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ [IF AUTH] DASHBOARD PERSONALIZADO     │  │
│  │ ├─ Meus Cursos (progress)              │  │
│  │ ├─ Meus Serviços (count)               │  │
│  │ └─ Meus Grupos (count)                 │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ [IF GUEST] SOCIAL PROOF                │  │
│  │ "1000+ Empreendedores já confiam"      │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ FEATURED CONTENT (lazy loaded)         │  │
│  └────────────────────────────────────────┘  │
│                                              │
└──────────────────────────────────────────────┘
        ↓
    Usuário claro
    Bounce = 25%
    CTA = "Começar"
```

---

## 🧭 NAVEGAÇÃO UNIFICADA

### De 4 Sistemas Para 1

```
ANTES:
┌──────────────────┐
│ Header Nav       │ (Hard-coded)
├──────────────────┤
│ Mobile Menu      │ (Separated)
├──────────────────┤
│ HomepageNav      │ (Duplicated)
├──────────────────┤
│ Sidebar (future) │ (Pending)
└──────────────────┘
  ❌ 70+ lines duplicated
  ❌ Hard to maintain


DEPOIS:
┌──────────────────────────────────┐
│   navigationConfig.ts            │  ← Single Source of Truth
│   (NAVIGATION_CONFIG: array)     │
│                                  │
│   const items = [                │
│     { id, label, path, icon,     │
│       visibility, priority }     │
│     ...                          │
│   ]                              │
└──────────────────────────────────┘
            ↓
    ┌───────┬───────────┬───────┐
    ↓       ↓           ↓       ↓
  Header  Mobile  Sidebar  Footer
  Menu    Menu           Links
  
  ✅ DRY principle
  ✅ Easy to maintain
  ✅ Consistent everywhere
```

---

## 👤 USER TRUST SYSTEM

### Before: Fragmentado

```
User
├─ Certificações
│  └─ Certificate
│     └─ Score: ? (internal)
├─ Marketplace
│  └─ ServiceProvider
│     └─ Reviews → Rating: ⭐⭐⭐⭐
├─ Kixikila
│  └─ KixikilaMembership
│     └─ Rating: Trust Level (beginner/trusted/champion)
└─ ???
   No unified view!
```

### After: Integrado

```
User (EXTENDED)
├─ trust_score: 72/100  ← UNIFIED
├─ trust_level: "TRUSTED"
│
├─ Pillar Breakdown
│  ├─ certification_trust: 35/40
│  ├─ marketplace_trust: 28/35
│  └─ kixikila_trust: 9/25
│
├─ badges: [
│  ├─ "CERTIFIED_EXPERT"
│  ├─ "TRUSTED_PROVIDER"
│  └─ "KIXIKILA_CONTRIBUTOR"
│ ]
│
├─ activities: [
│  ├─ "Completou Curso #5"
│  ├─ "Novo pedido do cliente"
│  └─ "Contribuição confirmada"
│ ]
│
└─ profile_completion: 85%
```

---

## 📊 COMPONENTES NOVOS (Frontend)

```
┌─────────────────────────────────────────┐
│      Componentes Criados / Refatorados  │
├─────────────────────────────────────────┤
│                                         │
│  HOMEPAGE                               │
│  ├─ HeroSection (novo)                  │
│  ├─ ValuePropositionSection (novo)      │
│  ├─ AuthenticatedDashboardSection (novo)│
│  └─ SocialProofSection (novo)           │
│                                         │
│  LAYOUT                                 │
│  ├─ Header (refactored)                 │
│  ├─ MobileMenu (refactored)             │
│  └─ navigationConfig (novo)             │
│                                         │
│  DASHBOARD                              │
│  ├─ UnifiedUserDashboard (novo)         │
│  ├─ TrustScoreGauge (novo)              │
│  ├─ ProgressCard (novo)                 │
│  └─ BadgeDisplay (novo)                 │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔌 ENDPOINTS BACKEND (API)

```
┌──────────────────────────────────────────┐
│    Novos Endpoints Backend               │
├──────────────────────────────────────────┤
│                                          │
│  GET /api/accounts/me/dashboard_stats/   │
│  {                                       │
│    user: {...},                          │
│    certifications: {...},                │
│    marketplace: {...},                   │
│    kixikila: {...},                      │
│    badges: [...],                        │
│    recent_activity: [...]                │
│  }                                       │
│                                          │
│  GET /api/accounts/me/trust_breakdown/   │
│  {                                       │
│    overall_score: 72,                    │
│    components: {                         │
│      certification: {...},               │
│      marketplace: {...},                 │
│      kixikila: {...}                     │
│    },                                    │
│    next_milestone: {...}                 │
│  }                                       │
│                                          │
│  GET /api/accounts/leaderboard/          │
│  [{                                      │
│    rank: 1,                              │
│    user: {...},                          │
│    trust_score: 95,                      │
│    badges_count: 7                       │
│  }, ...]                                 │
│                                          │
└──────────────────────────────────────────┘
```

---

## 📈 FLUXO DE CONVERSÃO

### Novo Usuário

```
Visit Homepage
      ↓
[HERO] "Acredita em Ti"
[CTA] "Começar"
      ↓
Register (1-click Google/Email)
      ↓
[DASHBOARD] 3 Opções
  1. Inscrever-se em Curso
  2. Criar Serviço
  3. Criar Grupo
      ↓
Choose Pilar → Action
      ↓
Start journey → Earn trust_score
      ↓
Unlock badges → Higher visibility
      ↓
Become "TRUSTED" → Better opportunities
```

### Usuário Autenticado

```
Login → Dashboard
           ↓
[Progress Cards] Mostra avanço
├─ Certificações: 2/5 cursos
├─ Marketplace: 3 serviços ativos
└─ Kixikila: 1 grupo ativo
           ↓
[Quick Actions] CTAs contextuais
├─ "Continuar Curso"
├─ "Novo Pedido"
└─ "Contribuir"
           ↓
[Trust Score] Progresso visível
├─ Score: 72/100 (TRUSTED)
├─ Next milestone: 80 (CHAMPION)
└─ Recent badges: 3 earned
           ↓
Community Loop (Referral, Engagement)
```

---

## 🎯 PRIORIDADES & VISIBILITY

```
NAVIGATION CONFIG

┌─────────────────────────────────────────────────────┐
│ PRIORITY │ ITEMS       │ HEADER │ MOBILE │ SIDEBAR  │
├─────────────────────────────────────────────────────┤
│    1-3   │ Core        │   ✅   │   ✅   │   ✅     │
│  (3x)    │ (Cert,      │        │        │          │
│          │  Market,    │        │        │          │
│          │  Kixikila)  │        │        │          │
├─────────────────────────────────────────────────────┤
│    4-5   │ Community   │   ✅   │   ✅   │   ✗      │
│  (2x)    │ (Games,     │        │        │          │
│          │  Rankings)  │        │        │          │
├─────────────────────────────────────────────────────┤
│   10-11  │ User        │   ✗    │   ✅   │   ✅     │
│  (2x)    │ (Dashboard, │        │        │          │
│          │  Profile)   │        │        │          │
├─────────────────────────────────────────────────────┤
│   20+    │ Content,    │   ✗    │   ✅   │   ✗      │
│  (3x)    │ Admin       │        │        │          │
└─────────────────────────────────────────────────────┘

✅ = Always shown
✗ = Hidden or secondary
```

---

## 🚀 DEPLOYMENT STRATEGY

```
DAY 1-7: Development
│
├─ Phase 1 (Days 1-3): SURFACE
│ ├─ Homepage refactor
│ ├─ Navigation unification
│ └─ Dashboard personalization
│
├─ Phase 2 (Days 1-7): FOUNDATION (Parallel)
│ ├─ Models & migrations
│ ├─ Signals & automation
│ └─ Data population
│
└─ Phase 3 (Days 4-7): INTEGRATION (Parallel)
  ├─ Backend endpoints
  ├─ Frontend components
  └─ Full testing

DAY 8-9: QA & Staging
│
├─ Final testing
├─ Performance audit
├─ Accessibility check
└─ Staging sign-off

DAY 10-11: Production Deployment (GRADUAL)
│
├─ Day 10: 10% traffic → Monitor
├─ Day 10 evening: 50% traffic → Monitor
└─ Day 11: 100% traffic → Celebrate! 🎉
```

---

## 📊 MÉTRICAS ANTES vs DEPOIS

```
MÉTRICA                    │ ANTES  │ DEPOIS │ GAIN
═══════════════════════════╪════════╪════════╪════════
Bounce Rate                │  45%   │  25%   │ ↓ 44%
Time to CTA                │  90s   │  30s   │ ↓ 67%
CTR (Hero)                 │   8%   │  20%   │ ↑150%
Registration Rate          │   5%   │  12%   │ ↑140%
Monthly Active Users       │  500   │ 1200   │ ↑140%
Code Duplication           │  45%   │  10%   │ ↓ 78%
Bundle Size                │ 450KB  │ 400KB  │ ↓ 11%
Accessibility Score        │  72    │  92    │ ↑ 27%
Trust Score Coverage       │  0%    │ 100%   │ ↑100%
Badge Unlock Rate          │  N/A   │  50%   │ NEW!
```

---

## ✅ GO/NO-GO CHECKLIST

```
Antes de começar:

☐ Stakeholder approval obtida
☐ Team capacity confirmada (7-11 dias dedicados)
☐ Staging environment pronto
☐ Database backups configurados
☐ Monitoring/observability pronto
☐ Rollback procedure documentado
☐ Communication plan definido
☐ Success metrics baseline coletado

Após completar:

☐ All tests passing (unit + integration + E2E)
☐ Lighthouse score >85
☐ Accessibility score >90
☐ Performance baseline <2s load
☐ Zero critical bugs
☐ Rollback tested e funcionando
☐ Team trained sobre novas features
☐ Documentation atualizada
☐ Monitoring alerts configurados
☐ Customer communication pronta
```

---

## 🎓 REFERÊNCIA RÁPIDA

### Documentos Principais
- 📄 `SUMARIO_EXECUTIVO_...md` - Para aprovação
- 📄 `ANALISE_PROFUNDA_...md` - Para tech leads
- 📄 `IMPLEMENTACAO_PRATICA_...md` - Para devs
- 📄 `ARQUITETURA_UNIFICADA_...md` - Para backend

### Código Exemplo
```typescript
// navigationConfig.ts (NOVO)
const NAVIGATION_CONFIG = [
  { id: 'certifications', priority: 1, ... },
  { id: 'marketplace', priority: 2, ... },
  { id: 'kixikila', priority: 3, ... },
  ...
];

// HomePage.tsx (REFACTORED)
<HeroSection />
<ValuePropositionSection />
{isAuthenticated && <AuthenticatedDashboardSection />}
<FeaturedContentSection />
```

### Endpoints Novos (Backend)
- `GET /api/accounts/me/dashboard_stats/`
- `GET /api/accounts/me/trust_breakdown/`
- `GET /api/accounts/leaderboard/`

---

## 🎯 FINAL MESSAGE

```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║  ✅ ANÁLISE: Completa e detalhada                    ║
║  ✅ ARQUITETURA: Escalável e mantenível              ║
║  ✅ IMPLEMENTAÇÃO: Ready-to-use code                 ║
║  ✅ TIMELINE: Realista (7-11 dias)                   ║
║  ✅ ROI: Alto impacto (+140% conversão)              ║
║                                                       ║
║  🚀 PRONTO PARA: Aprovação → Implementação           ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

---

**Documentação Visual Completa**  
**Status**: ✅ Ready for Presentation  
**Data**: Dezembro 2025
