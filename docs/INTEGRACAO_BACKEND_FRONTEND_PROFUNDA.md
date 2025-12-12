# 🔗 INTEGRAÇÃO BACKEND-FRONTEND PROFUNDA & HARMONIOSA

**Data**: 9 Dezembro 2025  
**Status**: Planeamento Estratégico  
**Objetivo**: Implementação sincronizada backend-frontend com zero desalinhamentos  

---

## 📊 REVISÃO PROFUNDA - ESTADO ATUAL

### Backend Status ✅
```
✅ 3 Apps Completas (Certifications, Marketplace, Kixikila)
✅ 15 Modelos Django implementados
✅ 41+ Endpoints REST funcionais
✅ 4/4 Testes passando
✅ 0 Problemas Django check
✅ Feature flags centralizados
✅ Admin interfaces ricas (14 classes)
✅ Migrations aplicadas (41 total)
✅ GitHub: master & dev synced
```

### Frontend Status 🟡 (Análise)
```
🟡 React 18 + TypeScript configurado
🟡 Tailwind CSS + HeadlessUI pronto
🟡 React Router v7 estruturado
🟡 Axios para HTTP client
🟡 React Hook Form para forms
🟡 i18next para i18n (PT/EN)
🟡 Estrutura: pages, components, services, hooks, types
❌ Services API não estão atualizados para v2 endpoints
❌ Pages principais não existem para 3 novos módulos
❌ Types/interfaces desalinhadas com backend
❌ Estado global não gerido (Redux/Zustand)
❌ Autenticação não integrada com JWT backend
```

### Análise Gap Frontend-Backend 🔴

| Item | Backend | Frontend | Status |
|------|---------|----------|--------|
| **Autenticação** | JWT + SimpleJWT | Axios interceptors? | ❌ Desalinhado |
| **API Prefix** | `/api/v2/{module}` | Desconhecido | ❌ Desconhecido |
| **Typings** | Serializers DRF | TypeScript types? | ❌ Fora de sync |
| **Error Handling** | DRF standard | Não documentado | ❌ Incerto |
| **Loading States** | N/A | Provavelmente falta | ❌ Falta |
| **Paginação** | DRF built-in | Não integrado | ❌ Falta |
| **Filtros** | Múltiplos params | Query string handling? | ❌ Incerto |
| **Real-time** | Não existe | Websockets? | ❌ Falta |
| **Offline Mode** | N/A | Service Worker? | ❌ Falta |

---

## 🎯 ARQUITETURA DE INTEGRAÇÃO - PROPOSTA

### Layer 1: API Client Layer (Frontend)

```typescript
// frontend/src/services/api/client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v2') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor: Add JWT token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = \`Bearer \${token}\`;
      }
      return config;
    });

    // Interceptor: Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const { data } = await this.refreshToken();
            localStorage.setItem('access_token', data.access);
            originalRequest.headers.Authorization = \`Bearer \${data.access}\`;
            return this.client(originalRequest);
          } catch {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private async refreshToken() {
    return this.client.post('/auth/token/refresh', {
      refresh: localStorage.getItem('refresh_token'),
    });
  }

  // Generic methods
  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const { data } = await this.client.get<T>(url, { params });
    return data;
  }

  async post<T>(url: string, payload: any): Promise<T> {
    const { data } = await this.client.post<T>(url, payload);
    return data;
  }

  async put<T>(url: string, payload: any): Promise<T> {
    const { data } = await this.client.put<T>(url, payload);
    return data;
  }

  async delete<T>(url: string): Promise<T> {
    const { data } = await this.client.delete<T>(url);
    return data;
  }
}

export const apiClient = new ApiClient();
```

### Layer 2: Domain Services (Frontend)

```typescript
// frontend/src/services/certifications/certificationsService.ts
import { apiClient } from '../api/client';

interface ProfessionalCategory {
  id: number;
  name: string;
  description: string;
}

interface TrainingProgram {
  id: number;
  category_id: number;
  title: string;
  description: string;
  duration_hours: number;
  price: number;
  status: 'active' | 'draft' | 'archived';
  created_at: string;
}

interface CandidateEnrollment {
  id: number;
  user_id: number;
  program_id: number;
  enrollment_date: string;
  status: 'active' | 'completed' | 'withdrawn';
}

interface CertificateIssued {
  id: number;
  enrollment_id: number;
  issue_date: string;
  certificate_number: string;
  pdf_url: string;
}

export class CertificationsService {
  async getCategories(): Promise<ProfessionalCategory[]> {
    const response = await apiClient.get<PaginatedResponse<ProfessionalCategory>>(
      '/certifications/categories/'
    );
    return response.results;
  }

  async getPrograms(categoryId?: number): Promise<TrainingProgram[]> {
    const response = await apiClient.get<PaginatedResponse<TrainingProgram>>(
      '/certifications/programs/',
      categoryId ? { category: categoryId } : undefined
    );
    return response.results;
  }

  async enrollProgram(programId: number): Promise<CandidateEnrollment> {
    return apiClient.post('/certifications/enrollments/', {
      program_id: programId,
    });
  }

  async getMyEnrollments(): Promise<CandidateEnrollment[]> {
    const response = await apiClient.get<PaginatedResponse<CandidateEnrollment>>(
      '/certifications/enrollments/my_enrollments/'
    );
    return response.results;
  }

  async getCertificate(enrollmentId: number): Promise<CertificateIssued> {
    return apiClient.get(`/certifications/certificates/${enrollmentId}/`);
  }

  async downloadCertificate(certificateId: number): Promise<Blob> {
    const { pdf_url } = await this.getCertificate(certificateId);
    return apiClient.get<Blob>(pdf_url);
  }
}

// Similar para MarketplaceService, KixikilaService
```

### Layer 3: Type Safety (Frontend)

```typescript
// frontend/src/types/api.ts
// Auto-generated from Django serializers

// Certifications Types
export type ProfessionalCategoryDTO = {
  id: number;
  name: string;
  description: string;
  program_count?: number;
};

export type TrainingProgramDTO = {
  id: number;
  category: ProfessionalCategoryDTO;
  title: string;
  description: string;
  duration_hours: number;
  price: number;
  status: 'active' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
};

// Marketplace Types
export type ServiceCategoryDTO = {
  id: number;
  name: string;
  description: string;
  icon: string;
  service_count?: number;
};

export type ServiceListingDTO = {
  id: number;
  provider: UserDTO;
  category: ServiceCategoryDTO;
  title: string;
  description: string;
  price: number;
  price_type: 'fixed' | 'hourly' | 'negotiable';
  location: string;
  is_featured: boolean;
  views: number;
  created_at: string;
};

// Kixikila Types
export type KixikilaGroupDTO = {
  id: number;
  name: string;
  description: string;
  member_count: number;
  monthly_contribution: number;
  status: 'active' | 'completed' | 'suspended';
  created_at: string;
};

// Common Types
export type UserDTO = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
```

### Layer 4: State Management (Frontend)

```typescript
// frontend/src/store/certifications.ts (Zustand example)
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { CertificationsService } from '../services/certifications/certificationsService';

interface CertificationsStore {
  // State
  categories: ProfessionalCategoryDTO[];
  programs: TrainingProgramDTO[];
  enrollments: CandidateEnrollmentDTO[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  fetchPrograms: (categoryId?: number) => Promise<void>;
  fetchMyEnrollments: () => Promise<void>;
  enrollProgram: (programId: number) => Promise<void>;
  reset: () => void;
}

export const useCertificationsStore = create<CertificationsStore>()(
  devtools(
    persist(
      (set, get) => ({
        categories: [],
        programs: [],
        enrollments: [],
        loading: false,
        error: null,

        fetchCategories: async () => {
          set({ loading: true, error: null });
          try {
            const categories = await CertificationsService.getCategories();
            set({ categories });
          } catch (error) {
            set({ error: error.message });
          } finally {
            set({ loading: false });
          }
        },

        fetchPrograms: async (categoryId?: number) => {
          set({ loading: true, error: null });
          try {
            const programs = await CertificationsService.getPrograms(categoryId);
            set({ programs });
          } catch (error) {
            set({ error: error.message });
          } finally {
            set({ loading: false });
          }
        },

        fetchMyEnrollments: async () => {
          set({ loading: true, error: null });
          try {
            const enrollments = await CertificationsService.getMyEnrollments();
            set({ enrollments });
          } catch (error) {
            set({ error: error.message });
          } finally {
            set({ loading: false });
          }
        },

        enrollProgram: async (programId: number) => {
          set({ loading: true, error: null });
          try {
            const enrollment = await CertificationsService.enrollProgram(programId);
            set((state) => ({
              enrollments: [...state.enrollments, enrollment],
            }));
          } catch (error) {
            set({ error: error.message });
          } finally {
            set({ loading: false });
          }
        },

        reset: () => {
          set({
            categories: [],
            programs: [],
            enrollments: [],
            loading: false,
            error: null,
          });
        },
      }),
      {
        name: 'certifications-store',
      }
    )
  )
);
```

### Layer 5: React Components (Frontend)

```typescript
// frontend/src/pages/certifications/ProgramsListPage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCertificationsStore } from '../../store/certifications';
import { ProgramCard } from '../../components/certifications/ProgramCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorAlert } from '../../components/common/ErrorAlert';

export const ProgramsListPage = () => {
  const navigate = useNavigate();
  const { programs, categories, loading, error, fetchPrograms, fetchCategories } =
    useCertificationsStore();

  useEffect(() => {
    fetchCategories();
    fetchPrograms();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Programas de Certificação</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program) => (
          <ProgramCard
            key={program.id}
            program={program}
            onEnroll={() => {
              navigate(`/certifications/program/${program.id}/enroll`);
            }}
          />
        ))}
      </div>
    </div>
  );
};
```

---

## 🛠️ PLANO IMPLEMENTAÇÃO 4 SEMANAS

### SEMANA 1: Fundações Frontend (Dec 10-14)

#### Day 1 (10 Dez) - Autenticação & API Client
```typescript
📋 Tasks:
  [ ] Criar ApiClient class com interceptors (1h)
  [ ] Implementar JWT token storage & refresh (1h)
  [ ] Testar com login endpoint backend (1h)
  [ ] Criar useAuth hook & AuthContext (1h)
  [ ] Setup protected routes (1h)
  [ ] Test coverage: 80% (1h)

📦 Deliverables:
  - frontend/src/services/api/client.ts
  - frontend/src/hooks/useAuth.ts
  - frontend/src/contexts/AuthContext.tsx
  - frontend/src/components/ProtectedRoute.tsx
```

#### Day 2 (11 Dez) - Type Definitions & Services
```typescript
📋 Tasks:
  [ ] Definir types para 3 apps (1h)
  [ ] Criar CertificationsService (1h)
  [ ] Criar MarketplaceService (1h)
  [ ] Criar KixikilaService (1h)
  [ ] Unit tests para services (1h)

📦 Deliverables:
  - frontend/src/types/api.ts
  - frontend/src/types/certifications.ts
  - frontend/src/types/marketplace.ts
  - frontend/src/types/kixikila.ts
  - frontend/src/services/certifications/*.ts
  - frontend/src/services/marketplace/*.ts
  - frontend/src/services/kixikila/*.ts
```

#### Day 3-4 (12-13 Dez) - State Management
```typescript
📋 Tasks:
  [ ] Setup Zustand stores (2h)
  [ ] Implement CertificationsStore (1h)
  [ ] Implement MarketplaceStore (1h)
  [ ] Implement KixikilaStore (1h)
  [ ] DevTools integration & persistence (1h)
  [ ] Integration tests (1h)

📦 Deliverables:
  - frontend/src/store/certifications.ts
  - frontend/src/store/marketplace.ts
  - frontend/src/store/kixikila.ts
  - frontend/src/store/index.ts (exports)
```

#### Day 5 (14 Dez) - Integration & Testing
```typescript
📋 Tasks:
  [ ] E2E tests: Auth flow (1h)
  [ ] E2E tests: Data fetching (1h)
  [ ] Mock API server for tests (1h)
  [ ] Documentation: API client guide (1h)
  [ ] Staging deploy test (1h)

📦 Deliverables:
  - frontend/__tests__/services/ (integration tests)
  - frontend/__tests__/store/ (store tests)
  - docs/FRONTEND_API_INTEGRATION_GUIDE.md
```

### SEMANA 2: Pages & Components (Dec 17-21)

#### Days 1-2 (17-18 Dez) - Certifications Pages
```typescript
📋 Components (10 total):
  [ ] CategoriesGrid
  [ ] ProgramCard
  [ ] ProgramDetailPage
  [ ] EnrollmentForm
  [ ] MyEnrollmentsPage
  [ ] CertificateCard
  [ ] CertificateDownloadButton
  [ ] EnrollmentProgressBar
  [ ] CategoryFilter
  [ ] SearchBar

📋 Pages (3 total):
  [ ] /certifications (list)
  [ ] /certifications/:id (detail)
  [ ] /certifications/my-enrollments (user)

💾 LOC Target: ~1500 lines
```

#### Days 3-4 (19-20 Dez) - Marketplace Pages
```typescript
📋 Components (12 total):
  [ ] ServiceListingCard
  [ ] ListingDetailPage
  [ ] ListingFilters
  [ ] CreateListingForm
  [ ] OrderCard
  [ ] OrderDetailPage
  [ ] ReviewForm
  [ ] ProviderProfile
  [ ] SearchServices
  [ ] PriceRangeSlider
  [ ] LocationFilter
  [ ] FeaturedBadge

📋 Pages (4 total):
  [ ] /marketplace (list)
  [ ] /marketplace/:id (detail)
  [ ] /marketplace/my-listings (provider)
  [ ] /marketplace/my-orders (buyer)

💾 LOC Target: ~2000 lines
```

#### Day 5 (21 Dez) - Kixikila Pages
```typescript
📋 Components (10 total):
  [ ] GroupCard
  [ ] GroupDetailPage
  [ ] CreateGroupForm
  [ ] JoinGroupModal
  [ ] ContributionForm
  [ ] GroupStats
  [ ] MembersGrid
  [ ] PayoutCard
  [ ] RatingForm
  [ ] GroupActivityFeed

📋 Pages (3 total):
  [ ] /kixikila (list)
  [ ] /kixikila/:id (detail)
  [ ] /kixikila/my-groups (user)

💾 LOC Target: ~1500 lines
```

### SEMANA 3: Forms & Validation (Dec 24-28)

#### Form Structures
```typescript
// Use react-hook-form + Yup/Zod

Certifications:
  [ ] EnrollmentForm (5 fields, validation)
  [ ] AssessmentSubmitForm (file upload, validation)

Marketplace:
  [ ] CreateListingForm (10 fields, validation)
  [ ] OrderCheckoutForm (5 fields, validation)
  [ ] ReviewForm (3 fields + rating, validation)

Kixikila:
  [ ] CreateGroupForm (8 fields, validation)
  [ ] JoinGroupForm (2 fields, validation)
  [ ] ContributionForm (2 fields, validation)

Target: 100% type-safe, no runtime errors
```

#### Validation Schemas
```typescript
// frontend/src/validations/schemas.ts
import * as yup from 'yup';

export const enrollmentSchema = yup.object().shape({
  program_id: yup.number().required('Program required'),
  payment_method: yup.string().oneOf(['card', 'transfer']).required(),
});

export const createListingSchema = yup.object().shape({
  title: yup.string().min(10).max(200).required(),
  description: yup.string().min(20).max(5000).required(),
  price: yup.number().positive().required(),
  category: yup.number().required(),
  location: yup.string().required(),
});

// ... more schemas
```

### SEMANA 4: Testing & Polish (Dec 31-Jan 4)

#### Testing Coverage
```
Unit Tests (Jest):
  [ ] Services: 85%+ coverage
  [ ] Stores: 80%+ coverage
  [ ] Utils: 90%+ coverage

Integration Tests (RTL):
  [ ] Pages: smoke tests (all render)
  [ ] Forms: submission flow
  [ ] Auth: protected routes

E2E Tests (Cypress):
  [ ] Login flow
  [ ] Create listing
  [ ] Enroll program
  [ ] Create group & join

Target: 60%+ overall coverage
```

#### Performance Optimization
```
[ ] Code splitting: React.lazy() on pages
[ ] Image optimization: next-gen formats
[ ] Bundle analysis: check for large deps
[ ] Lazy loading: infinite scroll on lists
[ ] Caching: 24h for categories/static data
```

#### Accessibility & i18n
```
[ ] WCAG 2.1 AA compliance
[ ] Screen reader testing
[ ] Keyboard navigation
[ ] i18n: PT-PT, EN-US, PT-AO (dialectos)
[ ] RTL support (if needed)
```

---

## 🔄 SINCRONIZAÇÃO BACKEND-FRONTEND

### Endpoint-to-Component Mapping

```markdown
## Certifications

### GET /api/v2/certifications/categories/
Frontend:
  - useCertificationsStore.fetchCategories()
  - CategoriesGrid component
  - Category filter dropdowns

### GET /api/v2/certifications/programs/
Frontend:
  - useCertificationsStore.fetchPrograms()
  - ProgramsListPage
  - Program cards with filters

### POST /api/v2/certifications/enrollments/
Frontend:
  - enrollmentForm.onSubmit()
  - useCertificationsStore.enrollProgram()
  - Success toast & redirect

### GET /api/v2/certifications/enrollments/my_enrollments/
Frontend:
  - MyEnrollmentsPage
  - useCertificationsStore.fetchMyEnrollments()
  - Enrollment progress tracking

---

## Marketplace

### GET /api/v2/marketplace/listings/?category=X&search=Y&price_min=Z
Frontend:
  - ListingFilters component
  - SearchServices hook
  - ServiceListingCard grid

### POST /api/v2/marketplace/listings/
Frontend:
  - CreateListingForm
  - ProviderDashboard
  - Success notification

### POST /api/v2/marketplace/listings/{id}/mark_featured/
Frontend:
  - Admin only button
  - useMarketplaceStore.markFeatured()
  - Visual feedback

---

## Kixikila

### GET /api/v2/kixikila/groups/
Frontend:
  - GroupsListPage
  - GroupCard components
  - Filter by status

### POST /api/v2/kixikila/groups/{id}/join/
Frontend:
  - JoinGroupModal
  - useKixikilaStore.joinGroup()
  - Membership confirmation

### POST /api/v2/kixikila/contributions/
Frontend:
  - ContributionForm
  - Group detail page
  - Payment method selection
```

---

## ✅ QUALITY CHECKLIST

### Backend Requirements
- [ ] All 3 apps endpoints documented (Swagger/OpenAPI)
- [ ] Error responses standardized (JSON format)
- [ ] Pagination working on all list endpoints
- [ ] Filtering & search on all list endpoints
- [ ] CORS configured for frontend domain
- [ ] Rate limiting implemented (optional)
- [ ] Request logging for debugging

### Frontend Requirements
- [ ] All types generated from OpenAPI spec
- [ ] API client supports all HTTP methods
- [ ] Error boundaries on all pages
- [ ] Loading states on all async operations
- [ ] Form validation matches backend validation
- [ ] Offline fallback (localStorage cache)
- [ ] Session timeout handling (401 → login)

### Integration Requirements
- [ ] Local: Frontend connects to localhost:8000 ✅
- [ ] Staging: Frontend connects to staging.acredita.ao
- [ ] Production: Frontend connects to api.acredita.ao
- [ ] Environment variables correctly configured
- [ ] CORS headers working both ways
- [ ] JWT refresh token flow tested
- [ ] Concurrent requests handled (AbortController)

---

## 📈 SUCCESS METRICS

| Métrica | Target | Verificação |
|---------|--------|-------------|
| **Type Coverage** | 95%+ | `tsc --noEmit` |
| **API Endpoint Coverage** | 100% | All endpoints used |
| **Test Coverage** | 60%+ | Jest coverage report |
| **Bundle Size** | < 500KB | Webpack analyzer |
| **Lighthouse Score** | 85+ | Performance audit |
| **API Response Time** | < 200ms p95 | Monitoring |
| **Error Rate** | < 0.5% | Sentry tracking |
| **User Session Length** | > 15 min avg | Analytics |

---

## 🚀 DEPLOYMENT TIMELINE

```
Week 1 (Dec 10-14):
  - Backend ready: ✅ (staging)
  - Frontend Auth: 🔨 (in progress)
  - Integration: 🟡 (partial)

Week 2 (Dec 17-21):
  - Frontend Pages: 🔨 (in progress)
  - Component Library: 🟡 (partial)
  - E2E Tests: 🟡 (partial)

Week 3 (Dec 24-28):
  - Forms & Validation: 🔨 (in progress)
  - Polish & Optimization: 🟡 (partial)
  - Security Review: 🟡 (partial)

Week 4 (Dec 31-Jan 4):
  - Testing & Coverage: 🔨 (in progress)
  - Production Ready: ✅ (target)
  - Go-live: 🚀 (Jan 5)
```

---

## 📞 HANDOFF CRITERIA

**From Backend to Frontend**:
1. ✅ All 3 apps have working endpoints
2. ✅ API documentation (Swagger) complete
3. ✅ Staging environment deployed
4. ✅ Test data available
5. ✅ Error handling documented

**From Frontend to QA**:
1. ✅ All pages rendering without errors
2. ✅ Forms submitting successfully
3. ✅ Data displaying correctly
4. ✅ Authentication flow working
5. ✅ Mobile responsive

**Go-Live Criteria**:
1. ✅ Backend & frontend staging tested
2. ✅ Production secrets configured
3. ✅ Monitoring & alerts active
4. ✅ Rollback procedure tested
5. ✅ Team trained on support

---

**Created**: 9 Dez 2025, 23:45 UTC  
**Next Review**: 10 Dez 2025, 08:00 UTC (Code Review + Frontend Kickoff)  
**Owner**: Backend Lead + Frontend Lead

