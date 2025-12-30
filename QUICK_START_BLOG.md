# ⚡ QUICK START - Blog RBAC Testing (10 minutes)

## 🎯 Goal
Verify the Blog RBAC system is working end-to-end in 10 minutes.

---

## Step 1: Start Django Server (1 min)

```powershell
cd C:\apps\Acredita
python manage.py runserver
```

**Expected Output**:
```
System check identified no issues (0 silenced).
Starting development server at http://127.0.0.1:8000/
```

Keep this terminal open! ✅

---

## Step 2: Verify Blog Admin (2 min)

In browser, go to:
```
http://localhost:8000/admin/
```

**Login with**:
- Username: `test_admin`
- Password: `Test123!@#` (or your admin password)

**Once logged in**, go to:
```
http://localhost:8000/admin/blog/
```

You should see 3 sections:
- ✅ Blog categories
- ✅ Blog post categories  
- ✅ Blog posts

This verifies **Admin interface is working**. ✅

---

## Step 3: Create a Test Blog Post (2 min)

1. Click "**Blog posts**" in admin
2. Click "**Add Blog post**" (top right)
3. Fill in:
   - **Title**: "My First Blog Post"
   - **Slug**: "my-first-blog-post" (auto-fills)
   - **Content**: "This is test content for the blog post."
   - **Status**: "Draft"
   - **Meta description**: "Test blog post"
4. Click "**SAVE**"

You should see the post listed. ✅

This verifies **Blog models are working**. ✅

---

## Step 4: Test RBAC Permissions (5 min)

Open a **new terminal** window:

```powershell
cd C:\apps\Acredita
python verify_blog_system.py
```

**Expected Output**:
```
[✓] Test 1: Blog Models Exist
[✓] Test 2: Blog Models Registered in Django Admin
[✓] Test 3: RBAC Permission Classes
[✓] Test 4: Role-Based Permission Checks
    ✓ Voter        CANNOT  create blog posts (cannot expected)
    ✓ Participant  CANNOT  create blog posts (cannot expected)
    ✓ Mentor       CAN     create blog posts (can expected)
    ✓ Admin        CAN     create blog posts (can expected)
[✓] Test 5: Blog API Routes Configured

✅ BLOG RBAC SYSTEM VERIFICATION COMPLETE!
```

This verifies **RBAC permissions are working correctly**. ✅

---

## ✅ All Systems Go!

Your Blog RBAC system is **production ready**! ✅

### What You've Just Verified:
1. ✅ Django server running
2. ✅ Blog admin interface functional
3. ✅ Blog models in database
4. ✅ Admin can create blog posts
5. ✅ RBAC permission classes working
6. ✅ Role-based access control enforced:
   - Mentors CAN create
   - Admins CAN create
   - Regular users CANNOT create

---

## 🚀 Next Steps (Optional)

### Option A: Test API Endpoints (5 min)

```powershell
# Get authentication token for mentor
curl -X POST http://localhost:8000/api/accounts/token/ `
  -H "Content-Type: application/json" `
  -d '{"username":"test_mentor","password":"Test123!@#"}'

# List blog posts (with token)
curl -H "Authorization: Bearer <token_here>" `
  http://localhost:8000/api/blog/
```

### Option B: Test with Postman (5 min)

1. Open Postman
2. Import: `docs/Acredita_RBAC_Postman_Collection.json`
3. Set your JWT token in "Authorization" tab
4. Test endpoints:
   - `GET /api/blog/` - List posts
   - `POST /api/blog/` - Create post (try as different roles)

### Option C: View AuditLog (2 min)

```powershell
python manage.py shell
>>> from backend.core.models import AuditLog
>>> AuditLog.objects.all().count()
# Shows how many audit entries were recorded
>>> AuditLog.objects.latest('timestamp')
# Shows most recent action logged
```

---

## 📚 Documentation

For more details, see:
- **Full Guide**: `docs/RBAC_DEPLOYMENT_GUIDE.md`
- **Quick Reference**: `docs/RBAC_QUICK_REFERENCE.md`
- **Blog Implementation**: `docs/BLOG_RBAC_IMPLEMENTATION.md`
- **System Status**: `docs/RBAC_SYSTEM_STATUS_REPORT.md`
- **Next Steps**: `docs/RBAC_NEXT_STEPS.md`

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check for port conflicts
netstat -ano | findstr :8000

# Try different port
python manage.py runserver 8001
```

### Admin won't load
```bash
# Check migrations
python manage.py migrate

# Check database
python manage.py check
```

### Blog models not in admin
```bash
# Verify registration
python test_blog_admin.py
```

### Permission tests fail
```bash
# Check user_type field
python manage.py shell
>>> from backend.accounts.models import User
>>> User.objects.all().values('username', 'user_type')
```

---

**Status**: ✅ Production Ready  
**Last Updated**: December 27, 2025  
**Time to Verify**: ~10 minutes
