# Documentação: Implementação Harmoniosa Frontend/Backend - Acredita

## 🎯 Objetivo
Criar uma plataforma sustentável, escalável e com UX/UI avançada alinhada ao plano de negócio Acredita.

---

## ✅ Implementações Concluídas

### Backend - Permissões e Endpoints
1. **Endpoints Públicos** (AllowAny):
   - `/api/seasons/` - Lista temporadas (SeasonViewSet)
   - `/api/sponsors/` - Lista patrocinadores ativos
   - `/api/donations/campaigns/` - Campanhas de doação ativas
   - `/api/ads/active/` - Anúncios ativos
   - `/api/content/videos/` - Vídeos educacionais
   - `/api/participants/dashboard/` - Métricas gerais públicas
   - `/api/games/simulator/simulators/` - Lista simuladores

2. **Estrutura de Dados**:
   - Sponsors: URLField para logo (sem Pillow)
   - Content: Video/Podcast/Course com thumbnails URLField
   - Migrations aplicadas para sponsors, content, donations

3. **Rotas Alinhadas**:
   - `/api/ads/` e `/api/ads/active/` sem duplicação
   - `/api/seasons/` registrado com basename correto
   - Simuladores em `/api/games/simulator/simulators/`

### Frontend - Arquitetura e Componentes

#### 1. **HomePage Refatorada** (`src/pages/HomePage.tsx`)
**Ordem Lógica Implementada**:
```
Hero Banner
  ↓
Value Proposition Cards (3 cards)
  ↓
Temporada em Destaque (SectionWrapper)
  ↓
Quiz Challenge (lazy-loaded)
  ↓
Top Participantes/Leaderboard (SectionWrapper)
  ↓
CTA Principal (antes conteúdo pesado)
  ↓
Conteúdo Lazy-Loaded:
  - GamesSection
  - VideosSection
  - AdsSection
  - SponsorsSection
  - FundraisingSection
```

**Benefícios**:
- First Contentful Paint otimizado (Hero + Value Props)
- Dados críticos priorizados (Temporada, Leaderboard)
- Conteúdo pesado diferido (Suspense)
- Redução de 1.41 kB no bundle (237.84 kB gzip)

#### 2. **SectionWrapper** (`src/components/layout/SectionWrapper.tsx`)
**Componente Reutilizável** para normalizar estados:

```typescript
<SectionWrapper
  title="Título da Seção"
  subtitle="Descrição"
  loading={isLoading}
  error={error}
  empty={!data || data.length === 0}
  emptyIcon={<Icon />}
  emptyTitle="Mensagem vazia"
  emptyAction={<Button />}
  onRetry={handleRetry}
>
  {/* Conteúdo */}
</SectionWrapper>
```

**Estados Gerenciados**:
- Loading → LoadingSpinner
- Error → Card vermelho com retry
- Empty → Fallback com ícone/mensagem/ação
- Content → Renderização normal

#### 3. **OptimizedImage** (`src/components/common/OptimizedImage.tsx`)
```typescript
<OptimizedImage
  src={imageUrl}
  alt="Descrição"
  lazy={true}
  width={200}
  height={200}
  fallbackIcon={<ImageOff />}
/>
```

**Features**:
- `loading="lazy"` nativo
- Skeleton durante carregamento
- Fallback automático em erro
- Dimensões fixas para evitar layout shift

#### 4. **Design Tokens** (`src/styles/designTokens.ts`)
**Centralização de Tokens**:
- Cores: primary, secondary, grays (50-900), semantic
- Tipografia: heading (h1-h6), body (lg/base/sm/xs), weight
- Espaçamento: xs → 3xl (4px → 64px)
- Border Radius: sm → full
- Sombras: 3 níveis (sm, md, lg)
- Animações: fade-in, slide-up, pulse, bounce, shake
- Breakpoints: sm → 2xl
- Z-index: scale consistente

**Uso Futuro**:
```typescript
import { designTokens } from '../styles/designTokens';
className={designTokens.typography.heading.h2}
```

#### 5. **Lazy Loading Strategy**
```typescript
const GamesSection = lazy(() => import('../components/GamesSection'));
const VideosSection = lazy(() => import('../components/VideosSection'));

<Suspense fallback={<div className="py-12" />}>
  <GamesSection />
</Suspense>
```

**Chunks Criados**:
- 7 chunks isolados para carregamento sob demanda
- Redução de tempo de carregamento inicial
- Melhor performance em conexões lentas

#### 6. **Acessibilidade (A11y)**
**Melhorias**:
- Roles redundantes removidos (`aside role="complementary"` → `aside`)
- `aria-label` adequado em seções principais
- Skip navigation link funcional
- Foco visível em elementos interativos
- aria-live="polite" apenas onde necessário

---

## 📋 Próximos Passos Recomendados

### 1. **Aplicar SectionWrapper em Outras Páginas** 🔄
**Páginas-alvo**:
- `ParticipantsPage.tsx` - Lista de participantes
- `SeasonsPage.tsx` - Temporadas
- `RankingPage.tsx` - Classificação
- `GamesPage.tsx` - Jogos
- `SimuladoresPage.tsx` - Simuladores
- `ContentPage.tsx` - Conteúdos

**Exemplo de Migração**:
```typescript
// Antes
{loading && <LoadingSpinner />}
{error && <div className="error">{error}</div>}
{!data.length && <div>Vazio</div>}

// Depois
<SectionWrapper
  loading={loading}
  error={error}
  empty={!data || data.length === 0}
>
  {data.map(...)}
</SectionWrapper>
```

### 2. **Implementar Feature Flags Frontend** 🚩
**Objetivo**: Controlar visibilidade de módulos (certifications, marketplace, kixikila)

**Criar** `src/contexts/FeatureFlagsContext.tsx`:
```typescript
interface FeatureFlags {
  certifications: boolean;
  marketplace: boolean;
  kixikila: boolean;
  advancedPayments: boolean;
}

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>({
    certifications: false,
    marketplace: false,
    kixikila: false,
    advancedPayments: false,
  });

  useEffect(() => {
    // Fetch do backend /api/config/features/
    mcpFetch('/api/config/features/').then(({data}) => {
      setFlags(data);
    });
  }, []);

  return flags;
};
```

**Uso**:
```typescript
const flags = useFeatureFlags();

{flags.marketplace && <Route path="/marketplace" element={<MarketplacePage />} />}
```

### 3. **Normalizar Imagens com OptimizedImage** 🖼️
**Migrar componentes**:
- `ParticipantsPage` → foto de perfil
- `SponsorsSection` → logos
- `VideosSection` → thumbnails
- `SeasonsPage` → poster_image
- Todos os cards com imagens

**Padrão**:
```typescript
<OptimizedImage
  src={participant.foto_perfil}
  alt={participant.nome}
  width={80}
  height={80}
  className="rounded-full"
  lazy={true}
/>
```

### 4. **Performance Audit & Otimização** ⚡
**Executar Lighthouse**:
```bash
npm run build
npx lighthouse http://localhost:3000 --view
```

**Métricas-alvo**:
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

**Otimizações Esperadas**:
- Adicionar `preload` para fontes críticas
- Implementar Service Worker (PWA)
- Otimizar imagens (WebP com fallback)
- Adicionar meta tags Open Graph

### 5. **Criar Documentação de Componentes** 📚
**Storybook ou Docusaurus**:
```bash
npm install --save-dev @storybook/react
npx storybook init
```

**Documentar**:
- SectionWrapper (props, exemplos, estados)
- OptimizedImage (lazy-load, fallback)
- Button variants (primary, outline, ghost)
- Card variants (default, hover, focus)

### 6. **Testes Automatizados** 🧪
**Jest + React Testing Library**:

`src/components/layout/__tests__/SectionWrapper.test.tsx`:
```typescript
describe('SectionWrapper', () => {
  it('shows loading spinner when loading', () => {
    render(<SectionWrapper loading={true} />);
    expect(screen.getByText(/A carregar.../i)).toBeInTheDocument();
  });

  it('shows error message with retry', () => {
    const onRetry = jest.fn();
    render(<SectionWrapper error="Erro" onRetry={onRetry} />);
    fireEvent.click(screen.getByText(/Tentar Novamente/i));
    expect(onRetry).toHaveBeenCalled();
  });
});
```

**Hooks Testing**:
```typescript
describe('useVideos', () => {
  it('fetches videos and returns data', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useVideos());
    await waitForNextUpdate();
    expect(result.current.videos).toHaveLength(3);
  });
});
```

### 7. **Backend: Adicionar Endpoint de Feature Flags** 🔌
**Criar** `backend/core/views.py`:
```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.conf import settings

class FeatureFlagsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(settings.ACTIVE_FEATURES)
```

**Registrar em** `backend/acredita_backend/urls.py`:
```python
path('api/config/features/', FeatureFlagsView.as_view(), name='feature-flags'),
```

### 8. **Implementar Caching Estratégico** 💾
**Backend** (`settings.py`):
```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': config('REDIS_URL', default='redis://127.0.0.1:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'acredita',
        'TIMEOUT': 300,  # 5 minutos
    }
}
```

**Views com Cache**:
```python
from django.views.decorators.cache import cache_page

class SponsorViewSet(viewsets.ReadOnlyModelViewSet):
    @method_decorator(cache_page(60 * 15))  # 15 min
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
```

**Frontend** - SWR:
```bash
npm install swr
```

```typescript
import useSWR from 'swr';

const { data, error } = useSWR('/api/sponsors/', fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 60000, // 1 min
});
```

### 9. **Monitoring & Observabilidade** 📊
**Frontend - Sentry**:
```bash
npm install @sentry/react
```

```typescript
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

**Backend - Logging Estruturado**:
```python
LOGGING = {
    'version': 1,
    'handlers': {
        'json_file': {
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'acredita.json',
            'formatter': 'json',
        },
    },
    'formatters': {
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
        },
    },
}
```

### 10. **CI/CD Pipeline** 🚀
**GitHub Actions** (`.github/workflows/ci.yml`):
```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm run build
      - run: cd frontend && npm test

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run ESLint
        run: cd frontend && npm run lint

  deploy:
    needs: [test, lint]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: echo "Deploy!"
```

---

## 🎨 Padrões de Design Estabelecidos

### Componentes
- **Card**: `shadow-lg`, `rounded-lg`, `border`, `transition-transform hover:scale-105`
- **Button Primary**: `bg-acredita-primary`, `hover:bg-acredita-secondary`, `focus:ring-2`
- **Button Outline**: `border-2`, `border-acredita-primary`, `hover:bg-acredita-primary/10`
- **Section**: `py-12`, `max-w-7xl mx-auto px-4`

### Tipografia
- **H1**: `text-4xl md:text-5xl lg:text-6xl font-bold`
- **H2**: `text-3xl md:text-4xl font-bold`
- **Body**: `text-base leading-normal text-gray-700`
- **Small**: `text-sm text-gray-600`

### Spacing
- **Section Gap**: `py-12` ou `py-16`
- **Card Padding**: `p-6` ou `p-8`
- **Grid Gap**: `gap-6` ou `gap-8`

### Cores Semânticas
- **Primary**: `#FF6B35` (Orange)
- **Secondary**: `#E63946` (Red)
- **Success**: `#2A9D8F` (Green)
- **Warning**: `#F4A261` (Orange)
- **Error**: `#E76F51` (Red)

---

## 📈 Métricas de Sucesso

### Performance
- [x] Build < 240 kB (gzip) ✓ 237.84 kB
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse Performance > 90

### Acessibilidade
- [x] Roles semânticos corretos ✓
- [x] Skip navigation ✓
- [ ] Contraste mínimo WCAG AA
- [ ] Navegação por teclado completa

### Escalabilidade
- [x] Componentes reutilizáveis ✓
- [x] Design tokens centralizados ✓
- [x] Lazy loading implementado ✓
- [ ] Feature flags operacionais

### Sustentabilidade
- [x] Permissões públicas alinhadas ✓
- [x] Endpoints consistentes ✓
- [ ] Cache implementado
- [ ] Monitoring ativo

---

## 🔧 Comandos Úteis

```bash
# Frontend
cd frontend
npm run build          # Build produção
npm start              # Dev server
npm test               # Testes
npm run lint           # ESLint

# Backend
cd ..
python manage.py runserver          # Dev server
python manage.py test               # Testes
python manage.py makemigrations     # Criar migrations
python manage.py migrate            # Aplicar migrations

# Performance
npx lighthouse http://localhost:3000 --view
npm run analyze        # Análise de bundle (se configurado)
```

---

## 📝 Checklist Final

### Crítico (Fazer Agora)
- [ ] Reiniciar servidor Django (aplicar permissões)
- [ ] Testar HomePage sem autenticação
- [ ] Validar endpoints públicos (200 OK)
- [ ] Confirmar lazy-loading funciona

### Alta Prioridade (Esta Semana)
- [ ] Aplicar SectionWrapper em 3 páginas principais
- [ ] Migrar 5 componentes para OptimizedImage
- [ ] Implementar feature flags context
- [ ] Executar Lighthouse audit

### Média Prioridade (Próximas 2 Semanas)
- [ ] Criar endpoint /api/config/features/
- [ ] Implementar cache Redis backend
- [ ] Adicionar SWR no frontend
- [ ] Escrever 10 testes unitários

### Baixa Prioridade (Backlog)
- [ ] Configurar Storybook
- [ ] Implementar Service Worker (PWA)
- [ ] Adicionar Sentry monitoring
- [ ] Setup CI/CD pipeline

---

**Última Atualização**: 10 de Dezembro de 2025  
**Versão**: 1.0.0  
**Status**: ✅ Fase 1 Concluída - Pronto para Fase 2
