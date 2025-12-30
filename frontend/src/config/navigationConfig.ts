/**
 * Navigation Configuration
 * 
 * Single source of truth for all navigation items across the app.
 * Used by Header, MobileMenu, Sidebar, and other navigation components.
 * 
 * This ensures:
 * - Consistency across all breakpoints and devices
 * - Easy to add/remove/reorder routes
 * - Centralized permission logic
 * - DRY principle (don't repeat yourself)
 */

import { FC, SVGProps } from 'react';
import {
  Home,
  Calendar,
  Trophy,
  Users,
  Vote,
  BookOpen,
  Newspaper,
  Settings,
  User,
  LayoutDashboard,
  Gamepad2
} from 'lucide-react';

export type IconType = FC<SVGProps<SVGSVGElement>>;

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: IconType;
  /** Show in header desktop navigation */
  showInHeader?: boolean;
  /** Show in mobile menu */
  showInMobileMenu?: boolean;
  /** Show in sidebar (md+) */
  showInSidebar?: boolean;
  /** Requires authentication */
  requiresAuth?: boolean;
  /** Category for grouping */
  category?: 'main' | 'community' | 'content' | 'user' | 'system';
  /** Short description for accessibility */
  title?: string;
}

/**
 * Main navigation configuration
 * All routes that appear in navigation should be defined here
 */
export const NAVIGATION_ITEMS: NavigationItem[] = [
  // MAIN - Always visible
  {
    id: 'home',
    label: 'Início',
    path: '/',
    icon: Home,
    showInHeader: true,
    showInMobileMenu: true,
    showInSidebar: false,
    category: 'main',
    title: 'Ir para a página inicial'
  },

  // COMMUNITY - Main engagement features
  {
    id: 'seasons',
    label: 'Temporadas',
    path: '/temporadas',
    icon: Calendar,
    showInHeader: true,
    showInMobileMenu: true,
    showInSidebar: false,
    category: 'community',
    title: 'Ver temporadas ativas e histórico'
  },
  {
    id: 'voting',
    label: 'Votar',
    path: '/voting',
    icon: Vote,
    showInHeader: true,
    showInMobileMenu: true,
    showInSidebar: false,
    category: 'community',
    title: 'Votar nos participantes favoritos'
  },
  {
    id: 'participants',
    label: 'Participantes',
    path: '/participantes',
    icon: Users,
    showInHeader: true,
    showInMobileMenu: true,
    showInSidebar: false,
    category: 'community',
    title: 'Ver lista de participantes'
  },
  {
    id: 'ranking',
    label: 'Ranking',
    path: '/ranking',
    icon: Trophy,
    showInHeader: true,
    showInMobileMenu: true,
    showInSidebar: false,
    category: 'community',
    title: 'Ver ranking e estatísticas'
  },

  // CONTENT - Educational and entertainment
  {
    id: 'games',
    label: 'Jogos',
    path: '/jogos',
    icon: Gamepad2,
    showInHeader: true,
    showInMobileMenu: true,
    showInSidebar: false,
    category: 'content',
    title: 'Jogar e desbloquear recompensas'
  },
  {
    id: 'content',
    label: 'Conteúdos',
    path: '/conteudos',
    icon: BookOpen,
    showInHeader: true,
    showInMobileMenu: true,
    showInSidebar: false,
    category: 'content',
    title: 'Conteúdos educacionais'
  },
  {
    id: 'blog',
    label: 'Blog',
    path: '/blog',
    icon: Newspaper,
    showInHeader: true,
    showInMobileMenu: true,
    showInSidebar: false,
    category: 'content',
    title: 'Artigos e notícias'
  },

  // SECONDARY - Advanced features
  {
    id: 'simulators',
    label: 'Simuladores',
    path: '/simuladores',
    icon: Settings,
    showInHeader: false, // Shown as dropdown or secondary
    showInMobileMenu: false, // In a secondary menu
    showInSidebar: false,
    category: 'content',
    title: 'Ferramentas de simulação'
  },

  // USER - Authenticated users only
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    showInHeader: false,
    showInMobileMenu: true,
    showInSidebar: false,
    requiresAuth: true,
    category: 'user',
    title: 'Seu painel de controle'
  },
  {
    id: 'profile',
    label: 'Meu Perfil',
    path: '/perfil',
    icon: User,
    showInHeader: false,
    showInMobileMenu: true,
    showInSidebar: false,
    requiresAuth: true,
    category: 'user',
    title: 'Seu perfil e configurações'
  }
];

/**
 * Get navigation items filtered by criteria
 */
export const getNavigationItems = (criteria: {
  showInHeader?: boolean;
  showInMobileMenu?: boolean;
  showInSidebar?: boolean;
  requiresAuth?: boolean;
  isAuthenticated?: boolean;
  category?: string;
}): NavigationItem[] => {
  return NAVIGATION_ITEMS.filter(item => {
    // Filter by visibility flags
    if (criteria.showInHeader && !item.showInHeader) return false;
    if (criteria.showInMobileMenu && !item.showInMobileMenu) return false;
    if (criteria.showInSidebar && !item.showInSidebar) return false;

    // Filter by authentication
    if (item.requiresAuth && criteria.isAuthenticated === false) return false;

    // Filter by category
    if (criteria.category && item.category !== criteria.category) return false;

    return true;
  });
};

/**
 * Get header navigation items (desktop)
 */
export const getHeaderNavItems = (isAuthenticated: boolean = false): NavigationItem[] => {
  return getNavigationItems({
    showInHeader: true,
    isAuthenticated
  });
};

/**
 * Get mobile menu items
 */
export const getMobileMenuItems = (isAuthenticated: boolean = false): NavigationItem[] => {
  return getNavigationItems({
    showInMobileMenu: true,
    isAuthenticated
  });
};

/**
 * Get sidebar items
 */
export const getSidebarItems = (isAuthenticated: boolean = false): NavigationItem[] => {
  return getNavigationItems({
    showInSidebar: true,
    isAuthenticated
  });
};

/**
 * Group items by category
 */
export const groupByCategory = (
  items: NavigationItem[]
): Record<string, NavigationItem[]> => {
  return items.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);
};

/**
 * Get specific item by id
 */
export const getNavItemById = (id: string): NavigationItem | undefined => {
  return NAVIGATION_ITEMS.find(item => item.id === id);
};

export default NAVIGATION_ITEMS;
