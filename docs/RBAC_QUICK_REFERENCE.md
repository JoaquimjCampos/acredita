# 🎯 RBAC Quick Reference Card

## Test Users

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| Eleitor | `test_eleitor` | `Test123!@#` | 3 (view only) |
| Participante | `test_participante` | `Test123!@#` | 5 (create content) |
| Mentor | `test_mentor` | `Test123!@#` | 4 (teach, moderate) |
| Admin | `test_admin` | `Test123!@#` | 268 (full access) |

## Permission Matrix

| Action | Eleitor | Participante | Mentor | Admin |
|--------|---------|--------------|--------|-------|
| **View Content** | ✅ | ✅ | ✅ | ✅ |
| **Create Marketplace Listing** | ❌ | ✅ | ✅ | ✅ |
| **Create Game** | ❌ | ✅ | ✅ | ✅ |
| **Create Blog Post** | ❌ | ❌ | ✅ | ✅ |
| **Create Certification** | ❌ | ❌ | ✅ | ✅ |
| **Moderate Content** | ❌ | ❌ | ✅ | ✅ |
| **Publish Content** | ❌ | ❌ | ✅ | ✅ |
| **Edit Own Content** | ❌ | ✅ | ✅ | ✅ |
| **Edit Others' Content** | ❌ | ❌ | ❌ | ✅ |
| **Delete Own Content** | ❌ | ✅ | ✅ | ✅ |
| **Delete Others' Content** | ❌ | ❌ | ❌ | ✅ |

## API Endpoints

### Authentication
```http
POST /api/accounts/token/
Content-Type: application/json

{
  "username": "test_user",
  "password": "Test123!@#"
}

Response: { "access": "jwt_token", "refresh": "refresh_token" }
```

### Marketplace
```http
# List (All roles)
GET /api/marketplace/listings/
Authorization: Bearer <token>

# Create (Participante+)
POST /api/marketplace/listings/
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Service Name",
  "description": "Description",
  "price": "100.00"
}
```

### Games
```http
# List (All roles)
GET /api/games/
Authorization: Bearer <token>

# Create (Participante+)
POST /api/games/
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Game Name",
  "type": "quiz",
  "description": "Game description"
}
```

## Management Commands

```bash
# Setup RBAC (run once after deployment)
python manage.py setup_rbac_permissions

# Create superuser
python manage.py createsuperuser

# Check system
python manage.py check

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic

# Run development server
python manage.py runserver

# Run production server (Gunicorn)
gunicorn backend.acredita_backend.wsgi:application --bind 0.0.0.0:8000
```

## Testing Commands

```bash
# Infrastructure tests
python test_rbac_phase4.py

# API tests (requires running server)
python test_rbac_api.py

# Django tests
python manage.py test
```

## Admin URLs

```
# Main admin
http://localhost:8000/admin/

# AuditLog
http://localhost:8000/admin/core/auditlog/

# Users
http://localhost:8000/admin/accounts/user/

# Groups
http://localhost:8000/admin/auth/group/
```

## Log Files

```bash
# View RBAC logs
tail -f logs/rbac.log

# View application logs
tail -f logs/acredita.log

# View analytics logs
tail -f logs/analytics.log

# Search for errors
grep -i error logs/*.log
```

## Common Issues

### 403 Forbidden
- **Cause**: User not in correct group
- **Fix**: Add user to group via admin or:
  ```python
  from django.contrib.auth.models import Group
  user.groups.add(Group.objects.get(name='Participante'))
  ```

### Token Invalid
- **Cause**: Token expired
- **Fix**: Get new token using refresh token or re-authenticate

### Middleware Not Working
- **Cause**: Not in MIDDLEWARE list
- **Fix**: Check `settings.py` MIDDLEWARE list

### AuditLog Not Recording
- **Cause**: Logger not configured
- **Fix**: Check LOGGING in settings.py and create logs/ directory

## Permission Classes Location

```
backend/core/rbac_permissions.py
├── IsParticipant
├── IsMentor
├── IsVoter
├── IsAdminUser
├── CanCreateKixikila
├── CanCreateMarketplaceListing
├── CanCreateCertificationCourse
├── CanCreateBlogPost
├── CanPublishContent
├── CanModerateContent
├── IsOwnerOrAdmin
├── IsOwnerOrReadOnly
├── IsAdminOrReadOnly
├── ParticipantOrAdmin
└── MentorOrAdmin
```

## Useful Django Shell Commands

```python
# Get user's groups
from backend.accounts.models import User
user = User.objects.get(username='test_user')
user.groups.all()

# Check if user has permission
user.has_perm('core.add_servicelisting')

# Get recent audit logs
from backend.core.models import AuditLog
AuditLog.objects.order_by('-timestamp')[:10]

# Count logs by user
from django.db.models import Count
AuditLog.objects.values('user__username').annotate(count=Count('id'))

# Count logs by action
AuditLog.objects.values('action').annotate(count=Count('id'))
```

## Environment Variables

```env
# Required
SECRET_KEY=<secret>
DEBUG=False
DATABASE_URL=postgresql://...

# Optional
ALLOWED_HOSTS=domain.com
CORS_ALLOWED_ORIGINS=https://domain.com
JWT_ACCESS_TOKEN_LIFETIME=60
EMAIL_HOST=smtp.gmail.com
```

## Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET/PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid data |
| 401 | Unauthorized | No token/invalid token |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Backend error |

## Quick Start

```bash
# 1. Clone and setup
git clone <repo>
cd acredita
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# 2. Configure
cp .env.example .env
# Edit .env with your settings

# 3. Database
python manage.py migrate
python manage.py setup_rbac_permissions

# 4. Create admin
python manage.py createsuperuser

# 5. Run
python manage.py runserver

# 6. Test
python test_rbac_phase4.py
```

---

**Need Help?**
- Documentation: `docs/RBAC_DEPLOYMENT_GUIDE.md`
- Test Scripts: `test_rbac_phase4.py`, `test_rbac_api.py`
- Postman Collection: `docs/Acredita_RBAC_Postman_Collection.json`
