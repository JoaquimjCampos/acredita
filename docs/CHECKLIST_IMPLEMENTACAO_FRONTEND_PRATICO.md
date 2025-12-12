# 📋 CHECKLIST IMPLEMENTAÇÃO BACKEND-FRONTEND

**Data**: 9 Dezembro 2025  
**Status**: Plano Prático Iniciado  
**Semana**: 1 de 4 (Dec 10-14)  

---

## ✅ FASE 1: FUNDAÇÕES (10-14 Dez) - SEMANA 1

### Day 1: Autenticação & API Client (10 Dez)

#### Tasks Frontend

- [ ] **1.1** Criar `/frontend/src/services/api/client.ts` (DONE ✅)
  - [x] ApiClient class com axios
  - [x] JWT interceptors
  - [x] Token refresh logic
  - [x] Error handling centralizado
  - [ ] **TODO**: Test coverage 80%+

- [ ] **1.2** Criar `/frontend/src/hooks/useAuth.ts`
  - [ ] Hook para gerenciar autenticação
  - [ ] Login/logout functions
  - [ ] Token storage
  - [ ] User context
  - [ ] Loading states

```typescript
// Exemplo: frontend/src/hooks/useAuth.ts
import { useState, useCallback } from 'react';
import { apiClient } from '../services/api/client';

interface AuthResponse {
  access: string;
  refresh: string;
  user: any;
}

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login/', {
        username,
        password,
      });
      apiClient.setTokens(response.access, response.refresh, response.user);
      setUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiClient.logout();
    setUser(null);
  }, []);

  return { user, loading, error, login, logout, isAuthenticated: !!user };
};
```

- [ ] **1.3** Criar `/frontend/src/contexts/AuthContext.tsx`
  - [ ] Provider component
  - [ ] useAuthContext hook
  - [ ] Redux/Zustand integration

- [ ] **1.4** Criar `/frontend/src/components/ProtectedRoute.tsx`
  - [ ] Route guard component
  - [ ] Redirect to login se not authenticated
  - [ ] Loading state handling

```typescript
// Exemplo: frontend/src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { apiClient } from '../services/api/client';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string[];
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const isAuthenticated = apiClient.isAuthenticated();
  const user = apiClient.getCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !requiredRole.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

#### Tasks Backend

- [ ] **1.5** Verificar endpoints de autenticação
  ```bash
  GET /api/auth/login/
  POST /api/auth/token/refresh/
  GET /api/user/me/ (opcional)
  ```

- [ ] **1.6** Testar com cURL/Postman
  ```bash
  curl -X POST http://localhost:8000/api/auth/login/ \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","password":"testpass"}'
  
  # Response esperado:
  # {"access":"...", "refresh":"...", "user":{...}}
  ```

#### Deliverables (End of Day 1)
```
✅ frontend/src/services/api/client.ts (290 lines)
✅ frontend/src/types/api.ts (200 lines)
✅ frontend/src/hooks/useAuth.ts (draft)
✅ frontend/src/contexts/AuthContext.tsx (draft)
✅ frontend/src/components/ProtectedRoute.tsx (draft)
📄 docs/AUTH_INTEGRATION_GUIDE.md (new)
```

---

### Day 2: Type Definitions & Services (11 Dez)

#### Tasks Frontend

- [ ] **2.1** Criar `/frontend/src/types/api.ts` (DONE ✅)
  - [x] DTOs para 3 apps
  - [x] Request/Response types
  - [x] Filter options
  - [ ] **TODO**: Validar com backend serializers

- [ ] **2.2** Criar CertificationsService (DONE ✅)
  - [x] frontend/src/services/certifications/certificationsService.ts
  - [x] 10+ métodos CRUD
  - [ ] **TODO**: Unit tests

- [ ] **2.3** Criar MarketplaceService (DONE ✅)
  - [x] frontend/src/services/marketplace/marketplaceService.ts
  - [x] 12+ métodos CRUD
  - [ ] **TODO**: Unit tests

- [ ] **2.4** Criar KixikilaService (DONE ✅)
  - [x] frontend/src/services/kixikila/kixikilaService.ts
  - [x] 10+ métodos CRUD
  - [ ] **TODO**: Unit tests

- [ ] **2.5** Validar Services com Backend
  ```bash
  # Test each service method
  npm test -- --testPathPattern="services"
  ```

#### Tasks Backend

- [ ] **2.6** Validar Serializers Output
  ```bash
  python manage.py shell
  >>> from backend.certifications.serializers import TrainingProgramSerializer
  >>> from backend.certifications.models import TrainingProgram
  >>> program = TrainingProgram.objects.first()
  >>> serializer = TrainingProgramSerializer(program)
  >>> print(serializer.data)
  ```

- [ ] **2.7** Documentar API (Swagger/OpenAPI)
  ```bash
  # Install drf-spectacular (optional but recommended)
  pip install drf-spectacular
  ```

#### Deliverables (End of Day 2)
```
✅ frontend/src/types/api.ts (200+ lines)
✅ frontend/src/services/certifications/certificationsService.ts (85 lines)
✅ frontend/src/services/marketplace/marketplaceService.ts (150 lines)
✅ frontend/src/services/kixikila/kixikilaService.ts (110 lines)
📄 frontend/__tests__/services/ (to create)
📄 docs/SERVICES_API_REFERENCE.md (new)
```

---

### Day 3-4: State Management (12-13 Dez)

#### Tasks Frontend - Zustand Store Setup

```typescript
// Exemplo: frontend/src/store/certifications.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import CertificationsService from '../services/certifications/certificationsService';
import { ProfessionalCategoryDTO, TrainingProgramDTO } from '../types/api';

interface CertificationsStore {
  // State
  categories: ProfessionalCategoryDTO[];
  programs: TrainingProgramDTO[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  fetchPrograms: (categoryId?: number) => Promise<void>;
  reset: () => void;
}

export const useCertificationsStore = create<CertificationsStore>()(
  devtools(
    persist(
      (set) => ({
        categories: [],
        programs: [],
        loading: false,
        error: null,

        fetchCategories: async () => {
          set({ loading: true, error: null });
          try {
            const categories = await CertificationsService.getCategories();
            set({ categories });
          } catch (error: any) {
            set({ error: error.message });
          } finally {
            set({ loading: false });
          }
        },

        fetchPrograms: async (categoryId?: number) => {
          set({ loading: true, error: null });
          try {
            const response = await CertificationsService.getPrograms({ category_id: categoryId });
            set({ programs: response.results });
          } catch (error: any) {
            set({ error: error.message });
          } finally {
            set({ loading: false });
          }
        },

        reset: () => {
          set({
            categories: [],
            programs: [],
            loading: false,
            error: null,
          });
        },
      }),
      { name: 'certifications-store' }
    )
  )
);
```

- [ ] **3.1** Setup Zustand + Middleware
  ```bash
  npm install zustand
  ```

- [ ] **3.2** Criar `frontend/src/store/certifications.ts`
  - [ ] State interface
  - [ ] Actions
  - [ ] Devtools + Persist middleware
  - [ ] Error handling

- [ ] **3.3** Criar `frontend/src/store/marketplace.ts`
  - [ ] Listings state + actions
  - [ ] Orders state + actions
  - [ ] Filters & search state

- [ ] **3.4** Criar `frontend/src/store/kixikila.ts`
  - [ ] Groups state + actions
  - [ ] Memberships state
  - [ ] Contributions state

- [ ] **3.5** Criar `frontend/src/store/index.ts`
  ```typescript
  export { useCertificationsStore } from './certifications';
  export { useMarketplaceStore } from './marketplace';
  export { useKixikilaStore } from './kixikila';
  ```

#### Tasks Backend

- [ ] **3.6** Verificar endpoints de stats
  ```bash
  GET /api/v2/certifications/stats/
  GET /api/v2/marketplace/stats/
  GET /api/v2/kixikila/stats/
  ```

#### Tests

- [ ] **3.7** Unit tests para stores
  ```bash
  npm test -- --testPathPattern="store"
  ```

#### Deliverables (End of Day 4)
```
✅ frontend/src/store/certifications.ts (70 lines)
✅ frontend/src/store/marketplace.ts (100 lines)
✅ frontend/src/store/kixikila.ts (80 lines)
✅ frontend/src/store/index.ts (5 lines)
✅ frontend/__tests__/store/ (unit tests)
📄 docs/STATE_MANAGEMENT_GUIDE.md (new)
```

---

### Day 5: Integration & Testing (14 Dez)

#### E2E Tests

- [ ] **4.1** Setup E2E testing framework
  ```bash
  npm install --save-dev @testing-library/react-hooks
  npm install --save-dev msw # Mock Service Worker
  ```

- [ ] **4.2** Create mock API handlers
  ```typescript
  // frontend/src/__tests__/mocks/handlers.ts
  import { rest } from 'msw';

  export const handlers = [
    rest.post('/api/v2/auth/login/', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          access: 'mock_token',
          refresh: 'mock_refresh',
          user: { id: 1, username: 'testuser' },
        })
      );
    }),
    rest.get('/api/v2/certifications/categories/', (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          count: 2,
          results: [
            { id: 1, name: 'Motoqueiro', description: 'Driver certification' },
            { id: 2, name: 'Técnico', description: 'Technical certification' },
          ],
        })
      );
    }),
  ];
  ```

- [ ] **4.3** Integration tests: Auth flow
  ```bash
  npm test -- --testPathPattern="integration/auth"
  ```

- [ ] **4.4** Integration tests: Data fetching
  ```bash
  npm test -- --testPathPattern="integration/data"
  ```

#### Staging Deployment

- [ ] **4.5** Configure environment variables
  ```bash
  # .env.staging
  REACT_APP_API_URL=https://staging.acredita.ao/api/v2
  REACT_APP_ENV=staging
  REACT_APP_LOG_LEVEL=debug
  ```

- [ ] **4.6** Build frontend
  ```bash
  npm run build
  # Output: build/ directory
  ```

- [ ] **4.7** Deploy to staging
  ```bash
  # Upload build/ to staging server
  scp -r build/ staging@staging.acredita.ao:/var/www/
  ```

#### Deliverables (End of Day 5)
```
✅ frontend/__tests__/integration/ (E2E tests)
✅ frontend/__tests__/mocks/ (MSW handlers)
✅ .env.staging (configuration)
✅ docs/E2E_TESTING_GUIDE.md (new)
✅ docs/STAGING_DEPLOYMENT_FRONTEND.md (new)
```

---

## 🎯 SEMANA 1 SUMMARY

### Metrics
- **Frontend LOC**: ~800 lines (services + stores)
- **Tests Created**: 15+ integration tests
- **Type Coverage**: 95%+
- **API Endpoints Used**: 30+ endpoints tested

### Git Commits Expected
```
commit 1: feat: Add API client with JWT auth + interceptors
commit 2: feat: Add type definitions for 3 apps
commit 3: feat: Add Certifications, Marketplace, Kixikila services
commit 4: feat: Add Zustand stores for state management
commit 5: test: Add integration tests for auth & data fetching
commit 6: feat: Add environment config for staging
```

### Code Quality Gates
- [ ] TypeScript: `tsc --noEmit` ✅ No errors
- [ ] Linting: `npm run lint` ✅ 0 errors
- [ ] Tests: `npm test` ✅ All passing
- [ ] Coverage: `npm run coverage` ✅ > 60%
- [ ] Build: `npm run build` ✅ < 500KB

### Sign-Off
- [ ] Backend Lead: Approves API design & endpoints
- [ ] Frontend Lead: Approves architecture & code quality
- [ ] QA Lead: Approves test coverage & integration

---

## 📋 SEMANA 2 PREVIEW: Pages & Components (Dec 17-21)

### Certifications Pages (10 components + 3 pages = ~1500 LOC)
- [ ] CategoriesGrid component
- [ ] ProgramCard component
- [ ] ProgramDetailPage (with lazy-loaded reviews)
- [ ] EnrollmentForm with validation
- [ ] MyEnrollmentsPage with filters
- [ ] CertificateCard component
- [ ] CertificateDownloadButton
- [ ] EnrollmentProgressBar
- [ ] CategoryFilter dropdown
- [ ] SearchBar component

### Marketplace Pages (12 components + 4 pages = ~2000 LOC)
- [ ] ServiceListingCard (featured badge, quick view)
- [ ] ListingDetailPage (with images carousel)
- [ ] ListingFilters sidebar (price, location, category)
- [ ] CreateListingForm with multi-file upload
- [ ] OrderCard component
- [ ] OrderDetailPage with timeline
- [ ] ReviewForm with star rating
- [ ] ProviderProfile page
- [ ] SearchServices with auto-complete
- [ ] PriceRangeSlider component
- [ ] LocationFilter (province/municipality)
- [ ] FeaturedBadge component

### Kixikila Pages (10 components + 3 pages = ~1500 LOC)
- [ ] GroupCard with quick stats
- [ ] GroupDetailPage with member list
- [ ] CreateGroupForm with validation
- [ ] JoinGroupModal confirmation
- [ ] ContributionForm with payment methods
- [ ] GroupStats dashboard
- [ ] MembersGrid view
- [ ] PayoutCard with status
- [ ] RatingForm modal
- [ ] GroupActivityFeed component

---

## 🚀 GO-LIVE TIMELINE

```
Dec 10-14: Semana 1 (Fundações) ✅
Dec 17-21: Semana 2 (Pages & Components) 🔨
Dec 24-28: Semana 3 (Forms & Validation) 🔨
Dec 31-Jan 4: Semana 4 (Testing & Polish) 🔨
Jan 5: 🚀 LAUNCH PRODUCTION
```

---

**Last Updated**: 9 Dez 2025, 23:50 UTC  
**Owner**: Frontend Lead  
**Next Review**: 10 Dez 2025, 10:00 UTC (After Day 1 completion)

