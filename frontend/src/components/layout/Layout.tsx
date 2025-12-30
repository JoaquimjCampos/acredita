import { Newspaper, Moon, Sun, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common';
import { cn } from '../../utils/index.original';
import { LogOut, Menu, X, Heart, ArrowRight } from 'lucide-react';
import { getHeaderNavItems, getMobileMenuItems, type NavigationItem, type IconType } from '../../config/navigationConfig';
import ActivityBadge from '../ActivityBadge';
import { useActivityNotification } from '../../hooks/useActivityNotification';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Get activity notification count for dashboard badge
  const totalActivityCount = parseInt(localStorage.getItem('last_activity_count') || '0', 10);
  const { unreadCount } = useActivityNotification(totalActivityCount);
  
  // Get header nav items from config
  const headerNavItems = getHeaderNavItems(isAuthenticated);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-100 dark:border-gray-800" role="banner">
      <a href="#main-content" className="skip-nav-link absolute left-2 top-2 z-50 bg-acredita-primary text-white px-3 py-2 rounded focus:translate-y-0 -translate-y-full focus:outline-none">Saltar para o conteúdo principal</a>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 flex justify-between items-center h-16">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-acredita-primary lg:hidden"
            onClick={onMobileMenuToggle}
            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <Link to="/" className="flex items-center" aria-label="Acredita - Início">
            <div className="flex items-center space-x-3">
              <picture>
                <source srcSet="/logo.svg" type="image/svg+xml" />
                <source srcSet="/logo512.png" type="image/png" />
                <img
                  src="/logo512.jpg"
                  alt="Logotipo Acredita"
                  className="h-10 w-auto drop-shadow-sm"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
              <div>
                <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Acredita</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">em Ti, em Angola</p>
              </div>
            </div>
          </Link>
        </div>
        <nav className="hidden lg:flex space-x-6" aria-label="Navegação principal">
          {headerNavItems.map(item => (
            <NavLink 
              key={item.id} 
              to={item.path} 
              icon={item.icon} 
              text={item.label} 
              title={item.title}
              badge={item.path === '/dashboard' ? unreadCount : 0}
            />
          ))}
        </nav>
        <div className="flex items-center space-x-2">
          <select
            aria-label={t('Selecionar idioma')}
            className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-acredita-primary mr-2"
            value={i18n.language}
            onChange={e => i18n.changeLanguage(e.target.value)}
          >
            <option value="pt">PT</option>
            <option value="en">EN</option>
          </select>
          <button
            type="button"
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-acredita-primary"
            aria-label={darkMode ? 'Desativar modo escuro' : 'Ativar modo escuro'}
            onClick={() => setDarkMode((dm: boolean) => !dm)}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          {isAuthenticated && user ? (
            <>
              <span className="text-sm text-gray-700 dark:text-gray-200 hidden md:inline">Olá, <span className="font-medium">{user.first_name}</span></span>
              <Button variant="ghost" size="sm" onClick={() => navigate('/perfil')} className="p-2"><User className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="p-2"><LogOut className="h-4 w-4" /></Button>
            </>
          ) : (
            <>
              <Button variant="primary" size="sm" onClick={() => navigate('/registo')} className="flex items-center space-x-1">
                <span>Começar</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/login')}>Entrar</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  icon: IconType;
  text: string;
  title?: string;
  badge?: number;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon: Icon, text, title, badge = 0 }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      title={title}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors relative',
        isActive
          ? 'text-acredita-primary bg-orange-50'
          : 'text-gray-600 hover:text-acredita-primary hover:bg-gray-50'
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{text}</span>
      {badge > 0 && (
        <ActivityBadge 
          count={badge}
          className="ml-1 absolute -top-2 -right-2 text-xs"
        />
      )}
    </Link>
  );
};

// Menu mobile
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const panelRef = React.useRef<HTMLDivElement>(null);
  
  // Get mobile menu items from config
  const mobileMenuItems = getMobileMenuItems(isAuthenticated);

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Basic focus trap inside the mobile menu panel
  React.useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const panel = panelRef.current;
    const focusableSelectors = [
      'a[href]','button:not([disabled])','select:not([disabled])','textarea:not([disabled])',
      'input:not([disabled])','[tabindex]:not([tabindex="-1"])'
    ].join(',');

    const focusables = Array.from(panel.querySelectorAll<HTMLElement>(focusableSelectors));
    const first = focusables[0] || panel;
    const last = focusables[focusables.length - 1] || panel;
    (first as HTMLElement).focus();

    const handleTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (focusables.length === 0) return;
      const active = document.activeElement as HTMLElement | null;
      const goingBack = e.shiftKey;
      if (!active) return;
      if (!panel.contains(active)) {
        e.preventDefault();
        (first as HTMLElement).focus();
        return;
      }
      if (!goingBack && active === last) {
        e.preventDefault();
        (first as HTMLElement).focus();
      } else if (goingBack && active === first) {
        e.preventDefault();
        (last as HTMLElement).focus();
      }
    };

    document.addEventListener('keydown', handleTrap);
    return () => document.removeEventListener('keydown', handleTrap);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="lg:hidden" id="mobile-menu">
      <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title">
        <div className="flex items-start justify-start min-h-screen">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={onClose}
          />
          
          {/* Menu */}
          <div ref={panelRef} className="relative bg-white w-64 min-h-screen shadow-xl outline-none" tabIndex={-1}>
            <div className="p-4">
              <h2 id="mobile-menu-title" className="sr-only">Menu principal</h2>
              {isAuthenticated && user && (
                <div className="mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-acredita-primary rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <nav className="space-y-2">
                {mobileMenuItems.map(item => (
                  <MobileNavLink 
                    key={item.id}
                    to={item.path} 
                    icon={item.icon} 
                    text={item.label} 
                    onClick={handleNavigation} 
                  />
                ))}
                
                {isAuthenticated && (
                  <>
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-3 py-2 text-left text-gray-700 hover:text-acredita-primary hover:bg-gray-50 rounded-md"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Terminar Sessão</span>
                      </button>
                    </div>
                  </>
                )}

                {!isAuthenticated && (
                  <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleNavigation('/login')}
                    >
                      Entrar
                    </Button>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => handleNavigation('/registo')}
                    >
                      Registar
                    </Button>
                  </div>
                )}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MobileNavLinkProps {
  to: string;
  icon: IconType;
  text: string;
  onClick: (path: string) => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, icon: Icon, text, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <button
      onClick={() => onClick(to)}
      className={cn(
        'flex items-center space-x-3 w-full px-3 py-2 text-left rounded-md transition-colors',
        isActive
          ? 'text-acredita-primary bg-orange-50'
          : 'text-gray-700 hover:text-acredita-primary hover:bg-gray-50'
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{text}</span>
    </button>
  );
};

// Footer
const Footer: React.FC = () => (
  <footer className="bg-white border-t border-gray-100">
    <div className="max-w-7xl mx-auto py-6 px-4 flex flex-col md:flex-row justify-between items-center">
      <div className="flex items-center space-x-2 mb-2 md:mb-0">
        <Heart className="h-5 w-5 text-acredita-primary" />
        <span className="font-semibold text-gray-700">Acredita em Ti</span>
      </div>
      <span className="text-xs text-gray-400">© 2025 Acredita. Todos os direitos reservados.</span>
      <span className="text-xs text-gray-400 flex items-center">Feito com <Heart className="h-4 w-4 text-red-500 mx-1" /> em Angola</span>
    </div>
  </footer>
);

// Layout principal
interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const darkMode = false;

  return (
    <div className={cn('min-h-screen flex flex-col', darkMode ? 'bg-gray-900' : 'bg-gray-50')}>
      <Header 
        onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      {/* Full-width layout - Sidebar removed completely */}
      <main id="main-content" className={cn('flex-1', className)}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
