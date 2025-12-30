# Phase 3: Next Steps - Action Plan
**December 27, 2025 | Sprint 2 Action Items**

---

## 🎯 Immediate Tasks (Next 2 Hours)

### Task 1: Find Navigation Component Location
```bash
# Search for navigation component
grep -r "Dashboard" frontend/src/components/layout --include="*.tsx"

# Likely locations:
# - frontend/src/components/layout/Navigation.tsx
# - frontend/src/components/layout/Header.tsx
# - frontend/src/components/layout/Sidebar.tsx
```

### Task 2: Update Navigation Component

**Add imports:**
```tsx
import ActivityBadge from '../ActivityBadge';
import { useActivityNotification } from '../../hooks/useActivityNotification';
```

**In navigation render:**
```tsx
// Find the Dashboard link and add:
<a href="/dashboard" className="relative">
  Dashboard
  <ActivityBadge count={unreadCount} className="ml-2" />
</a>

// Add this to component:
const { unreadCount } = useActivityNotification(
  getTotalActivityCount() // from useCoreDashboard
);
```

### Task 3: Test Navigation Update

```bash
# 1. Start frontend
npm start

# 2. In browser DevTools console:
localStorage.setItem('last_activity_count', '5');
localStorage.setItem('last_activity_check', new Date().getTime().toString());

# 3. Refresh page
# 4. Verify badge shows in navigation

# 5. Go to /dashboard
# 6. Verify badge clears
```

---

## 📋 Sprint 2 Completion Checklist

- [ ] Navigation component located
- [ ] ActivityBadge imported in Navigation
- [ ] useActivityNotification imported
- [ ] Badge displays in navigation
- [ ] Badge count updates correctly
- [ ] Badge clears on dashboard visit
- [ ] No TypeScript errors
- [ ] Mobile responsive

---

## 📌 Files to Modify (Sprint 2)

| File | Action | Priority |
|------|--------|----------|
| Navigation component | Add ActivityBadge + hook | HIGH |
| analytics.ts | Enrich event payloads (Sprint 3) | MEDIUM |
| core/views.py | Add event logging endpoint (Sprint 3) | MEDIUM |

---

## 🧪 Quick Testing (After Updates)

```bash
# Terminal 1: Backend
cd C:\apps\Acredita
python manage.py runserver

# Terminal 2: Frontend
cd frontend
npm start

# Browser:
# 1. Go to http://localhost:3000
# 2. Login
# 3. Check for badge in navigation
# 4. Go to /dashboard
# 5. Check badge clears
# 6. Open DevTools (F12) Console
# 7. Check localStorage values
```

---

## 📊 Sprint 2 vs Sprint 3

### Sprint 2 (Today/Tomorrow)
✅ CTA Personalization complete  
🔄 Activity Notifications 75% complete  
- [ ] Navigation component update

### Sprint 3 (Tomorrow/Next)
- [ ] Enrich analytics event payloads
- [ ] Backend logging validation
- [ ] Data quality testing

---

## 📈 After Phase 3 Complete

**Ready for:**
1. Production deployment
2. 2-week A/B testing period
3. Phase 4: Advanced analytics

**Metrics to track:**
- CTR by variant + personalization
- Badge engagement rates
- Dashboard visit frequency
- Conversion by engagement type

---

## 🚀 Quick Summary

**Current Status:**
- Phase 3 Sprint 1 ✅ DONE
- Phase 3 Sprint 2 🔄 95% DONE (1 file to update)
- Phase 3 Sprint 3 ⏳ READY TO START

**Next 2 Hours:**
1. Update Navigation component
2. Test badge behavior
3. Verify no errors

**Then (Sprint 3):**
1. Enrich analytics events
2. Validate backend logging
3. Final testing

**Then (Deployment):**
1. Code review
2. Deploy to staging
3. Monitor metrics

---

**Continue with Task 1: Finding Navigation Component**
