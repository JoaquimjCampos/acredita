# 🚀 IMPLEMENTAÇÃO PRÁTICA: Reorganização da Homepage & Navegação

**Data**: Dezembro 2025  
**Objetivo**: Passo-a-passo de implementação da reorganização  
**Tempo Estimado**: 5-7 dias de desenvolvimento

---

## 📋 CHECKLIST IMPLEMENTAÇÃO

### FASE 1: Navigation Config Refactor (Dia 1)

- [ ] **1.1** - Revisar `navigationConfig.ts` atual
- [ ] **1.2** - Expandir config com prioridades e visibilidade
- [ ] **1.3** - Adicionar categoria "core" vs "community"
- [ ] **1.4** - Teste de compilação TypeScript

### FASE 2: Header & Mobile Menu (Dia 2)

- [ ] **2.1** - Atualizar Header.tsx para usar nova config
- [ ] **2.2** - Reorganizar itens por prioridade
- [ ] **2.3** - Atualizar MobileMenu.tsx
- [ ] **2.4** - Teste em mobile + desktop

### FASE 3: Homepage Refactor (Dia 3-4)

- [ ] **3.1** - Separar HomePage.tsx em componentes
- [ ] **3.2** - Criar HeroSection component
- [ ] **3.3** - Criar ValuePropositionSection component
- [ ] **3.4** - Criar AuthenticatedDashboardSection component
- [ ] **3.5** - Remover seções não-core (Games, Ads, Sponsors)
- [ ] **3.6** - Teste de performance

### FASE 4: Route Consolidation (Dia 4-5)

- [ ] **4.1** - Adicionar redirects para rotas antigas
- [ ] **4.2** - Atualizar todos os links internos
- [ ] **4.3** - Adicionar mensagens deprecation (logs)
- [ ] **4.4** - Teste de navegação end-to-end

### FASE 5: Dashboard Refactor (Dia 5-6)

- [ ] **5.1** - Reorganizar DashboardPage
- [ ] **5.2** - Adicionar progress cards
- [ ] **5.3** - Adicionar quick actions
- [ ] **5.4** - Integração com dados reais

### FASE 6: Testing & Optimization (Dia 6-7)

- [ ] **6.1** - Teste de acessibilidade (axe DevTools)
- [ ] **6.2** - Teste de performance (Lighthouse)
- [ ] **6.3** - Teste mobile (vários browsers)
- [ ] **6.4** - Build e validação de tamanho

---

## 💻 CÓDIGO IMPLEMENTAÇÃO

### PASSO 1: Expandir navigationConfig.ts

```typescript
// src/config/navigationConfig.ts

import { FC, SVGProps } from 'react';
import {
  Home,
  GraduationCap,
  ShoppingBag,
  Users,
  Gamepad2,
  Trophy,
  LayoutDashboard,
  User,
  BookOpen,
  Newspaper,
  HelpCircle,
  Settings
} from 'lucide-react';

export type IconType = FC<SVGProps<SVGSVGElement>>;

export type NavigationCategory = 'core' | 'community' | 'user' | 'content' | 'admin';

export interface NavigationVisibility {
  header: boolean;
  mobile: boolean;
  sidebar: boolean;
  authenticated?: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: IconType;
  category: NavigationCategory;
  visibility: NavigationVisibility;
  requiresAuth: boolean;
  priority: number;
  title?: string; // For accessibility
}

/**
 * SINGLE SOURCE OF TRUTH for all navigation across the app
 * 
 * Prioridade:
 * 1-3: Core business (Certificações, Marketplace, Kixikila)
 * 4-6: Community (Games, Rankings, etc)
 * 7-9: User (Dashboard, Profile)
 * 10+: Content, Admin, etc
 */
export const NAVIGATION_CONFIG: NavigationItem[] = [
  // ===== CORE BUSINESS =====
  {
    id: 'certifications',
    label: 'Certificações',
    path: '/certifications',
    icon: GraduationCap,
    category: 'core',
    visibility: { header: true, mobile: true, sidebar: true, authenticated: false },
    requiresAuth: false,
    priority: 1,
    title: 'Certificações Profissionais - INEFOB'
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    path: '/marketplace',
    icon: ShoppingBag,
    category: 'core',
    visibility: { header: true, mobile: true, sidebar: true, authenticated: false },
    requiresAuth: false,
    priority: 2,
    title: 'Marketplace de Serviços'
  },
  {
    id: 'kixikila',
    label: 'Kixikila',
    path: '/kixikila',
    icon: Users,
    category: 'core',
    visibility: { header: true, mobile: true, sidebar: true, authenticated: false },
    requiresAuth: false,
    priority: 3,
    title: 'Poupança Rotativa - Kixikila'
  },

  // ===== COMMUNITY =====
  {
    id: 'games',
    label: 'Jogos & Quiz',
    path: '/community/games',
    icon: Gamepad2,
    category: 'community',
    visibility: { header: true, mobile: true, sidebar: false, authenticated: true },
    requiresAuth: true,
    priority: 4,
    title: 'Jogos, Quiz e Simuladores'
  },
  {
    id: 'rankings',
    label: 'Rankings',
    path: '/community/rankings',
    icon: Trophy,
    category: 'community',
    visibility: { header: false, mobile: true, sidebar: true, authenticated: true },
    requiresAuth: true,
    priority: 5,
    title: 'Leaderboards e Rankings'
  },

  // ===== USER AUTHENTICATED =====
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    category: 'user',
    visibility: { header: false, mobile: true, sidebar: true, authenticated: true },
    requiresAuth: true,
    priority: 10,
    title: 'Meu Dashboard'
  },
  {
    id: 'profile',
    label: 'Meu Perfil',
    path: '/perfil',
    icon: User,
    category: 'user',
    visibility: { header: false, mobile: true, sidebar: true, authenticated: true },
    requiresAuth: true,
    priority: 11,
    title: 'Meu Perfil'
  },

  // ===== CONTENT =====
  {
    id: 'blog',
    label: 'Blog',
    path: '/blog',
    icon: Newspaper,
    category: 'content',
    visibility: { header: false, mobile: true, sidebar: false, authenticated: false },
    requiresAuth: false,
    priority: 20,
    title: 'Blog e Notícias'
  },
  {
    id: 'help',
    label: 'Ajuda',
    path: '/help',
    icon: HelpCircle,
    category: 'content',
    visibility: { header: false, mobile: true, sidebar: false, authenticated: false },
    requiresAuth: false,
    priority: 21,
    title: 'Centro de Ajuda'
  },

  // ===== ADMIN =====
  {
    id: 'admin',
    label: 'Administração',
    path: '/admin',
    icon: Settings,
    category: 'admin',
    visibility: { header: false, mobile: false, sidebar: true, authenticated: true },
    requiresAuth: true,
    priority: 30,
    title: 'Painel de Administração'
  }
];

/**
 * Helper functions para obter subsets da navegação
 */
export function getHeaderNavItems(isAuthenticated: boolean): NavigationItem[] {
  return NAVIGATION_CONFIG
    .filter(item => {
      // Se item tem authenticated check, respeitar
      if (item.visibility.authenticated !== undefined) {
        return item.visibility.authenticated === isAuthenticated;
      }
      return item.visibility.header;
    })
    .sort((a, b) => a.priority - b.priority);
}

export function getMobileMenuItems(isAuthenticated: boolean): NavigationItem[] {
  return NAVIGATION_CONFIG
    .filter(item => {
      if (item.visibility.authenticated !== undefined) {
        return item.visibility.authenticated === isAuthenticated;
      }
      return item.visibility.mobile;
    })
    .sort((a, b) => a.priority - b.priority);
}

export function getSidebarItems(isAuthenticated: boolean): NavigationItem[] {
  return NAVIGATION_CONFIG
    .filter(item => {
      if (item.visibility.authenticated !== undefined) {
        return item.visibility.authenticated === isAuthenticated;
      }
      return item.visibility.sidebar;
    })
    .sort((a, b) => a.priority - b.priority);
}

export function getCoreNavItems(): NavigationItem[] {
  return NAVIGATION_CONFIG
    .filter(item => item.category === 'core')
    .sort((a, b) => a.priority - b.priority);
}

export function getCommunityNavItems(): NavigationItem[] {
  return NAVIGATION_CONFIG
    .filter(item => item.category === 'community')
    .sort((a, b) => a.priority - b.priority);
}
```

---

### PASSO 2: Atualizar Layout.tsx (Header)

```typescript
// src/components/layout/Layout.tsx - Trecho do Header

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  // Use navigationConfig helpers
  const headerNavItems = getHeaderNavItems(isAuthenticated);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-acredita-primary" />
            <span className="font-bold text-lg hidden sm:inline">Acredita</span>
          </Link>

          {/* Desktop Navigation - CORE ITEMS ONLY */}
          <nav className="hidden lg:flex space-x-6" aria-label="Navegação principal">
            {headerNavItems.map(item => (
              <NavLink
                key={item.id}
                to={item.path}
                icon={item.icon}
                text={item.label}
                title={item.title}
              />
            ))}
          </nav>

          {/* Right Side: Auth + Theme */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Auth Buttons */}
            {!isAuthenticated ? (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                  {t('login')}
                </Button>
                <Button size="sm" onClick={() => navigate('/registo')}>
                  {t('register')}
                </Button>
              </>
            ) : (
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="text-gray-600 hover:text-gray-900"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2"
              aria-label="Abrir menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// NavLink component (atualizado)
const NavLink: React.FC<NavLinkProps> = ({ to, icon: Icon, text, title }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <Link
      to={to}
      title={title}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
        isActive
          ? 'bg-acredita-primary text-white'
          : 'text-gray-700 hover:bg-gray-100'
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{text}</span>
    </Link>
  );
};
```

---

### PASSO 3: Criar Nova Estrutura HomePage

```typescript
// src/pages/HomePage.tsx - NOVA ESTRUTURA

import React, { Suspense, lazy, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common';
import { Layout } from '../components/layout/Layout';
import { Heart, Star, Trophy, ChevronRight, User, ShoppingBag, GraduationCap, Users } from 'lucide-react';
import FeedbackWidget from '../components/FeedbackWidget';

// Lazy components
const AuthenticatedDashboardSection = lazy(() => 
  import('../components/home/AuthenticatedDashboardSection')
);
const FeaturedContentSection = lazy(() =>
  import('../components/home/FeaturedContentSection')
);

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleNavigate = useCallback((path: string) => navigate(path), [navigate]);
  const handleGetStarted = useCallback(
    () => handleNavigate(isAuthenticated ? '/dashboard' : '/registo'),
    [handleNavigate, isAuthenticated]
  );

  return (
    <Layout>
      {/* Floating Feedback */}
      <div className="fixed bottom-8 right-8 z-50">
        <FeedbackWidget />
      </div>

      {/* Skip to main */}
      <a
        href="#main-content"
        className="skip-nav-link absolute left-2 top-2 z-50 bg-acredita-primary text-white px-3 py-2 rounded focus:translate-y-0 -translate-y-full focus:outline-none"
      >
        Saltar para o conteúdo principal
      </a>

      <main id="main-content" className="flex-1">
        {/* ===== SECTION 1: HERO ===== */}
        <HeroSection onCTA={handleGetStarted} isAuthenticated={isAuthenticated} />

        {/* ===== SECTION 2: VALUE PROPOSITION ===== */}
        <ValuePropositionSection onNavigate={handleNavigate} />

        {/* ===== SECTION 3: AUTHENTICATED DASHBOARD ===== */}
        {isAuthenticated && (
          <Suspense fallback={<div className="h-96 bg-gray-100" />}>
            <AuthenticatedDashboardSection onNavigate={handleNavigate} />
          </Suspense>
        )}

        {/* ===== SECTION 4: UNAUTHENTICATED SOCIAL PROOF ===== */}
        {!isAuthenticated && <SocialProofSection />}

        {/* ===== SECTION 5: FEATURED CONTENT ===== */}
        <Suspense fallback={<div className="h-64 bg-gray-100" />}>
          <FeaturedContentSection />
        </Suspense>
      </main>
    </Layout>
  );
};

// ===== HERO SECTION =====
interface HeroSectionProps {
  onCTA: () => void;
  isAuthenticated: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onCTA, isAuthenticated }) => (
  <section className="relative bg-gradient-to-br from-acredita-primary via-acredita-secondary to-purple-600 min-h-[60vh] flex items-center justify-center">
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white opacity-10 rounded-full blur-3xl" />
    </div>

    <div className="relative max-w-4xl mx-auto px-4 py-16 text-center text-white">
      <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
        Acredita em Ti
      </h1>
      <p className="text-xl md:text-2xl mb-8 opacity-95 max-w-2xl mx-auto animate-fade-in-delay">
        {isAuthenticated
          ? 'Bem-vindo de volta! Continua sua jornada de crescimento.'
          : 'Crie, Venda, Poupehem. Transforme sua comunidade.'}
      </p>

      {!isAuthenticated && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button
            size="lg"
            onClick={onCTA}
            className="bg-white text-acredita-primary hover:bg-gray-100"
          >
            Começar Agora
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
            className="text-white border-white hover:bg-white/10"
          >
            Saber Mais
          </Button>
        </div>
      )}

      {/* TRUST INDICATORS */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm opacity-90">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span>1000+ Empreendedores</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          <span>50+ Histórias de Sucesso</span>
        </div>
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          <span>100% Gratuito</span>
        </div>
      </div>
    </div>
  </section>
);

// ===== VALUE PROPOSITION =====
interface ValuePropositionSectionProps {
  onNavigate: (path: string) => void;
}

const ValuePropositionSection: React.FC<ValuePropositionSectionProps> = ({ onNavigate }) => (
  <section className="py-16 bg-white" aria-labelledby="value-prop-heading">
    <div className="max-w-6xl mx-auto px-4">
      <h2 id="value-prop-heading" className="text-3xl font-bold text-center mb-12">
        Os 3 Pilares do Acredita
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Certificações */}
        <div className="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onNavigate('/certifications')}>
          <GraduationCap className="h-12 w-12 text-orange-600 mb-4" />
          <h3 className="text-xl font-bold mb-2 text-orange-900">Certificações</h3>
          <p className="text-orange-800 mb-4">
            Profissionais formalizados com certificação INEFOB reconhecida.
          </p>
          <div className="text-sm text-orange-700 space-y-1">
            <div>✓ Mais confiança no marketplace</div>
            <div>✓ Aumento de renda</div>
            <div>✓ Reconhecimento formal</div>
          </div>
          <Button
            size="sm"
            className="mt-6 bg-orange-600 hover:bg-orange-700 w-full"
            onClick={() => onNavigate('/certifications')}
          >
            Explorar
          </Button>
        </div>

        {/* Marketplace */}
        <div className="group bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-8 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onNavigate('/marketplace')}>
          <ShoppingBag className="h-12 w-12 text-cyan-600 mb-4" />
          <h3 className="text-xl font-bold mb-2 text-cyan-900">Marketplace</h3>
          <p className="text-cyan-800 mb-4">
            Venda seus serviços ou encontre profissionais confiáveis.
          </p>
          <div className="text-sm text-cyan-700 space-y-1">
            <div>✓ Sem intermediários</div>
            <div>✓ Clientes verificados</div>
            <div>✓ Pagamento seguro</div>
          </div>
          <Button
            size="sm"
            className="mt-6 bg-cyan-600 hover:bg-cyan-700 w-full"
            onClick={() => onNavigate('/marketplace')}
          >
            Explorar
          </Button>
        </div>

        {/* Kixikila */}
        <div className="group bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-8 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onNavigate('/kixikila')}>
          <Users className="h-12 w-12 text-violet-600 mb-4" />
          <h3 className="text-xl font-bold mb-2 text-violet-900">Kixikila</h3>
          <p className="text-violet-800 mb-4">
            Poupança coletiva com amigos para crescimento compartilhado.
          </p>
          <div className="text-sm text-violet-700 space-y-1">
            <div>✓ Capital comunitário</div>
            <div>✓ Sem juros abusivos</div>
            <div>✓ Confiança & transparência</div>
          </div>
          <Button
            size="sm"
            className="mt-6 bg-violet-600 hover:bg-violet-700 w-full"
            onClick={() => onNavigate('/kixikila')}
          >
            Explorar
          </Button>
        </div>
      </div>
    </div>
  </section>
);

// ===== SOCIAL PROOF =====
const SocialProofSection: React.FC = () => (
  <section className="py-16 bg-gray-50" aria-labelledby="social-proof-heading">
    <div className="max-w-6xl mx-auto px-4">
      <h2 id="social-proof-heading" className="text-3xl font-bold text-center mb-12">
        Histórias de Sucesso
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            name: 'João Silva',
            role: 'Motoqueiro',
            story: 'Certificado e ganhando 3x mais',
            avatar: '👨‍💼'
          },
          {
            name: 'Maria Santos',
            role: 'Cabeleireira',
            story: 'Expandiu negócio via marketplace',
            avatar: '👩‍💼'
          },
          {
            name: 'Grupo Amigos',
            role: 'Kixikila',
            story: 'Juntou AOA 100K em 6 meses',
            avatar: '👥'
          }
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-4xl mb-3">{item.avatar}</div>
            <h3 className="font-bold mb-1">{item.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{item.role}</p>
            <p className="text-acredita-primary font-semibold">{item.story}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HomePage;
```

---

### PASSO 4: Criar AuthenticatedDashboardSection

```typescript
// src/components/home/AuthenticatedDashboardSection.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, LoadingSpinner } from '../common';
import { GraduationCap, ShoppingBag, Users, Plus, BookOpen } from 'lucide-react';

interface DashboardItemProps {
  icon: React.ElementType;
  title: string;
  count: number;
  color: string;
  actionLabel: string;
  onAction: () => void;
}

const DashboardItem: React.FC<DashboardItemProps> = ({
  icon: Icon,
  title,
  count,
  color,
  actionLabel,
  onAction
}) => (
  <Card className="p-6 bg-gradient-to-br hover:shadow-lg transition-all">
    <div className="flex items-start justify-between">
      <div>
        <Icon className={`h-8 w-8 ${color} mb-3`} />
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <p className="text-3xl font-bold mt-2">{count}</p>
      </div>
    </div>
    <Button
      size="sm"
      className="mt-4 w-full"
      onClick={onAction}
    >
      {actionLabel}
    </Button>
  </Card>
);

interface AuthenticatedDashboardSectionProps {
  onNavigate: (path: string) => void;
}

const AuthenticatedDashboardSection: React.FC<AuthenticatedDashboardSectionProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    enrollments: 0,
    listings: 0,
    groups: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user stats from API
    const fetchStats = async () => {
      try {
        // Replace with actual API calls
        setStats({
          enrollments: 0,
          listings: 0,
          groups: 0
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  if (loading) return <LoadingSpinner />;

  return (
    <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">
            Bem-vindo de volta, {user?.first_name || user?.nome}! 👋
          </h2>
          <p className="text-gray-600">Continua sua jornada de crescimento</p>
        </div>

        {/* PROGRESS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <DashboardItem
            icon={GraduationCap}
            title="Meus Cursos"
            count={stats.enrollments}
            color="text-orange-600"
            actionLabel={stats.enrollments > 0 ? "Ver Detalhes" : "+ Inscrever-se"}
            onAction={() => onNavigate(stats.enrollments > 0 ? '/my-enrollments' : '/certifications')}
          />
          <DashboardItem
            icon={ShoppingBag}
            title="Meus Serviços"
            count={stats.listings}
            color="text-cyan-600"
            actionLabel={stats.listings > 0 ? "Gerenciar" : "+ Criar Serviço"}
            onAction={() => onNavigate(stats.listings > 0 ? '/my-marketplace' : '/marketplace/create')}
          />
          <DashboardItem
            icon={Users}
            title="Meus Grupos"
            count={stats.groups}
            color="text-violet-600"
            actionLabel={stats.groups > 0 ? "Gerenciar" : "+ Aderir"}
            onAction={() => onNavigate(stats.groups > 0 ? '/my-groups' : '/kixikila')}
          />
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white rounded-xl p-8 border border-gray-200">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Próximas Ações
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white py-3"
              onClick={() => onNavigate('/certifications')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Inscrever-se em Curso
            </Button>
            <Button
              className="bg-cyan-600 hover:bg-cyan-700 text-white py-3"
              onClick={() => onNavigate('/marketplace/create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Serviço
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white py-3"
              onClick={() => onNavigate('/kixikila')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar/Aderir Grupo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthenticatedDashboardSection;
```

---

## 🔀 ROUTE CONSOLIDATION

### Atualizar App.tsx

```typescript
// src/App.tsx - Adicionar redirects

<Routes>
  {/* Homepage */}
  <Route path="/" element={<HomePage />} />
  
  {/* Auth */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/registo" element={<RegisterPage />} />
  
  {/* CORE BUSINESS */}
  <Route path="/certifications" element={<ProtectedRoute><CertificationsPage /></ProtectedRoute>} />
  <Route path="/certifications/:id" element={<ProtectedRoute><CertificationsDetailPage /></ProtectedRoute>} />
  <Route path="/marketplace" element={<ProtectedRoute><MarketplaceListPage /></ProtectedRoute>} />
  <Route path="/marketplace/:id" element={<ProtectedRoute><MarketplaceDetailPage /></ProtectedRoute>} />
  <Route path="/kixikila" element={<ProtectedRoute><KixikilaPage /></ProtectedRoute>} />
  <Route path="/kixikila/:id" element={<ProtectedRoute><KixikilaDetailPage /></ProtectedRoute>} />
  
  {/* COMMUNITY */}
  <Route path="/community/games" element={<ProtectedRoute><GamesPage /></ProtectedRoute>} />
  <Route path="/community/games/quiz" element={<ProtectedRoute><QuizList /></ProtectedRoute>} />
  <Route path="/community/games/quiz/:id" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
  <Route path="/community/rankings" element={<ProtectedRoute><RankingPage /></ProtectedRoute>} />
  
  {/* USER */}
  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
  <Route path="/perfil" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
  <Route path="/my-enrollments" element={<ProtectedRoute><MyEnrollmentsPage /></ProtectedRoute>} />
  <Route path="/my-orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
  <Route path="/my-groups" element={<ProtectedRoute><MyGroupsPage /></ProtectedRoute>} />
  
  {/* LEGACY REDIRECTS */}
  <Route path="/participantes" element={<Navigate to="/community/participants" replace />} />
  <Route path="/participants" element={<Navigate to="/community/participants" replace />} />
  <Route path="/ranking" element={<Navigate to="/community/rankings" replace />} />
  <Route path="/classificacao" element={<Navigate to="/community/rankings" replace />} />
  <Route path="/jogos" element={<Navigate to="/community/games" replace />} />
  <Route path="/games" element={<Navigate to="/community/games" replace />} />
  <Route path="/quiz" element={<Navigate to="/community/games/quiz" replace />} />
  <Route path="/quizzes" element={<Navigate to="/community/games/quiz" replace />} />
</Routes>
```

---

## ✅ TESTES

### Test Checklist

```typescript
// __tests__/navigation.test.tsx

describe('Navigation Config', () => {
  it('should have all core items prioritized', () => {
    const coreItems = getCoreNavItems();
    expect(coreItems.length).toBe(3);
    expect(coreItems[0].priority).toBe(1);
  });

  it('should filter header items correctly', () => {
    const headerItems = getHeaderNavItems(false);
    expect(headerItems.every(item => item.visibility.header)).toBe(true);
  });

  it('should have no duplicate IDs', () => {
    const ids = NAVIGATION_CONFIG.map(item => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('HomePage', () => {
  it('should show hero and value props', () => {
    const { getByText } = render(<HomePage />);
    expect(getByText(/Acredita em Ti/i)).toBeInTheDocument();
    expect(getByText(/Certificações/i)).toBeInTheDocument();
  });

  it('should show authenticated dashboard when logged in', () => {
    // Mock useAuth
    const { getByText } = render(<HomePage />);
    expect(getByText(/Bem-vindo de volta/i)).toBeInTheDocument();
  });
});

describe('Accessibility', () => {
  it('should have proper heading hierarchy', () => {
    const { container } = render(<HomePage />);
    const headings = container.querySelectorAll('h1, h2, h3');
    expect(headings[0].tagName).toBe('H1'); // Hero h1
    expect(headings[1].tagName).toBe('H2'); // Value props h2
  });

  it('should have skip nav link', () => {
    const { getByText } = render(<HomePage />);
    expect(getByText(/Saltar para o conteúdo/i)).toBeInTheDocument();
  });
});
```

---

## 📊 MÉTRICAS DE SUCESSO

Após implementação, medir:

| Métrica | Baseline | Target | Ferramenta |
|---------|----------|--------|-----------|
| Bounce Rate | 45% | <30% | Google Analytics |
| Time to CTA | 90s | <30s | GA4 Events |
| CTR (Hero) | 8% | >15% | GA4 Events |
| Mobile Score | 65 | >85 | Lighthouse |
| Accessibility | 72 | >90 | axe DevTools |
| Bundle Size | 450KB | <400KB | webpack-bundle-analyzer |

---

## 📋 PRÓXIMAS ETAPAS

1. **Code Review** - Validar com equipe
2. **Staging Deploy** - Testar em ambiente
3. **A/B Testing** - Comparar layouts (opcional)
4. **Production Deploy** - Roll out gradualmente
5. **Analytics Review** - Monitorar métricas por 2 semanas

