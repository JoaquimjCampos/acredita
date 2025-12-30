# Phase 3 Sprint 3: Analytics Enrichment - Action Plan
**December 27-28, 2025 | Final Sprint**

---

## 🎯 Sprint 3 Objective

Enrich analytics events com dados de personalização para melhor medição de impacto Phase 3.

---

## 📋 Tasks (3 Total)

### Task 1: Enrich Analytics Event Payloads ⏳

**File:** `frontend/src/utils/analytics.ts`

**Current Payload:**
```json
{
  "name": "hero-cta-click",
  "page": "home",
  "label": "dashboard",
  "timestamp": "..."
}
```

**New Payload (enhanced):**
```json
{
  "name": "hero-cta-click",
  "page": "home",
  "cta_type": "primary|secondary",
  "label": "Iniciar Certificação|Explorar Marketplace|...",
  "variant": "A|B",
  "primary_engagement": "kixikila|marketplace|seasons|games",
  "engagement_percentage": 65,
  "personalized": true,
  "timestamp": "...",
  "user_id": "123"
}
```

**Implementation:**
```tsx
// frontend/src/utils/analytics.ts

interface AnalyticsEvent {
  name: string;
  page?: string;
  variant?: string;
  cta_type?: 'primary' | 'secondary';
  label?: string;
  primary_engagement?: string;
  engagement_percentage?: number;
  personalized?: boolean;
  [key: string]: any;
}

export const trackEvent = (event: AnalyticsEvent) => {
  const enriched = {
    ...event,
    timestamp: new Date().toISOString(),
    user_id: getCurrentUserId(), // from AuthContext
  };

  fetch('/api/analytics/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(enriched),
  }).catch(err => console.error('Analytics error:', err));
};
```

---

### Task 2: Backend Analytics Endpoint Validation ⏳

**File:** `backend/core/views.py` or `backend/core/views_analytics.py`

**Check:**
1. Endpoint exists: `/api/analytics/events`
2. Method: POST
3. Permission: IsAuthenticated
4. Response: 204 No Content

**Implementation (if needed):**
```python
# backend/core/views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import json
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_analytics_event(request):
    """
    Log analytics event with enriched data
    POST /api/analytics/events
    """
    try:
        event = request.data
        event['user_id'] = request.user.id
        event['timestamp'] = timezone.now().isoformat()
        
        # Log to file
        logger.info(json.dumps(event))
        
        # Optional: Save to DB
        # AnalyticsEvent.objects.create(**event)
        
        return Response({'status': 'logged'}, status=204)
    except Exception as e:
        logger.error(f'Analytics error: {str(e)}')
        return Response({'error': str(e)}, status=400)
```

**Register in urls.py:**
```python
# backend/core/urls.py

urlpatterns = [
    # ... existing endpoints ...
    path('analytics/events/', views.log_analytics_event, name='analytics-events'),
]
```

---

### Task 3: Data Quality Testing ⏳

**Test 1: HeroVariant Event Payload**
```bash
# Browser console:
# 1. Click hero CTA
# 2. Check Network tab → POST to /api/analytics/events
# 3. Verify payload contains:
#   - variant: "A" or "B"
#   - primary_engagement: module name
#   - engagement_percentage: number
#   - personalized: true/false
#   - cta_type: "primary" or "secondary"
```

**Test 2: Multiple Events**
```bash
# Test different scenarios:
# 1. Variant A → Primary CTA (personalized: false)
# 2. Variant B → Secondary CTA (personalized: true)
# 3. Different users with different primary_engagement
# 4. Verify all events logged correctly
```

**Test 3: Data in Backend**
```bash
# Check logs:
tail -f backend/logs/analytics.log

# Look for enriched events:
# 2025-12-28 ... {"name": "hero-cta-click", "variant": "B", "primary_engagement": "marketplace", ...}
```

---

## 🔧 Implementation Steps

### Step 1: Update analytics.ts (15 min)
1. Open `frontend/src/utils/analytics.ts`
2. Update interface with new fields
3. Add enrichment logic in trackEvent
4. Test in browser console

### Step 2: Verify Backend (15 min)
1. Check if `/api/analytics/events` exists
2. If missing, add endpoint to views.py
3. Register in urls.py
4. Test with curl

### Step 3: Integration Testing (20 min)
1. Test HeroVariant with Variant A & B
2. Verify payloads in Network tab
3. Check backend logs
4. Validate all events logged

### Step 4: Documentation (10 min)
1. Update PHASE3 docs with results
2. Document event schema
3. Note any data quality issues
4. Plan Phase 4 next steps

---

## 📊 Event Schema

**All Events Should Have:**
```json
{
  "name": "event-name",
  "timestamp": "2025-12-28T...",
  "user_id": 123,
  "page": "home|dashboard|...",
  "variant": "A|B",
  "primary_engagement": "module",
  "engagement_percentage": 65,
  "personalized": true|false
}
```

**Hero Events Specific:**
```json
{
  "name": "hero-cta-click",
  "cta_type": "primary|secondary",
  "label": "Entrar Dashboard|Iniciar Certificação|...",
  "module": "kixikila|marketplace|seasons|games"
}
```

**Activity Events Specific:**
```json
{
  "name": "activity-view-start|activity-view-end|activity-event-expand",
  "unread_count": 5,
  "total_events": 150
}
```

---

## ✅ Completion Criteria

- [ ] analytics.ts updated with enrichment
- [ ] Backend endpoint exists
- [ ] Endpoint properly registered
- [ ] Events logged to backend/logs/analytics.log
- [ ] Payload validation passing
- [ ] Data quality > 99%
- [ ] No TypeScript errors
- [ ] All tests passing
- [ ] Documentation updated

---

## 🧪 Quick Testing Checklist

```bash
# Terminal 1: Backend
python manage.py runserver

# Terminal 2: Frontend
npm start

# Browser:
□ Go to http://localhost:3000?hero-variant=B
□ Open DevTools (F12) → Network
□ Click "Iniciar Certificação" button
□ Verify POST request to /api/analytics/events
□ Check payload in request body:
  - variant: "B"
  - primary_engagement: "kixikila" (or other)
  - personalized: true
  - cta_type: "secondary"
□ Response should be 204

# Backend logs:
□ tail -f backend/logs/analytics.log
□ Should see event entry with full enriched payload
□ Verify timestamp, user_id, variant, etc.
```

---

## 📈 Expected Results

After Sprint 3 complete:
- ✅ All hero CTA clicks tracked with variant + personalization
- ✅ Activity timeline events logged
- ✅ Badge interactions tracked
- ✅ Data quality validated
- ✅ Ready for analysis and A/B testing

---

## 🚀 Phase 3 Final Status

**After Sprint 3 complete:**
- ✅ CTA Personalization (Sprint 1)
- ✅ Activity Notifications (Sprint 2)
- ✅ Analytics Enrichment (Sprint 3)
- **Phase 3 COMPLETE** 🎉

**Ready for:**
- Production deployment
- 2-week A/B testing
- Metrics collection
- Phase 4 planning

---

## Timeline

| Task | Estimated | Status |
|------|-----------|--------|
| Task 1: Enrich analytics.ts | 15 min | ⏳ Pending |
| Task 2: Backend validation | 15 min | ⏳ Pending |
| Task 3: Testing | 20 min | ⏳ Pending |
| Task 4: Documentation | 10 min | ⏳ Pending |
| **Total** | **60 min** | ⏳ |

**ETA Completion:** December 28, 2025 (24 hours)

---

## Next After Sprint 3

1. ✅ Code review (Phase 2 + 3)
2. ✅ Deploy to staging
3. ✅ Run A/B testing (2 weeks)
4. ✅ Analyze metrics
5. ✅ Plan Phase 4

---

**Sprint 3: READY TO START**

Begin with Task 1: Enrich analytics.ts event payloads
