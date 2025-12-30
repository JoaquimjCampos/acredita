# 🚀 RBAC System - Production Deployment Guide

## Overview
Complete Role-Based Access Control (RBAC) system for Acredita platform with 4 user roles and comprehensive audit logging.

---

## ✅ Prerequisites Checklist

### Database
- [ ] PostgreSQL installed and running (for production)
- [ ] Database created: `acredita_production`
- [ ] Database user created with appropriate permissions
- [ ] Connection string configured in `.env`

### Python Environment
- [ ] Python 3.10+ installed
- [ ] Virtual environment created
- [ ] All dependencies installed: `pip install -r requirements.txt`

### Django Settings
- [ ] `SECRET_KEY` set in environment variables (never commit!)
- [ ] `DEBUG=False` for production
- [ ] `ALLOWED_HOSTS` configured with production domains
- [ ] `CORS_ALLOWED_ORIGINS` configured
- [ ] `CSRF_TRUSTED_ORIGINS` configured

---

## 📋 Deployment Steps

### Step 1: Environment Configuration

Create `.env` file with production settings:

```env
# Django Settings
SECRET_KEY=your-super-secret-key-here-minimum-50-characters
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/acredita_production

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# JWT Settings (optional - defaults are secure)
JWT_ACCESS_TOKEN_LIFETIME=60  # minutes
JWT_REFRESH_TOKEN_LIFETIME=10080  # 7 days in minutes

# Email (for notifications)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@domain.com
EMAIL_HOST_PASSWORD=your-app-password

# Celery (optional - for async tasks)
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### Step 2: Database Migrations

```bash
# Apply all migrations
python manage.py migrate

# Verify migrations
python manage.py showmigrations
```

### Step 3: Setup RBAC Permissions

```bash
# Create groups and assign permissions
python manage.py setup_rbac_permissions

# Expected output:
# ✓ Grupos criados: Eleitor, Participante, Mentor, Administrador
# ✓ Permissões atribuídas a cada grupo
# ✅ Setup de RBAC completado com sucesso!
```

### Step 4: Create Superuser

```bash
python manage.py createsuperuser

# Enter:
# - Username: admin
# - Email: admin@yourdomain.com
# - Password: (strong password)
```

### Step 5: Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### Step 6: Verify System

```bash
# Run system check
python manage.py check --deploy

# Should show no critical issues
```

### Step 7: Start Services

#### Development/Staging
```bash
python manage.py runserver 0.0.0.0:8000
```

#### Production (with Gunicorn)
```bash
gunicorn backend.acredita_backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --timeout 120 \
    --access-logfile logs/access.log \
    --error-logfile logs/error.log \
    --log-level info
```

---

## 🔐 RBAC System Components

### 1. User Roles (4 Groups)

| Role | Group Name | Permissions | Purpose |
|------|------------|-------------|---------|
| **Eleitor** | `Eleitor` | 3 permissions | Basic voting rights |
| **Participante** | `Participante` | 5 permissions | Content creation, marketplace |
| **Mentor** | `Mentor` | 4 permissions | Teaching, content moderation |
| **Administrador** | `Administrador` | 268 permissions | Full system access |

### 2. Permission Classes (15 Total)

#### Role-Based Permissions
- `IsParticipant` - User must be in Participante group
- `IsMentor` - User must be in Mentor group
- `IsVoter` - User must be in Eleitor group
- `IsAdminUser` - User must be staff/admin

#### Action-Based Permissions
- `CanCreateKixikila` - Create games (Participante+)
- `CanCreateMarketplaceListing` - Create marketplace listings (Participante+)
- `CanCreateCertificationCourse` - Create courses (Mentor+)
- `CanCreateBlogPost` - Create blog posts (Mentor+)
- `CanPublishContent` - Publish content (Mentor+)
- `CanModerateContent` - Moderate content (Mentor+)

#### Ownership-Based Permissions
- `IsOwnerOrAdmin` - Owner or admin can access
- `IsOwnerOrReadOnly` - Owner can edit, others read-only
- `IsAdminOrReadOnly` - Admin can edit, others read-only
- `ParticipantOrAdmin` - Participante or Admin
- `MentorOrAdmin` - Mentor or Admin

### 3. Refactored ViewSets (3)

#### BlogPostViewSet
- **GET**: All authenticated users
- **POST**: `CanCreateBlogPost` (Mentor+)
- **PUT/PATCH**: `IsOwnerOrReadOnly` (owner or read-only)
- **DELETE**: `IsOwnerOrAdmin` (owner or admin)

#### ServiceListingViewSet
- **GET**: All authenticated users
- **POST**: `CanCreateMarketplaceListing` (Participante+)
- **PUT/PATCH**: `IsOwnerOrReadOnly`
- **DELETE**: `IsOwnerOrAdmin`

#### GameViewSet
- **GET**: All authenticated users
- **POST**: `CanCreateKixikila` (Participante+)
- **PUT/PATCH**: `IsOwnerOrReadOnly`
- **DELETE**: `IsOwnerOrAdmin`

### 4. Audit Logging

All ViewSet actions are logged to `AuditLog` model with:
- User performing action
- Action type (create/update/delete)
- Resource affected
- HTTP method & endpoint
- Status code & response status
- User role at time of action
- IP address
- Request data (sanitized)
- Timestamp

Access logs via:
- Django Admin: `/admin/core/auditlog/`
- Log file: `logs/rbac.log`

### 5. Middleware

`RoleValidationMiddleware` runs on every request:
- Validates user role assignment
- Logs access attempts
- Tracks IP addresses
- Position: After `AuthenticationMiddleware` (position 8 of 10)

---

## 🧪 Testing Guide

### Manual Testing with Django Admin

1. **Access Admin Panel**
   ```
   http://yourdomain.com/admin/
   ```

2. **Create Test Users**
   - Navigate to `Users` → `Add user`
   - Create one user for each role
   - Assign to appropriate group

3. **Verify Permissions**
   - Login as each test user
   - Try accessing protected endpoints
   - Verify correct permissions are enforced

### API Testing with Postman

1. **Get JWT Token**
   ```http
   POST /api/accounts/token/
   Content-Type: application/json

   {
     "username": "test_user",
     "password": "password123"
   }
   ```

2. **Test Marketplace (Participante+ only)**
   ```http
   POST /api/marketplace/listings/
   Authorization: Bearer <token>
   Content-Type: application/json

   {
     "title": "Test Service",
     "description": "Description",
     "price": "100.00"
   }
   ```

   - **Eleitor**: Should get 403 Forbidden
   - **Participante**: Should get 201 Created
   - **Mentor**: Should get 201 Created
   - **Admin**: Should get 201 Created

3. **Test Games (Participante+ only)**
   ```http
   POST /api/games/
   Authorization: Bearer <token>
   Content-Type: application/json

   {
     "title": "Test Game",
     "type": "quiz",
     "description": "Test description"
   }
   ```

4. **Verify AuditLog**
   - Check `/admin/core/auditlog/`
   - Should see entries for all API calls
   - Verify user, action, resource logged correctly

### Automated Testing

Run test scripts:
```bash
# Infrastructure tests
python test_rbac_phase4.py

# API endpoint tests (requires running server)
python test_rbac_api.py
```

---

## 📊 Monitoring & Maintenance

### Log Files

All logs stored in `logs/` directory:

```bash
logs/
├── rbac.log         # RBAC permission checks
├── acredita.log     # General application logs
└── analytics.log    # Analytics events
```

### Log Rotation

Configure log rotation (logrotate on Linux):

```bash
/path/to/acredita/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}
```

### Database Maintenance

```bash
# Clean old audit logs (older than 90 days)
python manage.py shell -c "
from django.utils import timezone
from datetime import timedelta
from backend.core.models import AuditLog

cutoff = timezone.now() - timedelta(days=90)
deleted = AuditLog.objects.filter(timestamp__lt=cutoff).delete()
print(f'Deleted {deleted[0]} old audit log entries')
"
```

### Performance Monitoring

Monitor these metrics:
- AuditLog table size (grows with usage)
- API response times
- Permission check overhead
- Middleware execution time

---

## 🔧 Troubleshooting

### Issue: 403 Forbidden on all requests

**Cause**: User not assigned to any group

**Solution**:
```python
from django.contrib.auth.models import Group
from backend.accounts.models import User

user = User.objects.get(username='username')
group = Group.objects.get(name='Participante')
user.groups.add(group)
```

### Issue: Middleware not validating roles

**Cause**: Middleware not in MIDDLEWARE list or wrong position

**Solution**:
Check `settings.py`:
```python
MIDDLEWARE = [
    # ... other middleware ...
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'backend.core.rbac_middleware.RoleValidationMiddleware',  # Must be after Auth
    # ... rest of middleware ...
]
```

### Issue: AuditLog not recording

**Cause**: Logger not configured or log directory missing

**Solution**:
```bash
# Create logs directory
mkdir -p logs

# Check LOGGING configuration in settings.py
# Ensure 'rbac' logger is defined
```

### Issue: Permission denied unexpectedly

**Cause**: Permission class not correctly implemented

**Solution**:
Check ViewSet `get_permissions()` method:
```python
def get_permissions(self):
    if self.action == 'create':
        self.permission_classes = [CanCreateResource]
    return super().get_permissions()
```

---

## 🚨 Security Checklist

- [ ] `DEBUG=False` in production
- [ ] `SECRET_KEY` in environment variable (not in code)
- [ ] HTTPS enabled on production domain
- [ ] CORS origins restricted to production domains
- [ ] CSRF protection enabled
- [ ] SQL injection protection (Django ORM)
- [ ] XSS protection enabled
- [ ] Password validation rules enforced
- [ ] Rate limiting configured (optional)
- [ ] Regular security updates applied

---

## 📚 Additional Resources

### Documentation Files
- `RBAC_PHASE1_COMPLETO.md` - Phase 1 implementation details
- `PHASE2_VIEWSET_REFACTORING_COMPLETE.md` - ViewSet changes
- `PHASE3_SETTINGS_CONFIGURATION.md` - Settings guide
- `SESSION_FINAL_SUMMARY.md` - Complete implementation summary

### Test Files
- `test_rbac_phase4.py` - Infrastructure tests
- `test_rbac_api.py` - API endpoint tests
- `RBAC_PHASE1_NEXT_STEPS.py` - Implementation guide

### Code Locations
- Permission Classes: `backend/core/rbac_permissions.py`
- Middleware: `backend/core/rbac_middleware.py`
- Models: `backend/core/models.py` (AuditLog, RoleTransition)
- Admin: `backend/core/admin.py`
- Management Command: `backend/accounts/management/commands/setup_rbac_permissions.py`

---

## 🎯 Next Steps

1. **Frontend Integration**
   - Update frontend to use RBAC-aware API calls
   - Implement role-based UI components
   - Add permission checks in components

2. **Advanced Features**
   - Role transition workflow (Eleitor → Participante)
   - Approval system for role upgrades
   - Permission caching for performance
   - Rate limiting per role

3. **Analytics**
   - Permission denial tracking
   - User activity by role
   - Most accessed resources
   - Failed authentication attempts

---

## ✅ Completion Checklist

### Phase 1: Backend Foundation
- [x] 15 Permission classes created
- [x] AuditLog model implemented
- [x] RoleTransition model created
- [x] Middleware implemented
- [x] Management command created
- [x] Admin integration complete

### Phase 2: ViewSet Refactoring
- [x] BlogPostViewSet refactored
- [x] ServiceListingViewSet refactored
- [x] GameViewSet refactored
- [x] All ViewSets with AuditLog integration

### Phase 3: Settings Configuration
- [x] LOGGING configured
- [x] RoleValidationMiddleware activated
- [x] REST Framework settings verified
- [x] Logs directory created

### Phase 4: Testing & Verification
- [x] Django Groups verified
- [x] Test users created
- [x] AuditLog tested
- [x] Permission classes verified
- [x] Middleware verified
- [x] Logging verified

### Phase 5: Production Deployment
- [x] Deployment guide created
- [x] Environment configuration documented
- [x] Testing procedures documented
- [x] Troubleshooting guide created
- [x] Security checklist provided

---

**Total Implementation Time**: ~8 hours (across 5 phases)  
**System Status**: Production Ready ✅  
**Overall Completion**: 100% 🎉
