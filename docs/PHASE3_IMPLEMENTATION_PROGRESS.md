# Phase 3: Implementation Guide
**Date: December 27, 2025 | Status: Sprint 1 Complete**

---

## ✅ Completed (Sprint 1: CTA Personalization)

### Files Created

1. **useUserEngagement.ts** (45 lines)
   - Location: `frontend/src/hooks/useUserEngagement.ts`
   - Purpose: Extract primary engagement module from trust_breakdown
   - Returns: `{ primary_engagement, engagement_breakdown, primary_percentage }`
   - Dependencies: useCoreDashboard

2. **useCTAPersonalization.ts** (50 lines)
   - Location: `frontend/src/hooks/useCTAPersonalization.ts`
   - Purpose: Map primary engagement to personalized CTA
   - Returns: `{ label, path, icon, color, description, module }`
   - Maps:
     - kixikila → "Iniciar Certificação" → /certifications
     - marketplace → "Explorar Marketplace" → /marketplace
     - seasons → "Juntar-se à Temporada" → /seasons
     - games → "Jogar Agora" → /games

3. **ActivityBadge.tsx** (38 lines)
   - Location: `frontend/src/components/ActivityBadge.tsx`
   - Purpose: Display notification badge for unread activities
   - Props: `{ count: number, className?: string, showZero?: boolean }`
   - Features: Shows "99+" if count > 99, hides if count === 0

### Files Modified

1. **HeroVariant.tsx** (Enhanced)
   - Added imports: useUserEngagement, useCTAPersonalization
   - Added personalization logic: Secondary CTA now uses personalized label
   - Enhanced tracking: `primary_engagement`, `engagement_percentage` in events
   - Icon support: Dynamic icon for personalized CTA

---

## 🔄 In Progress (Sprint 2: Activity Notifications)

### Files Created

1. **useActivityNotification.ts** (NEW)
   - Location: `frontend/src/hooks/useActivityNotification.ts`
   - Purpose: Manage activity notification state via localStorage
   - localStorage keys:
     - `last_activity_check` — ISO timestamp
     - `last_activity_count` — Total event count
   - Returns: `{ unreadCount, hasNewActivity, lastCheckTime, lastEventCount, markAsRead }`

### Files to Modify

1. **DashboardPage.tsx** (IN PROGRESS)
   - Added: useActivityNotification import
   - Added: markAsRead() call on component mount
   - Effect: Clears badge when user views dashboard

---

## 📋 Next Steps (Sprint 2 Completion)

### 1. Update Navigation/Layout Component
```tsx
// frontend/src/components/layout/Navigation.tsx (or similar)

import ActivityBadge from '../ActivityBadge';
import { useActivityNotification } from '../../hooks/useActivityNotification';

const Navigation = () => {
  const { unreadCount } = useActivityNotification(getTotalEventCount());
  
  return (
    <nav>
      {/* ... other items ... */}
      <a href="/dashboard" className="relative">
        Dashboard
        <ActivityBadge count={unreadCount} className="ml-2" />
      </a>
    </nav>
  );
};
```

### 2. Test Local Setup
```bash
# In browser:
# 1. Go to http://localhost:3000/dashboard
# 2. Navigate away
# 3. Badge should show "X novas"
# 4. Go back to dashboard
# 5. Badge should disappear
```

### 3. Enrich Analytics Events
Update `utils/analytics.ts` to include:
```tsx
- personalized: boolean (was CTA customized?)
- primary_engagement: string (which module user engages most)
- engagement_percentage: number (% of total engagement)
- cta_type: 'primary' | 'secondary'
```

---

## Testing Checklist Phase 3

### Sprint 1: CTA Personalization ✅

- [x] useUserEngagement hook created
- [x] useCTAPersonalization hook created
- [x] HeroVariant updated with personalization
- [x] Secondary CTA shows personalized label
- [x] Analytics events track personalization
- [ ] Test with different user engagement profiles
- [ ] Verify correct CTA label displays
- [ ] Confirm navigation to correct path

### Sprint 2: Activity Notifications ⏳

- [ ] useActivityNotification hook created
- [ ] ActivityBadge component created
- [ ] DashboardPage marks activity as read
- [ ] Badge shows correct count
- [ ] localStorage updates on badge clear
- [ ] Badge appears/disappears correctly
- [ ] Badge works across page navigation

### Sprint 3: Analytics & Testing (PENDING)

- [ ] Enhanced event payloads sent
- [ ] Backend logs all events with personalization data
- [ ] Query dashboard for personalization metrics
- [ ] Verify data quality > 99%

---

## Quick Start Testing Phase 3

### Test CTA Personalization

```bash
# 1. Login with user who has high kixikila engagement
cd C:\apps\Acredita\frontend
npm start

# 2. Go to http://localhost:3000?hero-variant=B
# Expected: Secondary CTA shows "Iniciar Certificação" (or relevant)

# 3. Open DevTools (F12) → Network
# 4. Click secondary CTA
# 5. Check POST to /api/analytics/events
# Expected payload:
{
  "name": "hero-cta-click",
  "cta_type": "secondary",
  "label": "Iniciar Certificação",
  "primary_engagement": "kixikila",
  "personalized": true,
  "engagement_percentage": 65
}
```

### Test Activity Badge

```bash
# 1. Login to dashboard
# 2. Check if badge appears in navigation (if events exist)
# 3. Navigate away (e.g., to home page)
# 4. Simulate new activity (backend: add TrustEvent to user)
# Expected: Badge updates with count
# 5. Go back to /dashboard
# Expected: Badge clears (markAsRead fired)
```

---

## File Structure Phase 3

```
frontend/src/
├── hooks/
│   ├── useUserEngagement.ts          (NEW)
│   ├── useCTAPersonalization.ts      (NEW)
│   ├── useActivityNotification.ts    (NEW)
│   └── ...
├── components/
│   ├── HeroVariant.tsx               (UPDATED)
│   ├── ActivityBadge.tsx             (NEW)
│   └── ...
├── pages/
│   └── DashboardPage.tsx             (UPDATED)
└── ...
```

---

## Analytics Events Phase 3

### Enriched Event Structure

```json
{
  "name": "hero-cta-click",
  "page": "home",
  "cta_type": "primary|secondary",
  "label": "Iniciar Certificação|Explorar Marketplace|Juntar-se à Temporada|Jogar Agora",
  "variant": "A|B",
  "primary_engagement": "kixikila|marketplace|seasons|games",
  "personalized": true|false,
  "engagement_percentage": 65,
  "timestamp": "2025-12-27T..."
}
```

### New Events (for tracking)

```
- activity-view-start: When user opens dashboard
- activity-view-end: When user leaves dashboard
- activity-event-expand: When user clicks event detail
- badge-clear: When badge is marked as read
```

---

## Success Metrics Phase 3

| Metric | Target | Method |
|--------|--------|--------|
| Personalized CTA CTR | +15% vs generic | A/B test compare |
| Badge engagement | 60%+ users | Dashboard analytics |
| Event data quality | 99%+ complete | Check logs |
| Performance (hooks) | < 100ms | DevTools profiler |

---

## Known Limitations Phase 3

1. **No ML-based prediction**
   - Currently: Rule-based thresholds (40%)
   - Future: ML model to predict preferred module

2. **No cross-device sync**
   - localStorage is device-specific
   - Future: Sync with backend user preferences

3. **No time-based personalization**
   - Currently: Static per user
   - Future: "Time to checkout" variant

---

## Deployment Checklist Phase 3

Before deploying Phase 3:

- [ ] All hooks created and tested
- [ ] HeroVariant updated with personalization
- [ ] DashboardPage marks activity as read
- [ ] ActivityBadge component functional
- [ ] No TypeScript errors
- [ ] Analytics events enriched correctly
- [ ] localStorage keys named consistently
- [ ] Testing checklist passed
- [ ] Code review completed

---

## Timeline Phase 3

| Sprint | Task | Status | ETA |
|--------|------|--------|-----|
| 1 | CTA Personalization | ✅ Complete | Dec 27 |
| 2 | Activity Notifications | 🔄 In Progress | Dec 28 |
| 3 | Analytics Enrichment | ⏳ Pending | Dec 29-30 |
| Integration | Full Phase 3 test | ⏳ Pending | Dec 31 |

---

## Next Action

**Continue Sprint 2:**

1. Finalize useActivityNotification hook
2. Update Navigation component to show ActivityBadge
3. Test badge with mock activity data
4. Then move to Sprint 3: Analytics enrichment

---

**Phase 3 Progress: 40% Complete**  
**Next: Sprint 2 Completion (Activity Notifications)**
