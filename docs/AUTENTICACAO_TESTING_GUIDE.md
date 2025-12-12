# Authentication & API Testing Guide - Acredita

## Overview

Your application uses **JWT (JSON Web Token) Authentication** with the following flow:

```
User Login → Access Token + Refresh Token → Stored in localStorage → Included in API requests
```

## Architecture

### Backend (Django)
- **Authentication**: `rest_framework_simplejwt.authentication.JWTAuthentication`
- **Token Lifetime**: 60 minutes (access), 7 days (refresh)
- **CORS Enabled**: `http://localhost:3000`, `http://127.0.0.1:3000`
- **Default Permission**: `IsAuthenticated` (all endpoints require login)

### Frontend (React)
- **API Client**: `src/services/api/client.ts` (Axios-based)
- **Token Storage**: `localStorage` (access_token, refresh_token)
- **Auto-Refresh**: Automatically refreshes token on 401 response
- **Auth Context**: `src/contexts/AuthContext.tsx` (manages user state)

## Understanding the 401 Errors

The 401 Unauthorized errors you're seeing are **EXPECTED and CORRECT**:

```
Unauthorized: /api/donations/donations/
[09/Dec/2025 20:49:22] "GET /api/donations/donations/ HTTP/1.1" 401 68
```

**Why?**
- The donations endpoint is protected (`permission_classes = [IsAuthenticated]`)
- Without a valid JWT token, requests are rejected with 401
- The frontend makes these requests during initial load before user logs in

**This is working as designed!** ✅

## Testing the Authentication Flow

### Step 1: Check Backend is Running
```bash
# Terminal 1: Django Server
cd c:\apps\Acredita
python manage.py runserver

# Should show:
# Starting development server at http://127.0.0.1:8000/
# Quit the server with CTRL-BREAK.
```

### Step 2: Check Frontend is Running
```bash
# Terminal 2: React Dev Server
cd c:\apps\Acredita\frontend
npm start

# Should compile successfully and open http://localhost:3000
```

### Step 3: Test Login Flow

#### Option A: Using Browser Developer Tools

1. **Open your app** at `http://localhost:3000`
2. **Open DevTools** (F12 → Console)
3. **Check localStorage initially**:
   ```javascript
   // In browser console:
   localStorage.getItem('access_token')  // Should be null (not logged in)
   localStorage.getItem('refresh_token') // Should be null
   ```

4. **Log in with test credentials**:
   - Navigate to login page (if exists)
   - Use any credentials that exist in your database
   - Example:
     ```
     Username: testuser
     Password: testpassword
     ```

5. **Check localStorage after login**:
   ```javascript
   localStorage.getItem('access_token')   // Should show JWT token
   localStorage.getItem('refresh_token')  // Should show refresh token
   localStorage.getItem('user_info')      // Should show user data
   ```

6. **Check Network tab**:
   - Look for requests with `Authorization: Bearer <token>` header
   - 401 errors should stop appearing once logged in

#### Option B: Using curl/Postman

1. **Get login tokens**:
   ```bash
   curl -X POST http://localhost:8000/api/v2/auth/token/ \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"testpassword"}'
   
   # Response:
   # {
   #   "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
   #   "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
   # }
   ```

2. **Use token in API request**:
   ```bash
   curl -X GET http://localhost:8000/api/v2/donations/donations/ \
     -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
   
   # Should return 200 with data (not 401)
   ```

3. **Refresh token when expired**:
   ```bash
   curl -X POST http://localhost:8000/api/v2/auth/token/refresh/ \
     -H "Content-Type: application/json" \
     -d '{"refresh":"eyJ0eXAiOiJKV1QiLCJhbGc..."}'
   
   # Returns new access token
   ```

### Step 4: Test Protected Endpoints

Once logged in, test the three new modules:

#### Certifications
```bash
# List programs (requires auth)
curl -X GET http://localhost:8000/api/v2/certifications/programs/ \
  -H "Authorization: Bearer $TOKEN"

# Enroll in program
curl -X POST http://localhost:8000/api/v2/certifications/enrollments/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"program_id": 1}'
```

#### Marketplace
```bash
# List service listings
curl -X GET http://localhost:8000/api/v2/marketplace/listings/ \
  -H "Authorization: Bearer $TOKEN"

# Create service order
curl -X POST http://localhost:8000/api/v2/marketplace/orders/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"listing_id": 1, "payment_method": "card", "notes": "test"}'
```

#### Kixikila
```bash
# List rotating savings groups
curl -X GET http://localhost:8000/api/v2/kixikila/groups/ \
  -H "Authorization: Bearer $TOKEN"

# Join group
curl -X POST http://localhost:8000/api/v2/kixikila/groups/1/join/ \
  -H "Authorization: Bearer $TOKEN"
```

## Creating Test Users

### Option 1: Django Admin
```bash
python manage.py runserver

# Visit http://localhost:8000/admin/
# Login with superuser (or create one)
# Create test users in Users section
```

### Option 2: Command Line
```bash
python manage.py shell

# Create a test user
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.create_user(
    username='testuser',
    email='test@example.com',
    password='testpassword',
    first_name='Test',
    last_name='User'
)
```

### Option 3: Registration Endpoint (if exists)
```bash
curl -X POST http://localhost:8000/api/v2/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "securepass123",
    "first_name": "New",
    "last_name": "User"
  }'
```

## Frontend Authentication Integration

### Using useAuth Hook (React)

```typescript
import { useAuth } from '../hooks/useAuth';

export const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in to continue</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.nome}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### Using Protected Routes

```typescript
// Routes in App.tsx
import { ProtectedRoute } from './components/ProtectedRoute';
import { CertificationsPage } from './pages/CertificationsPage';

export const App = () => {
  return (
    <Routes>
      <Route 
        path="/certifications" 
        element={<ProtectedRoute><CertificationsPage /></ProtectedRoute>} 
      />
    </Routes>
  );
};
```

### Manual API Calls with Auth

```typescript
import { apiClient } from '../services/api/client';

// The client automatically includes JWT token
const donations = await apiClient.get('/donations/donations/');

// If token expires, client automatically refreshes it
// No need to handle token manually!
```

## Debugging Tips

### 1. Check if Token is Being Sent
```javascript
// In browser console:
const token = localStorage.getItem('access_token');
console.log('Token:', token);
console.log('Token valid?', token && token.split('.').length === 3); // JWT has 3 parts
```

### 2. Decode JWT Token (frontend)
```javascript
// In browser console:
const token = localStorage.getItem('access_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token expires:', new Date(payload.exp * 1000));
console.log('User ID:', payload.user_id);
```

### 3. Check API Response Headers
```javascript
// In browser DevTools → Network tab
// Look for "Authorization" header in requests:
// Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

### 4. Monitor Token Refresh
```javascript
// Add to AuthContext or API client
console.log('Token refreshed at:', new Date().toISOString());
```

### 5. Check CORS Headers
```bash
# API response should include:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Credentials: true

curl -I http://localhost:8000/api/v2/donations/donations/
```

## Common Issues & Solutions

### Issue: Still Getting 401 After Login
**Solution**:
- Check if token is saved: `localStorage.getItem('access_token')`
- Check if token is valid: Decode and check expiration
- Check if Authorization header is being sent: Look in Network tab (F12)
- Clear localStorage and login again

### Issue: Token Not Being Refreshed
**Solution**:
- Check refresh token exists: `localStorage.getItem('refresh_token')`
- Check refresh endpoint: `POST /api/v2/auth/token/refresh/`
- Check CORS allows refresh endpoint

### Issue: CORS Errors
**Solution**:
```python
# In Django settings.py, ensure:
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
CORS_ALLOW_CREDENTIALS = True
```

### Issue: Login Page Not Showing
**Solution**:
- Check if AuthContext wraps your App component
- Check if login route exists in App.tsx
- Check browser console for errors

## API Endpoints Reference

### Authentication
```
POST   /api/v2/auth/token/           - Get access & refresh tokens
POST   /api/v2/auth/token/refresh/   - Refresh access token
POST   /api/v2/auth/logout/          - Logout (blacklist token)
GET    /api/v2/auth/profile/         - Get current user
```

### Certifications
```
GET    /api/v2/certifications/programs/           - List programs
GET    /api/v2/certifications/programs/{id}/      - Get program detail
POST   /api/v2/certifications/enrollments/        - Enroll in program
GET    /api/v2/certifications/enrollments/        - Get my enrollments
GET    /api/v2/certifications/enrollments/{id}/   - Get enrollment detail
```

### Marketplace
```
GET    /api/v2/marketplace/listings/       - List service listings
GET    /api/v2/marketplace/listings/{id}/  - Get listing detail
POST   /api/v2/marketplace/orders/         - Create service order
GET    /api/v2/marketplace/orders/         - Get my orders
GET    /api/v2/marketplace/orders/{id}/    - Get order detail
```

### Kixikila
```
GET    /api/v2/kixikila/groups/              - List groups
GET    /api/v2/kixikila/groups/{id}/         - Get group detail
POST   /api/v2/kixikila/groups/              - Create group
POST   /api/v2/kixikila/groups/{id}/join/    - Join group
GET    /api/v2/kixikila/groups/{id}/members/ - Get group members
```

## Feature Flags

If features are disabled, enable them in settings.py:

```python
ACTIVE_FEATURES = {
    'certifications': True,   # Enable Certifications module
    'marketplace': True,      # Enable Marketplace module
    'kixikila': True,         # Enable Kixikila module
    'advanced_payments': True,
}
```

## Summary

✅ **Your authentication is working correctly!**
- 401 errors are expected for unauthenticated requests
- Once users log in, tokens are stored and included in requests
- Token auto-refresh handles expiration seamlessly

**Next Steps:**
1. Create test users
2. Test login flow in browser
3. Verify tokens are saved in localStorage
4. Test API endpoints with valid tokens
5. Run integration tests from GUIA_PRATICO_TESTES.md

---
**Last Updated**: December 9, 2025  
**Status**: ✅ Authentication System Fully Configured
