# Phase 2: A/B Testing Implementation Guide

**Date: December 27, 2025 | Status: Components Created**

---

## Overview

Phase 2 implementação completa com:
- ✅ **ActivityTimeline Component** - Exibe eventos recentes no dashboard
- ✅ **HeroVariant Component** - Suporta A/B testing de herói
- ✅ Integração com HomePage e DashboardPage
- ✅ Rastreamento de variantes via analytics

---

## Components Created

### 1. ActivityTimeline (`frontend/src/components/ActivityTimeline.tsx`)

**Funcionalidades:**
- Exibe últimos 10 eventos recentes (com opção de "Ver todas")
- Integrado com `/api/v2/core/me/activity` endpoint
- Cache de 5 minutos server-side
- Icons diferentes por tipo de evento (kixikila, marketplace, cert, season)
- Timestamps relativos (agora, 5m atrás, 2h atrás, etc.)
- Loading e erro states

**Evento rastreado:**
- Componente carrega automaticamente ao entrar no dashboard

### 2. HeroVariant (`frontend/src/components/HeroVariant.tsx`)

**Variantes:**
- **Variant A (default)**: Hero minimalista, text-only, simples e rápido
- **Variant B**: Com imagem, stats pills, 2 CTAs (primary + secondary)

**Como usar:**
```tsx
import HeroVariant from '../components/HeroVariant';

<HeroVariant />  // Auto-detecta via ?hero-variant=A|B
```

**Query Parameters:**
```
http://localhost:3000?hero-variant=A  // Força variante A
http://localhost:3000?hero-variant=B  // Força variante B
http://localhost:3000                 // Aleatório/Padrão (A)
```

**Eventos rastreados:**
- `hero-variant-exposed` - Quando usuário vê uma variante
- `hero-cta-click` - Com `value: variant` para segmentação
- `hero-social-proof` - Cliques em chips (Variante A)

---

## Testing Instructions

### Step 1: Verificar Components

```bash
# Verificar imports (sem erros)
grep -r "ActivityTimeline\|HeroVariant" frontend/src
```

### Step 2: Teste Local A/B Variants

**Teste Variante A (default):**
```
http://localhost:3000/
# Ou explícito:
http://localhost:3000?hero-variant=A
```
✓ Esperado: Hero minimalista, texto centrado, 1 CTA primária

**Teste Variante B:**
```
http://localhost:3000?hero-variant=B
```
✓ Esperado: Hero com layout 2-colunas, imagem/illustration, 2 CTAs

### Step 3: Verificar ActivityTimeline

1. **Login** como usuário com TrustEvents
2. **Ir para Dashboard** (`/dashboard`)
3. ✓ ActivityTimeline deve aparecer na seção principal
4. ✓ Clique em "Ver todas" se > 10 eventos

### Step 4: Monitorar Analytics

**Backend logs:**
```powershell
Get-Content -Path "C:\apps\Acredita\backend\logs\analytics.log" -Wait
```

Esperado:
```
2025-12-27 12:00:00 hero-variant-exposed | variant: B
2025-12-27 12:00:05 hero-cta-click | variant: B | label: dashboard
```

---

## A/B Test Setup

### Option 1: Random Assignment (Simple)

```tsx
// In HeroVariant or wrapper component
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const hasVariant = params.get('hero-variant');
  
  if (!hasVariant) {
    const randomVariant = Math.random() > 0.5 ? 'B' : 'A';
    window.history.replaceState(
      {},
      '',
      `?hero-variant=${randomVariant}`
    );
  }
}, []);
```

### Option 2: User-Based Assignment (Stable)

```tsx
const getUserVariant = (userId: string): 'A' | 'B' => {
  const hash = userId.charCodeAt(0) % 2;
  return hash === 0 ? 'A' : 'B';
};
```

### Option 3: Time-Based Assignment (Progressive)

```tsx
// Roll out Variant B starting Day 3 at 25%, Day 7 at 50%, Day 14 at 100%
const getTimeBasedVariant = (): 'A' | 'B' => {
  const startDate = new Date('2025-12-27');
  const daysElapsed = Math.floor(
    (new Date().getTime() - startDate.getTime()) / (1000 * 86400)
  );
  
  const rolloutThresholds = {
    3: 0.25,   // 25% on day 3
    7: 0.50,   // 50% on day 7
    14: 1.00   // 100% on day 14
  };
  
  for (const [day, threshold] of Object.entries(rolloutThresholds)) {
    if (daysElapsed >= parseInt(day)) {
      return Math.random() < threshold ? 'B' : 'A';
    }
  }
  
  return 'A';
};
```

---

## Success Metrics

### Phase 2 Targets

| Metric | Variant A | Variant B | Winner |
|--------|-----------|-----------|--------|
| Hero CTR | ? | ? | TBD |
| Avg time on page | ? | ? | TBD |
| Dashboard entry rate | ? | ? | TBD |
| Module engagement | ? | ? | TBD |

### How to Measure

1. **Dashboard CTR**
   ```sql
   SELECT 
     variant,
     COUNT(*) as cta_clicks,
     COUNT(DISTINCT user_id) as users,
     ROUND(COUNT(*) / COUNT(DISTINCT user_id), 2) as avg_cta_per_user
   FROM analytics_events
   WHERE name = 'hero-cta-click'
   GROUP BY variant
   ```

2. **Time on Page**
   - Monitor via browser analytics or GA4
   - Mínimo de 3 dias de dados antes de conclusão

3. **Conversion Path**
   - Hero → Dashboard login
   - Hero → Module click
   - Hero → Season join

---

## Implementation Checklist

- [ ] ActivityTimeline component renders without errors
- [ ] Activity endpoint (`/api/v2/core/me/activity/`) returns data
- [ ] HeroVariant A renders minimalista
- [ ] HeroVariant B renders com imagem + 2 CTAs
- [ ] Query param `?hero-variant=B` forces variant B
- [ ] Analytics events logged to `backend/logs/analytics.log`
- [ ] Dashboard shows ActivityTimeline without errors
- [ ] A/B test can be toggled via query params
- [ ] Metrics dashboard ready to track (spreadsheet or GA4)

---

## Next: Phase 3 (60-90 days)

Once Phase 2 baseline is complete:
1. Analytics batching + retry logic
2. ETag/conditional GET optimization
3. Season transition automation
4. Observability dashboard

---

## File Summary

**Created:**
- `frontend/src/components/ActivityTimeline.tsx` (218 lines)
- `frontend/src/components/HeroVariant.tsx` (267 lines)

**Modified:**
- `frontend/src/pages/HomePage.tsx` - Now uses HeroVariant
- `frontend/src/pages/DashboardPage.tsx` - Now includes ActivityTimeline
- `backend/core/views.py` - Fixed aggregation bug (line 48)

---

**Status: Ready for Phase 2 Baseline Testing**
