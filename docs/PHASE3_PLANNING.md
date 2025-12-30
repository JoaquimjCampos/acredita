# Phase 3: CTA Personalization & Notifications
**Date: December 27, 2025 | Status: Planning**

---

## Overview

Phase 3 implementa personalização de CTAs baseada em engagement do utilizador e notificações de atividade recente.

---

## Objetivos Phase 3

### 1. CTA Personalization (40% do effort)

**Objetivo:** Adaptar a copy do secondary CTA no herói baseado no módulo mais usado pelo utilizador.

**Lógica:**
```
trust_breakdown (do /api/v2/core/me/dashboard/) determina:
- Se engagement em "kixikila" > 40% → "Iniciar Certificação" → /certifications
- Se engagement em "marketplace" > 40% → "Explorar Marketplace" → /marketplace
- Se engagement em "seasons" > 40% → "Juntar-se Temporada" → /seasons
- Default → "Explorar Oportunidades" → /marketplace
```

**Benefício:**
- CTR mais alta (copy relevante ao user)
- Conversion rate melhorada
- Menos friction (user vê próximo passo óbvio)

**Métricas:**
- Tracking: `hero-cta-secondary-label` (qual copy foi mostrada)
- Comparação: Variant A CTA genérica vs Variant B CTA personalizada

---

### 2. Activity Notifications (30% do effort)

**Objetivo:** Badge no dashboard link mostrando "X novas atividades" desde última visita.

**Implementação:**
```tsx
// localStorage tracking
- last_activity_check: timestamp da última vez que user viu o dashboard
- current_activity_count: total de eventos

// Badge logic
if (current_activity_count > last_activity_check_events) {
  show_badge("3 novas")
}

// On dashboard mount
localStorage.setItem('last_activity_check', new Date())
localStorage.setItem('last_activity_count', current_activity_count)
```

**UI:**
```
Dashboard 🔴 3 novas
           (red badge com count)
```

**Locais a mostrar:**
- Navigation sidebar
- Main navigation links
- Maybe home page quick link

---

### 3. Analytics Refinement (20% do effort)

**Objetivo:** Melhorar granularidade de eventos para melhor decisão data-driven.

**Novos eventos:**
```
- "activity-view-start" → Quando user entra em /dashboard
- "activity-view-end" → Quando user sai do dashboard
- "activity-event-expand" → Quando user clica num evento para detalhes
- "timeline-pagination" → Quando user clica "Ver todas"
- "cta-secondary-personalized" → Quando copy foi customizada
```

**Payload enriquecido:**
```json
{
  "name": "hero-cta-click",
  "variant": "B",
  "cta_type": "secondary",
  "cta_label": "marketplace|certifications|seasons|opportunities",
  "user_primary_engagement": "marketplace",  // Qual módulo user mais usa
  "personalized": true,                       // Se CTA foi customizada
  "timestamp": "2025-12-27T..."
}
```

---

## Arquitetura Phase 3

### Component Hierarchy

```
HomePage
├── HeroVariant
│   ├── CTA Personalization Hook
│   │   └── useUserEngagement() → trust_breakdown
│   └── Analytics Hook
│       └── trackEvent() enriched
└── ...

DashboardPage
├── ActivityBadge (NEW)
│   └── useActivityNotification() → localStorage
├── ActivityTimeline
└── ...
```

### New Hooks Needed

1. **useUserEngagement()**
   - Reads: trust_breakdown from useCoreDashboard
   - Returns: primary_engagement (module name)

2. **useActivityNotification()**
   - Reads: localStorage + current activity count
   - Returns: unread_count, should_show_badge
   - Side effect: Updates localStorage on dashboard mount

3. **useCTAPersonalization()**
   - Reads: primary_engagement from useUserEngagement
   - Returns: personalized_label, personalized_path
   - Maps module → CTA copy & navigation

---

## Implementation Tasks

### Sprint 1: CTA Personalization (2-3 days)

#### Task 1: useUserEngagement Hook
```tsx
// frontend/src/hooks/useUserEngagement.ts (NEW)

export const useUserEngagement = () => {
  const { data: me } = useCoreDashboard();
  
  const getPrimaryEngagement = (): string => {
    const breakdown = me?.trust_breakdown || {};
    let highest = 'marketplace';  // default
    let highestCount = 0;
    
    Object.entries(breakdown).forEach(([module, count]) => {
      if (count > highestCount) {
        highest = module;
        highestCount = count;
      }
    });
    
    return highest;
  };
  
  return { primary_engagement: getPrimaryEngagement() };
};
```

#### Task 2: useCTAPersonalization Hook
```tsx
// frontend/src/hooks/useCTAPersonalization.ts (NEW)

export const useCTAPersonalization = (primary_engagement: string) => {
  const ctaMap = {
    'kixikila': {
      label: 'Iniciar Certificação',
      path: '/certifications',
      icon: 'Award'
    },
    'marketplace': {
      label: 'Explorar Marketplace',
      path: '/marketplace',
      icon: 'ShoppingBag'
    },
    'seasons': {
      label: 'Juntar-se Temporada',
      path: '/seasons',
      icon: 'Calendar'
    }
  };
  
  return ctaMap[primary_engagement] || ctaMap['marketplace'];
};
```

#### Task 3: Update HeroVariant
```tsx
// frontend/src/components/HeroVariant.tsx (MODIFIED)

const HeroVariant: React.FC<HeroVariantProps> = ({ variant = 'A' }) => {
  const { primary_engagement } = useUserEngagement();
  const personalized = useCTAPersonalization(primary_engagement);
  
  const handleSecondaryCTA = () => {
    trackEvent({
      name: 'hero-cta-click',
      variant: selectedVariant,
      label: personalized.label,
      cta_type: 'secondary',
      personalized: true,
      primary_engagement: primary_engagement
    });
    navigate(personalized.path);
  };
  
  return (
    // Variant B secondary CTA com label personalizado
    <Button onClick={handleSecondaryCTA}>
      {personalized.label}
    </Button>
  );
};
```

---

### Sprint 2: Activity Notifications (2-3 days)

#### Task 4: useActivityNotification Hook
```tsx
// frontend/src/hooks/useActivityNotification.ts (NEW)

export const useActivityNotification = () => {
  const { data: activity } = useFetchMeActivity();
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    const lastCheck = localStorage.getItem('last_activity_check');
    const lastCount = parseInt(localStorage.getItem('last_activity_count') || '0');
    
    if (activity?.total_events) {
      const newUnread = Math.max(0, activity.total_events - lastCount);
      setUnreadCount(newUnread);
    }
  }, [activity]);
  
  const markAsRead = () => {
    localStorage.setItem('last_activity_check', new Date().toISOString());
    localStorage.setItem('last_activity_count', activity?.total_events || 0);
    setUnreadCount(0);
  };
  
  return { unreadCount, markAsRead };
};
```

#### Task 5: ActivityBadge Component
```tsx
// frontend/src/components/ActivityBadge.tsx (NEW)

const ActivityBadge: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) return null;
  
  return (
    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
      {count > 99 ? '99+' : count}
    </span>
  );
};
```

#### Task 6: Update Navigation/Layout
```tsx
// frontend/src/components/layout/Navigation.tsx (MODIFIED)

const Navigation = () => {
  const { unreadCount } = useActivityNotification();
  
  return (
    <nav>
      {/* ... outros items ... */}
      <NavItem href="/dashboard">
        Dashboard
        <ActivityBadge count={unreadCount} />
      </NavItem>
    </nav>
  );
};
```

---

### Sprint 3: Analytics & Testing (2-3 days)

#### Task 7: Enrich Analytics Events
```tsx
// frontend/src/utils/analytics.ts (MODIFIED)

export const trackEvent = (event: AnalyticsEvent) => {
  const enriched = {
    ...event,
    personalized: event.personalized || false,
    primary_engagement: event.primary_engagement || 'unknown',
    timestamp: new Date().toISOString(),
    user_id: getCurrentUserId() // from AuthContext
  };
  
  // POST to /api/analytics/events
  fetch('/api/analytics/events', {
    method: 'POST',
    body: JSON.stringify(enriched)
  });
};
```

#### Task 8: Backend Analytics Endpoint (if not exists)
```python
# backend/core/views.py (ADD endpoint)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_analytics_event(request):
    """
    Log analytics event with enriched data
    """
    event = request.data
    event['user_id'] = request.user.id
    event['timestamp'] = timezone.now()
    
    # Log to file
    logger.info(json.dumps(event))
    
    # Optional: Save to DB
    # AnalyticsEvent.objects.create(**event)
    
    return Response({'status': 'logged'}, status=204)
```

---

## Testing Phase 3

### Smoke Tests (Day 1)

- [ ] HeroVariant renders com secondary CTA personalizado
- [ ] CTA label muda baseado em trust_breakdown
- [ ] ActivityBadge aparece no navigation
- [ ] Badge count atualiza após usar dashboard
- [ ] localStorage está a guardar timestamps corretamente

### Integration Tests (Day 2)

- [ ] useUserEngagement retorna módulo correto
- [ ] useCTAPersonalization retorna label correto
- [ ] useActivityNotification calcula unreadCount
- [ ] Analytics events têm payload enriquecido
- [ ] Backend logs todos os eventos

### User Acceptance Tests (Day 3)

- [ ] Test user com high kixikila engagement vê "Iniciar Certificação"
- [ ] Test user com high marketplace engagement vê "Explorar Marketplace"
- [ ] Badge desaparece após ver dashboard
- [ ] Badge reaparece quando há novas atividades
- [ ] Analytics mostra "personalized": true para variant B

---

## Success Criteria Phase 3

| Critério | Métrica | Target |
|----------|---------|--------|
| CTA Personalization | % CTAs customizadas | > 90% |
| Activity Badge | % Users com badge | > 60% |
| Analytics Enrichment | % Events com payload completo | 100% |
| Performance | Load time (com hooks) | < 500ms |
| Data Quality | Eventos sem erros | > 99% |

---

## Timeline Phase 3

| Sprint | Tarefas | Dias | Data Est. |
|--------|---------|------|-----------|
| 1 | CTA Personalization | 2-3 | Jan 2-4 |
| 2 | Activity Notifications | 2-3 | Jan 5-7 |
| 3 | Analytics & Testing | 2-3 | Jan 8-10 |
| **Total** | | **6-9 dias** | **Jan 2-10** |

---

## Risks & Mitigations

| Risk | Impacto | Mitigação |
|------|---------|-----------|
| Analytics payload estrutura | Medium | Definir schema claro antes de implementar |
| localStorage inconsistência | Low | Validar counts antes de usar |
| Performance com múltiplos hooks | Medium | Memoize resultados, lazy load se needed |
| Browser storage quota | Low | Dados pequenos (< 1KB) |

---

## Dependencies

### Frontend
- React hooks (useState, useEffect, useContext)
- Existing: useCoreDashboard, useAuth
- New: useUserEngagement, useCTAPersonalization, useActivityNotification

### Backend
- Endpoint: /api/v2/core/me/dashboard/ (já existe)
- Endpoint: /api/analytics/events (pode precisar validação)
- Logger: configurado para analytics.log

### Data
- trust_breakdown do dashboard endpoint
- total_events do activity endpoint

---

## Documentation Needed (Phase 3)

- [ ] PHASE3_IMPLEMENTATION.md
- [ ] Hook usage guide
- [ ] Analytics event schema
- [ ] Testing checklist
- [ ] Deployment guide

---

## Next Steps After Phase 3

### Phase 4 (Post-Phase 3)
- Advanced A/B testing (statistical significance, confidence intervals)
- Recommendation engine (sugerir próximo módulo)
- User cohort analysis (segmentação por engagement pattern)

### Long-term (Roadmap 2026)
- Machine learning personalization
- Predictive churn detection
- Gamification enhancements

---

## Questions & Clarifications Needed

1. **CTA Destinations:** Confirmar que `/certifications`, `/seasons` existem?
2. **Analytics DB:** Guardar events na DB ou só em logs?
3. **Badge Behavior:** Show badge logo ao ter actividades novas, ou só após sair do dashboard?
4. **Personalization Threshold:** 40% é bom threshold para primary_engagement?

---

**Phase 3 Status: READY FOR PLANNING**

Todos os tasks definidos, arquitetura clara, timeline estimada.

Próximo: Iniciar Sprint 1 (CTA Personalization)
