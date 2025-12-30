# 🚀 Quick Start — Acredita (PowerShell Compatible)

**Date: December 25, 2025 | Ready for Smoke Testing**

---

## Setup (5 min)

```powershell
# Copy environment templates
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local

# Edit both .env files with your values
notepad backend\.env
notepad frontend\.env.local
```

**Required values:**
- `backend/.env`: `ANALYTICS_KEY=your-key`, `SECRET_KEY=your-key`
- `frontend/.env.local`: `REACT_APP_API_BASE=http://localhost:8000`, `REACT_APP_ANALYTICS_KEY=your-key`

---

## Run Backend (Terminal 1)

```powershell
cd C:\apps\Acredita

# Activate virtual environment
& .venv\Scripts\Activate.ps1

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver

# Expected output:
# Starting development server at http://127.0.0.1:8000/
# Quit the server with CTRL-BREAK.
```

---

## Run Frontend (Terminal 2)

```powershell
cd C:\apps\Acredita\frontend

# Install dependencies
npm install

# Start dev server
npm start

# Expected output:
# Compiled successfully
# Browser opens to http://localhost:3000
```

---

## Verify Everything Works (Browser)

1. **Open**: http://localhost:3000
2. **Look for**:
   - ✅ Hero section renders
   - ✅ Social proof chips visible (or skeleton loading)
   - ✅ 3 modules display
   - ✅ Featured season appears
   - ✅ No red errors in console (F12)

3. **Test tracking**:
   - Click hero CTA
   - Check DevTools → Network tab
   - Look for POST to `/api/analytics/events` (should be 204)
   - Check `backend/logs/analytics.log` for event entry

---

## Smoke Test Protocol (25 min)

Follow **docs/SMOKE_TEST_READY.md** for comprehensive testing:

```powershell
# Terminal 3: Monitor analytics log
Get-Content -Path "C:\apps\Acredita\backend\logs\analytics.log" -Wait
```

---

## Common Issues

### Backend won't start
```powershell
# Try migrations again
python manage.py migrate

# Check Python version
python --version  # Should be 3.8+
```

### Frontend won't compile
```powershell
# Clean reinstall
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install
npm start
```

### Analytics not logging
```powershell
# Verify log directory exists
Test-Path C:\apps\Acredita\backend\logs

# Create if missing
New-Item -Type Directory C:\apps\Acredita\backend\logs -Force
```

---

## Phase 2: Activity Timeline & A/B Testing (NEW)

Phase 2 is **complete and ready for validation**. New features:

### 🆕 ActivityTimeline Component
- Displays recent user activity (TrustEvents) in dashboard
- Cached server-side for 5 minutes
- Event icons, timestamps, points badges

**Test it:**
```
1. Login and go to /dashboard
2. Verify ActivityTimeline appears with recent events
3. Check "Ver todas (X)" if > 10 events
4. Verify relative timestamps: "agora", "5m atrás", etc.
```

### 🆕 HeroVariant Component (A/B Testing)
- Variant A: Minimalist (default)
- Variant B: Image + 2 CTAs

**Test variants:**
```
# Variant A (default)
http://localhost:3000

# Variant B (image + secondary CTA)
http://localhost:3000?hero-variant=B

# Check console for:
hero-variant-exposed | variant: A or B
hero-cta-click | dashboard | A or B
```

### 📊 Analytics Instrumentation
Events tracked:
- `hero-variant-exposed` — Which variant user sees
- `hero-cta-click` — CTA interaction
- Dashboard page load

Check logs:
```powershell
Get-Content -Path "C:\apps\Acredita\backend\logs\analytics.log" -Wait
```

---

## Next Steps

1. ✅ Run backend + frontend
2. ✅ Verify homepage renders
3. ✅ **NEW:** Test both hero variants (`?hero-variant=A` and `?hero-variant=B`)
4. ✅ **NEW:** Verify ActivityTimeline in dashboard
5. ✅ Check DevTools for analytics events
6. ✅ Monitor `backend/logs/analytics.log`
7. ✅ Follow Phase 2 checklist (docs/PHASE2_TESTING_CHECKLIST.md)

---

## Phase 2 Documentation

- **Summary:** `docs/PHASE2_SUMMARY.md` — Complete overview
- **Implementation:** `docs/PHASE2_IMPLEMENTATION.md` — Technical details + A/B setup
- **Testing:** `docs/PHASE2_TESTING_CHECKLIST.md` — Step-by-step validation

---

**Phase 2 Status: ✅ READY FOR DEPLOYMENT**
