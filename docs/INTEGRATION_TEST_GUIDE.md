# Integration Test Guide — Acredita (2025-12-25)

**Purpose**: Verify all backend, frontend, and analytics components work end-to-end.

**Time Estimate**: 30–45 minutes

---

## Prerequisites

- [ ] Python 3.8+ installed (`python --version`)
- [ ] Node.js 16+ installed (`node --version`)
- [ ] `backend/` has `.env` file with ANALYTICS_KEY set
- [ ] `frontend/` has `.env.local` file with REACT_APP_API_BASE set
- [ ] Virtual environment activated: `. .venv/Scripts/Activate.ps1`

---

## Test Suite 1: Backend Readiness (10 min)

### 1.1 Database & Migrations
```powershell
cd C:\apps\Acredita

# Ensure DB is clean and migrations applied
& .venv\Scripts\python.exe manage.py migrate

# Should see: "Operations to perform: 0" (all applied)
```

**Expected**: Exit code 0, no errors
**Pass/Fail**: ☐ PASS ☐ FAIL

---

### 1.2 Server Startup
```powershell
# Start backend (keep running)
& .venv\Scripts\python.exe manage.py runserver

# In another terminal, test endpoint
powershell -Command {
  Invoke-WebRequest -Uri "http://localhost:8000/api/v2/core/me/dashboard/" `
    -Headers @{"Authorization"="Bearer <token>"} `
    -Method Get
}
```

**Expected**: 
- Server starts without errors
- Endpoint returns 200 (or 401 if not authenticated; that's OK)

**Pass/Fail**: ☐ PASS ☐ FAIL

---

## Test Suite 2: Frontend Readiness (15 min)

### 2.1 Install & Build
```powershell
cd C:\apps\Acredita\frontend

# Clean install
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
npm install

# Should see: "added X packages"
```

**Expected**: Exit code 0, no critical vulnerabilities
**Pass/Fail**: ☐ PASS ☐ FAIL

---

### 2.2 Dev Server Startup
```powershell
# Start frontend (keep running)
npm start

# Should see: "Compiled successfully" or "webpack compiled"
# Browser should open to http://localhost:3000
```

**Expected**: 
- Dev server starts without errors
- Browser opens homepage
- No console errors (check DevTools)

**Pass/Fail**: ☐ PASS ☐ FAIL

---

## Test Suite 3: Frontend Rendering (5 min)

### 3.1 Homepage Visual Check
In browser (http://localhost:3000):

```
Expected elements visible:
☐ Hero section with heading ("Entrar no Seu Dashboard" or "Comece Agora")
☐ Hero primary CTA button (clickable)
☐ Social proof chips (trust score, cycles, marketplace sales)
  └─ Can show skeleton loading while fetching
☐ Auth quick summary (4 cards)
☐ 3 module grid (Kixikila, Marketplace, Certifications)
☐ Featured season highlight
☐ Final CTA section
```

**Pass/Fail**: ☐ PASS ☐ FAIL

---

### 3.2 Browser Console Check
Open DevTools (F12) → Console tab:

```
Expected:
☐ No uncaught errors (red messages)
☐ No 404s for assets (check Network tab)
☐ Optional: See trackEvent calls (network POST to /api/analytics/events)

Acceptable warnings:
✓ React mode warnings (dev only)
✓ Tailwind warnings (expected)
```

**Pass/Fail**: ☐ PASS ☐ FAIL

---

## Test Suite 4: Analytics Instrumentation (10 min)

### 4.1 Verify POST Endpoint
Open DevTools → Network tab:

```powershell
# In terminal, POST a test event
Invoke-WebRequest -Uri "http://localhost:8000/api/analytics/events" `
  -Method Post `
  -Headers @{
    "Content-Type"="application/json"
    "X-Analytics-Key"="your-key-here"
  } `
  -Body '{"name":"test-event","page":"test","label":"test-label"}'
```

**Expected**: 204 No Content response
**Pass/Fail**: ☐ PASS ☐ FAIL

---

### 4.2 Verify Logging
```powershell
# Check analytics log
Get-Content -Path "C:\apps\Acredita\backend\logs\analytics.log" -Tail 5

# Should see recent event entries with timestamp, IP, event name
```

**Expected**: Event logged with format: `[timestamp] event_name from IP X.X.X.X`
**Pass/Fail**: ☐ PASS ☐ FAIL

---

### 4.3 Frontend Event Tracking
In browser console:

```javascript
// Manually test trackEvent (if exported)
// Or: Click hero CTA and check Network tab for POST

// Expected Network request:
// POST /api/analytics/events
// Payload: {name: "hero-cta-click", page: "home", label: "dashboard"}
// Response: 204 No Content
```

**Expected**: 
- POST appears in Network tab
- Response is 204
- Event appears in backend logs

**Pass/Fail**: ☐ PASS ☐ FAIL

---

### 4.4 Rate Limiting
```powershell
# Send 150+ requests to verify rate limiting
for ($i = 1; $i -le 150; $i++) {
  Invoke-WebRequest -Uri "http://localhost:8000/api/analytics/events" `
    -Method Post `
    -Headers @{
      "Content-Type"="application/json"
      "X-Analytics-Key"="your-key-here"
    } `
    -Body '{"name":"rate-test","page":"test"}' `
    -ErrorAction SilentlyContinue | % StatusCode | Out-Null
}

# Last few should return 429 (Too Many Requests)
```

**Expected**: 
- First 120 requests: 204
- Requests 121+: 429 Too Many Requests

**Pass/Fail**: ☐ PASS ☐ FAIL

---

## Test Suite 5: Core Endpoints (5 min)

### 5.1 Dashboard Endpoint
```powershell
# Get user dashboard (requires authentication)
Invoke-WebRequest -Uri "http://localhost:8000/api/v2/core/me/dashboard/" `
  -Headers @{"Authorization"="Bearer <token>"} `
  -Method Get

# Expected response:
# {
#   "trust": {"score": X, "breakdown": {...}},
#   "certifications": {...},
#   "marketplace": {...},
#   "kixikila": {...},
#   "seasons": [...]
# }
```

**Expected**: 200 OK with JSON response
**Pass/Fail**: ☐ PASS ☐ FAIL

---

### 5.2 Activity Endpoint
```powershell
# Get recent activity (requires authentication)
Invoke-WebRequest -Uri "http://localhost:8000/api/v2/core/me/activity/" `
  -Headers @{"Authorization"="Bearer <token>"} `
  -Method Get

# Expected response:
# {
#   "recent_events": [
#     {"event_type": "kixikila_member", "points": 10, "created_at": "..."},
#     ...
#   ],
#   "total_events": 50
# }
```

**Expected**: 200 OK with activity data (or empty array if no events)
**Pass/Fail**: ☐ PASS ☐ FAIL

---

## Test Suite 6: Integration Flow (5 min)

### 6.1 Full User Journey
```
1. Open http://localhost:3000 (homepage should load)
2. Observe social proof chips loading
3. Click hero CTA
   → Verify NetworkTab shows POST to /api/analytics/events (204)
   → Verify backend logs show event
4. If logged in: Go to dashboard
   → Verify stats cards show values
   → Verify oportunidades and trust breakdown display
```

**Expected**: All steps complete without errors
**Pass/Fail**: ☐ PASS ☐ FAIL

---

### 6.2 Performance Check
In DevTools → Performance tab:

```
Measure home page load:
☐ First Contentful Paint (FCP): <2s
☐ Largest Contentful Paint (LCP): <3s
☐ Total JS parsed: <200ms
☐ Social proof load: <2s (with skeleton shown initially)
```

**Expected**: All metrics within targets
**Pass/Fail**: ☐ PASS ☐ FAIL

---

## Troubleshooting Matrix

| Issue | Solution |
|-------|----------|
| Backend won't start | `manage.py migrate` → Check `.env` file |
| Frontend won't compile | Remove `node_modules`, `npm install` again |
| 404 on /api/analytics/events | Check `backend/acredita_backend/urls.py` includes analytics app |
| Events not logging | Check `backend/logs/` exists and is writable |
| Rate limit not working | Verify LocMemCache in settings.py |
| Social proof shows skeleton forever | Check auth token, core endpoint responding |

---

## Sign-Off Checklist

```
Test Suite 1 (Backend): ☐ PASS
Test Suite 2 (Frontend): ☐ PASS
Test Suite 3 (Rendering): ☐ PASS
Test Suite 4 (Analytics): ☐ PASS
Test Suite 5 (Endpoints): ☐ PASS
Test Suite 6 (Integration): ☐ PASS

All systems ready for smoke testing: ☐ YES
```

---

## Next Steps (if all pass)

1. **Collect baseline**: Run for 1–2 weeks, monitor analytics volume & patterns
2. **Analyze data**: Review dashboard CTR, module engagement, featured season conversion
3. **Phase 2**: Implement activity timeline, A/B test hero variants
4. **Phase 3**: Scale optimizations (event batching, Redis rate limiting, observability)

---

## Contact / Questions

- Technical: Review `docs/IMPLEMENTATION_SUMMARY.md`
- Roadmap: Review `docs/NEXT_STEPS.md`
- Validation: Review `docs/VALIDATION_CHECKLIST.md`

---

**Last updated: 2025-12-25 | Integration test ready**
