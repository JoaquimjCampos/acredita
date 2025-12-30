# Next Steps — Acredita Implementation (2025-12-25)

## Phase 1: Smoke Test & Baseline (Days 1–7)

### Tasks
1. **Backend readiness**
   - [ ] `python manage.py migrate` (ensure analytics app tables created if needed)
   - [ ] `python manage.py runserver` starts without errors
   - [ ] Test endpoints manually:
     - `GET /api/v2/core/me/dashboard/` → returns user metrics
     - `GET /api/v2/core/me/revenue/` → returns aggregated revenue
     - `GET /api/v2/core/me/activity/` → returns recent TrustEvents
     - `POST /api/analytics/events` → logs event to `backend/logs/analytics.log`

2. **Frontend readiness**
   - [ ] `npm install` completes
   - [ ] `npm start` runs; no build errors
   - [ ] Home page renders: hero displays social proof chips with values
   - [ ] Browser console: no unhandled errors
   - [ ] Analytics: inspect network tab for POST to `/api/analytics/events`

3. **Analytics validation**
   - [ ] Click hero CTA → inspect `backend/logs/analytics.log` for `hero-cta-click` event
   - [ ] Click module card → log shows `module-card-clicked` with module ID
   - [ ] Social proof chips visible → `hero-social-proof` events optional (not required to click)
   - [ ] Rate limiting: issue 150+ requests from same IP → backend returns 429

4. **Data flow validation**
   - [ ] Login → core endpoint returns trust/cert/market/kixikila/reality metrics
   - [ ] Activity endpoint returns last 50 TrustEvents
   - [ ] Cache working: second call to `/api/v2/core/me/activity` is faster (or same cached response)

### Success criteria
- No 500 errors in backend logs
- Hero social proof loads within 2 seconds
- All CTA clicks tracked in analytics log
- Rate limit blocks excessive requests

---

## Phase 2: Dashboard Enrichment (Weeks 2–4)

### Tasks
1. **Activity timeline component**
   - [ ] Create `frontend/src/components/ActivityTimeline.tsx` consuming `fetchMeActivity()`
   - [ ] Display last 5–10 recent events (quiz completion, marketplace sale, kixikila cycle, etc.)
   - [ ] Add to dashboard below or alongside "Oportunidades"
   - [ ] Test cache refresh on 5-minute intervals

2. **A/B testing hero layout**
   - [ ] Create hero variant B: add hero image (from assets/) + adjust copy
   - [ ] Toggle via feature flag or query param (`?hero-variant=b`)
   - [ ] Track which variant each user saw in analytics (add `variant` field)
   - [ ] Run for 1–2 weeks; compare `hero-cta-click` conversion rate

3. **CTA personalization (optional)**
   - [ ] Detect user's primary module engagement (highest trust events from kixikila vs cert vs market)
   - [ ] Adjust hero secondary CTA copy: "Explorar Marketplace" vs "Iniciar Certificação" vs "Criar Grupo"
   - [ ] Track segment-specific conversion

4. **Notifications (optional)**
   - [ ] Add activity badge ("3 novas") near dashboard link in hero if recent activity exists
   - [ ] Use `/api/v2/core/me/activity` to detect new events since last visit

### Success criteria
- Activity timeline renders correctly
- Hero A vs B conversion tracked separately
- Personalized CTA copy experiments underway
- Engagement metrics improving (cta clicks / home visits)

---

## Phase 3: Performance & Scale (60–90 days)

### Tasks
1. **Analytics resilience**
   - [ ] Implement client-side event batching (queue events, flush every 5s or on page unload)
   - [ ] Add retry logic for failed analytics POSTs
   - [ ] Test offline scenarios (events queue, then sync when online)

2. **Core endpoint optimization**
   - [ ] Add ETag/conditional GET to `/api/v2/core/me/dashboard` (reduce payload if unchanged)
   - [ ] Profile latency; target <200ms p95
   - [ ] Monitor error rates; add alerts if >1% fail

3. **Season transition**
   - [ ] Update `season.json` with new season metadata (dates, name, etc.)
   - [ ] Archive previous season's data (`backend/logs/`) and TrustEvents
   - [ ] Reset user activity timelines (or retain for historical view)
   - [ ] Test data migration scripts before new season launch

4. **Observability**
   - [ ] Set up dashboard: core endpoint latency, error rate, analytics event volume per source
   - [ ] Log aggregation: centralize `backend/logs/analytics.log` and `backend/logs/acredita.log`
   - [ ] Alerting: page on >5% analytics 401/429 responses or core endpoint >500ms p95

### Success criteria
- Analytics events reliably delivered even offline
- Core endpoints maintain <200ms latency
- Season transition scripts ready and tested
- Dashboard visibility into platform health

---

## Environment setup (.env)

Create `.env` files in `backend/` and `frontend/` roots:

**Backend (`backend/.env`)**
```
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ANALYTICS_RATE_LIMIT_PER_MINUTE=120
ANALYTICS_KEY=your-strong-key-here
```

**Frontend (`.env.local` or `.env.development.local` for CRA)**
```
REACT_APP_API_BASE=http://localhost:8000
REACT_APP_ANALYTICS_KEY=your-strong-key-here
```

Or for Vite:
```
VITE_API_BASE=http://localhost:8000
VITE_ANALYTICS_KEY=your-strong-key-here
```

---

## Quick commands

```powershell
# Backend
Push-Location "C:\apps\Acredita"
& .venv\Scripts\python.exe manage.py migrate
& .venv\Scripts\python.exe manage.py runserver

# Frontend
Push-Location "C:\apps\Acredita\frontend"
npm install
npm start

# Logs
Get-Content "C:\apps\Acredita\backend\logs\analytics.log" -Tail 10
Get-Content "C:\apps\Acredita\backend\logs\acredita.log" -Tail 10
```

---

## Success metrics (to track)

1. **Engagement**
   - Hero CTA CTR (clicks / home visits)
   - Module card clicks by module (% distribution)
   - Featured season CTA conversion

2. **Performance**
   - Core endpoint latency (target <200ms)
   - Analytics events per user per session
   - Homepage load time (target <2s core metrics loaded)

3. **Retention**
   - Auth users returning to dashboard
   - Activity timeline engagement (if implemented)
   - Season-to-season repeat participation

---

## Blocked by / Dependencies

- None currently; all phases are independent and can proceed in parallel
- Baseline analytics from Phase 1 will inform A/B test targets in Phase 2

---

*Updated: 2025-12-25*
