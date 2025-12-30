# Phase 2: Testing & Validation Checklist

**Status: Components Created & Integrated**

---

## Quick Validation (5 minutes)

### ✅ File Integrity Check

```powershell
# All files present and importable
Test-Path "C:\apps\Acredita\frontend\src\components\ActivityTimeline.tsx"  # Should be True
Test-Path "C:\apps\Acredita\frontend\src\components\HeroVariant.tsx"       # Should be True
```

**Result:**
- ✅ ActivityTimeline.tsx exists (181 lines, no syntax errors)
- ✅ HeroVariant.tsx exists (196 lines, no syntax errors)
- ✅ HomePage.tsx imports HeroVariant correctly (line 20)
- ✅ DashboardPage.tsx imports ActivityTimeline correctly (line 7)
- ✅ Backend fix applied to core/views.py (aggregation bug resolved)

---

## Full Testing Protocol

### Phase 1: Backend Validation (10 minutes)

```bash
# Start Django server
cd C:\apps\Acredita
python manage.py runserver

# Test core endpoints in separate terminal
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/v2/core/me/dashboard/
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/v2/core/me/activity/
```

**Expected Responses:**

**Dashboard (no errors):**
```json
{
  "user": { "id": 1, "email": "user@example.com" },
  "trust_total": 150,
  "trust_breakdown": { "kixikila": 50, "marketplace": 100 },
  "reputation": "ACTIVE_MEMBER"
}
```

**Activity (last 10 events):**
```json
{
  "recent_events": [
    {
      "event_type": "kixikila_member",
      "points": 25,
      "created_at": "2025-12-27T12:00:00Z"
    }
  ],
  "total_events": 150
}
```

---

### Phase 2: Frontend Build Validation (5 minutes)

```powershell
# Navigate to frontend
Set-Location C:\apps\Acredita\frontend

# Install dependencies (if not done)
npm install

# Build and check for errors
npm run build
```

**Expected Output:**
```
✓ All entry points compiled successfully
✓ ActivityTimeline.tsx imported in DashboardPage.tsx
✓ HeroVariant.tsx imported in HomePage.tsx
✓ No TypeScript errors
```

---

### Phase 3: Development Server Test (15 minutes)

```powershell
# Start frontend dev server
npm start

# Browser opens at http://localhost:3000
```

#### Test 1: Hero Variant A (Default)

Navigate to: `http://localhost:3000`

**Checklist:**
- [ ] Hero section renders without errors
- [ ] Hero is centered, minimalist layout
- [ ] Single CTA button "Entrar Dashboard"
- [ ] Console shows: `hero-variant-exposed | A`
- [ ] Click CTA → Dashboard loads
- [ ] Console shows: `hero-cta-click | dashboard | A`

#### Test 2: Hero Variant B (Image + Secondary CTA)

Navigate to: `http://localhost:3000?hero-variant=B`

**Checklist:**
- [ ] Hero renders with 2-column layout
- [ ] Left side: gradient + stats pills
- [ ] Right side: illustration placeholder
- [ ] 2 CTAs visible: "Entrar Dashboard" (primary), "Explorar Oportunidades" (secondary)
- [ ] Console shows: `hero-variant-exposed | B`
- [ ] Click primary CTA → Dashboard
- [ ] Click secondary CTA → Marketplace
- [ ] Console shows both `hero-cta-click` events

#### Test 3: ActivityTimeline in Dashboard

Navigate to: `http://localhost:3000/dashboard`

**Checklist:**
- [ ] ActivityTimeline component renders without errors
- [ ] Recent events display with:
  - [ ] Event icon (Users, ShoppingCart, Award, etc.)
  - [ ] Event description ("Juntou-se a Kixikila", "Comprou no Marketplace", etc.)
  - [ ] Relative time ("agora", "5m atrás", "2h atrás", etc.)
  - [ ] Points badge with Zap icon (e.g., "+25 pontos")
- [ ] If > 10 events: "Ver todas (X)" link appears
- [ ] Loading spinner shows while fetching
- [ ] If error: "Não foi possível carregar o histórico" message

#### Test 4: Network Requests

Open **Chrome DevTools** (F12) → **Network** tab

**Expected requests:**

1. **Hero variant exposure:**
   ```
   POST /api/analytics/events
   {
     "name": "hero-variant-exposed",
     "page": "home",
     "label": "A" or "B"
   }
   ```

2. **CTA click:**
   ```
   POST /api/analytics/events
   {
     "name": "hero-cta-click",
     "page": "home",
     "label": "dashboard",
     "value": "A" or "B"
   }
   ```

3. **Activity fetch:**
   ```
   GET /api/v2/core/me/activity/
   Headers: Authorization: Bearer {token}
   ```

---

### Phase 4: Mobile Responsiveness (10 minutes)

**Chrome DevTools** → Toggle device toolbar (Ctrl+Shift+M)

#### Mobile Variant A

**Checklist:**
- [ ] Hero text stacks properly on small screens
- [ ] CTA button full-width or auto-sized
- [ ] No horizontal overflow

#### Mobile Variant B

**Checklist:**
- [ ] Image placeholder responsive
- [ ] 2 CTAs stack vertically on mobile
- [ ] Stats pills display correctly
- [ ] Grid collapses to single column

#### Dashboard Mobile

**Checklist:**
- [ ] ActivityTimeline events display in single column
- [ ] Icons and timestamps visible
- [ ] Points badge doesn't overflow
- [ ] "Ver todas" link accessible

---

## Analytics Validation (Optional)

### Check Backend Logs

```powershell
# Monitor analytics events in real-time
Get-Content -Path "C:\apps\Acredita\backend\logs\analytics.log" -Tail 20 -Wait
```

**Expected pattern:**
```
2025-12-27 12:45:30 | hero-variant-exposed | user_id: 123 | variant: B | timestamp: 2025-12-27T12:45:30Z
2025-12-27 12:45:35 | hero-cta-click | user_id: 123 | label: dashboard | value: B | timestamp: 2025-12-27T12:45:35Z
2025-12-27 12:45:40 | page-load | page: /dashboard | user_id: 123 | timestamp: 2025-12-27T12:45:40Z
```

---

## Common Issues & Troubleshooting

### Issue 1: "ActivityTimeline is not a function"

**Cause:** Component import path incorrect

**Fix:**
```tsx
// Correct
import ActivityTimeline from '../components/ActivityTimeline';

// Check file exists
ls -la frontend/src/components/ActivityTimeline.tsx
```

### Issue 2: "HeroVariant not found"

**Cause:** Import missing or typo

**Fix:**
```tsx
// Ensure in HomePage.tsx line 20
import HeroVariant from '../components/HeroVariant';
```

### Issue 3: trackEvent is undefined

**Cause:** Analytics utility not imported

**Fix:**
```tsx
import { trackEvent } from '../utils/analytics';
```

### Issue 4: API returns 404 for /api/v2/core/me/activity/

**Cause:** Endpoint not registered or backend server not running

**Fix:**
```powershell
# Check Django is running
curl http://localhost:8000/api/v2/core/me/activity/ -H "Authorization: Bearer TOKEN"

# If 404, check urls.py is configured
grep -r "me/activity" backend/
```

### Issue 5: Activity endpoint returns empty

**Cause:** User has no TrustEvents

**Fix:**
```python
# Create test events in Django shell
python manage.py shell
>>> from accounts.models import User
>>> from core.models import TrustEvent
>>> user = User.objects.first()
>>> TrustEvent.objects.create(
...     user=user,
...     event_type='kixikila_member',
...     points=25,
...     description='Juntou-se a Kixikila'
... )
>>> # Exit and refresh
```

---

## Sign-Off Checklist

### Functional Requirements
- [ ] ActivityTimeline displays recent events
- [ ] HeroVariant supports both A and B variants
- [ ] Query param `?hero-variant=B` forces variant B
- [ ] All trackEvent calls fire without errors
- [ ] Dashboard and HomePage integrate components

### Non-Functional Requirements
- [ ] No console errors (F12 → Console)
- [ ] Network requests complete < 1s
- [ ] Mobile responsive on all breakpoints
- [ ] Analytics events logged to backend

### Documentation
- [ ] PHASE2_IMPLEMENTATION.md completed
- [ ] Testing results documented
- [ ] Known issues logged (if any)

---

## Next Steps After Validation

1. **Deploy to Staging** (if all checks pass)
   ```bash
   git add .
   git commit -m "feat: Phase 2 - ActivityTimeline & HeroVariant A/B testing"
   git push origin main
   ```

2. **Run A/B Test** (collect 1–2 weeks of data)
   - Monitor CTR by variant
   - Track conversion rates
   - Analyze ActivityTimeline engagement

3. **Implement Phase 3** (CTA personalization, notifications)
   - Detect primary module engagement
   - Add "X novas" badge to dashboard link
   - Advanced rollout strategies

---

**Estimated Time to Complete All Tests:** 45 minutes

**Completed By:** December 27, 2025
