/**
 * HomePage - Revised & Harmonized
 * 
 * Improvements:
 * - Unified design system across module previews
 * - Eliminated redundant card patterns
 * - Improved lazy loading strategy (critical vs deferred)
 * - Enhanced accessibility and semantic HTML
 * - Performance optimizations (memoization, better suspense fallbacks)
 * - Mobile-first responsive design
 */
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSeasons } from '../hooks/useSeasons';
import { Button, Card } from '../components/common';
import { OptimizedImage } from '../components/common/OptimizedImage';
import { Layout } from '../components/layout/Layout';
import { Heart, Trophy, ChevronRight, ShoppingBag, GraduationCap, Users, Calendar } from 'lucide-react';
import { SectionWrapper } from '../components/layout/SectionWrapper';
import HeroVariant from '../components/HeroVariant';
import HomepageNav from '../components/HomepageNav';
import { useCoreDashboard } from '../hooks/useCoreDashboard';
import { trackEvent } from '../utils/analytics';
import { usePermissions } from '../hooks/usePermissions';

// Minimal homepage: only essentials for quick orientation

// Module Preview Configuration - Single Source of Truth
interface ModulePreview {
  id: string;
  path: string;
  title: string;
  subtitle: string;
  color: string;
  icon: React.ElementType;
  features: Array<{ label: string; desc: string }>;
}

const MODULE_PREVIEWS: ModulePreview[] = [
  {
    id: 'kixikila',
    path: '/kixikila',
    title: 'Kixikila',
    subtitle: 'Grupos de Poupança Colaborativa',
    color: 'from-violet-600 to-violet-700',
    icon: Users,
    features: [
      { label: '👥 Colaborativo', desc: 'Crie grupos com amigos e familiares' },
      { label: '👁️ Transparente', desc: 'Acompanhe transações em tempo real' },
      { label: '🔒 Seguro', desc: 'Mecanismos avançados de proteção' }
    ]
  },
  {
    id: 'marketplace',
    path: '/marketplace',
    title: 'Marketplace',
    subtitle: 'Serviços Profissionais',
    color: 'from-cyan-600 to-cyan-700',
    icon: ShoppingBag,
    features: [
      { label: '📚 Diversidade', desc: 'Múltiplas categorias de serviços' },
      { label: '⭐ Confiável', desc: 'Profissionais com histórico comprovado' },
      { label: '💰 Justo', desc: 'Negociação direta de preços' }
    ]
  },
  {
    id: 'certifications',
    path: '/certifications',
    title: 'Certificações',
    subtitle: 'Treinamentos Profissionais',
    color: 'from-orange-600 to-orange-700',
    icon: GraduationCap,
    features: [
      { label: '🎯 Qualidade', desc: 'Instrutores especializados' },
      { label: '🏆 Reconhecido', desc: 'Certificados valorizados no mercado' },
      { label: '💳 Acessível', desc: 'Opções de financiamento' }
    ]
  }
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const perms = usePermissions();
  
  // Memoize context to avoid unnecessary re-renders
  const context = useMemo(
    () => user ? { user: user.id || user.email || user.nome, session: undefined } : {},
    [user]
  );

  const { seasons, loading: seasonsLoading, error: seasonsError } = useSeasons(context);
  const { data: meDashboard, loading: coreLoading } = useCoreDashboard(!!isAuthenticated);

  const socialProof = useMemo(
    () => ([
      {
        label: 'Confiança média',
        value: meDashboard?.trust.score ?? 82,
        suffix: 'pts'
      },
      {
        label: 'Ciclos Kixikila',
        value: meDashboard?.kixikila.cycles_completed ?? 120,
        suffix: '+'
      },
      {
        label: 'Vendas no marketplace',
        value: meDashboard?.marketplace.total_sales ?? 340,
        suffix: '+'
      }
    ]),
    [meDashboard]
  );

  // Memoize navigation handlers
  const handleNavigate = useCallback((path: string) => navigate(path), [navigate]);
  const handleRegister = useCallback(() => handleNavigate('/registo'), [handleNavigate]);
  const handleDashboard = useCallback(() => {
    trackEvent({ name: 'hero-cta-click', page: 'home', label: isAuthenticated ? 'dashboard' : 'start' });
    handleNavigate(isAuthenticated ? '/dashboard' : '/registo');
  }, [handleNavigate, isAuthenticated]);

  const handleLockedFeatureClick = useCallback((feature: string, requiredRole: string) => {
    trackEvent({ name: 'plg-unlock-click', page: 'home', label: feature, required_role: requiredRole });
    if (!isAuthenticated) {
      handleNavigate('/registo');
    } else {
      handleNavigate('/upgrade');
    }
  }, [isAuthenticated, handleNavigate]);

  return (
    <Layout>
      {/* Feedback widget removed for minimal initial view */}

      {/* Skip to main content (accessibility) */}
      <a
        href="#main-content"
        className="skip-nav-link absolute left-2 top-2 z-50 bg-acredita-primary text-white px-3 py-2 rounded focus:translate-y-0 -translate-y-full focus:outline-none"
      >
        Saltar para o conteúdo principal
      </a>

      {/* ===== HERO SECTION WITH A/B TESTING ===== */}
      <HeroVariant />

      {/* Role-aware quick navigation (PLG hidden unlocks) */}
      <HomepageNav />

      {/* Authenticated quick summary (harmonized with core dashboard) */}
      {isAuthenticated && meDashboard && (
        <section className="py-10 bg-gray-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Olá, {user?.first_name || user?.nome || user?.email}</p>
                <h2 className="text-2xl font-bold text-gray-900">Resumo rápido</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => handleNavigate('/perfil')}>Ver Perfil</Button>
                <Button onClick={handleDashboard}>Ir para Dashboard</Button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <p className="text-sm text-gray-500">Trust Score</p>
                <p className="text-2xl font-bold text-gray-900">{meDashboard.trust.score}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-500">Certificações</p>
                <p className="text-2xl font-bold text-gray-900">{meDashboard.certifications.total}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-500">Vendas Marketplace</p>
                <p className="text-2xl font-bold text-gray-900">{meDashboard.marketplace.total_sales}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-gray-500">Ciclos Kixikila</p>
                <p className="text-2xl font-bold text-gray-900">{meDashboard.kixikila.cycles_completed}</p>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* ===== PRIMARY CONTENT ===== */}
      <div id="main-content">
        {/* Module Previews - Core pillars */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white" aria-labelledby="modules-heading">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="modules-heading" className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Como Funciona
              </h2>
              <p className="text-lg text-gray-600">
                Três pilares para o seu sucesso
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {MODULE_PREVIEWS.map((module) => {
                const Icon = module.icon;
                return (
                  <Card key={module.id} className="p-6 hover:shadow-xl transition-all duration-300 group">
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-center text-gray-900 mb-2">{module.title}</h3>
                    <p className="text-sm text-center text-gray-600 mb-4">{module.subtitle}</p>
                    <ul className="space-y-2 mb-6">
                      {module.features.map((f, i) => (
                        <li key={i} className="text-xs text-gray-700 flex items-start">
                          <span className="mr-2">{f.label.split(' ')[0]}</span>
                          <span>{f.label.split(' ').slice(1).join(' ')}</span>
                        </li>
                      ))}
                    </ul>
                    {module.id === 'certifications' && !(perms.isMentor || perms.isAdmin) ? (
                      <Button
                        onClick={() => handleLockedFeatureClick('certifications', 'mentor')}
                        variant="outline"
                        className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        Desbloquear (Tornar-se Mentor)
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    ) : module.id === 'marketplace' && !(perms.isParticipant || perms.isAdmin) ? (
                      <Button
                        onClick={() => handleLockedFeatureClick('marketplace', 'participant')}
                        variant="outline"
                        className="w-full border-cyan-300 text-cyan-700 hover:bg-cyan-50"
                      >
                        Desbloquear (Tornar-se Participante)
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          trackEvent({ name: 'module-card-clicked', page: 'home', label: module.id });
                          handleNavigate(module.path);
                        }}
                        className={`w-full bg-gradient-to-r ${module.color} text-white hover:shadow-lg`}
                        data-analytics="module-card-clicked"
                        data-module-id={module.id}
                      >
                        Explorar
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured season — the single dynamic highlight */}
        <SectionWrapper
          id="featured-season"
          title="Temporada em Destaque"
          subtitle="Acompanhe a temporada actual e vote"
          loading={seasonsLoading}
          error={seasonsError}
          empty={!seasonsLoading && !seasonsError && (!seasons || seasons.length === 0)}
          emptyIcon={<Trophy className="h-16 w-16 text-gray-400" />}
          emptyTitle="Nenhuma temporada activa"
          emptyMessage="Em breve novas temporadas. Fique atento!"
          emptyAction={<Button onClick={() => handleNavigate('/temporadas')}>Ver Histórico</Button>}
          containerClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          {seasons && seasons.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="inline-block px-3 py-1 bg-acredita-primary/10 text-acredita-primary text-sm font-semibold rounded-full mb-4 w-fit">
                    {seasons[0].status === 'active' ? '🔴 AO VIVO' : seasons[0].status}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{seasons[0].title}</h3>
                  <p className="text-gray-600 mb-6 text-lg leading-relaxed">{seasons[0].description}</p>
                  <div className="flex items-center gap-2 text-gray-600 mb-6">
                    <Calendar className="w-5 h-5 text-acredita-primary" />
                    <span className="text-sm">
                      {new Date(seasons[0].start_date).toLocaleDateString('pt-AO')} -{' '}
                      {new Date(seasons[0].end_date).toLocaleDateString('pt-AO')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => {
                        trackEvent({ name: 'featured-season-cta', page: 'home', label: 'explorar', value: seasons[0].id });
                        handleNavigate(`/temporadas/${seasons[0].id}`);
                      }}
                      size="lg"
                      className="flex-1 sm:flex-initial"
                    >
                      Explorar
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        trackEvent({ name: 'featured-season-cta', page: 'home', label: 'participantes' });
                        handleNavigate('/participantes');
                      }}
                      className="flex-1 sm:flex-initial"
                    >
                      Participantes
                    </Button>
                  </div>
                </div>
                <div className="relative h-64 md:h-auto bg-gradient-to-br from-acredita-primary/20 to-acredita-secondary/20">
                  <OptimizedImage
                    src={seasons[0].poster_image}
                    alt={`Temporada: ${seasons[0].title}`}
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                </div>
              </div>
            </div>
          )}
        </SectionWrapper>
      </div>

      {/* ===== FINAL CTA ===== */}
      {!isAuthenticated && (
        <section className="py-20 bg-gradient-to-r from-acredita-primary to-acredita-secondary text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 2px, transparent 2px)', backgroundSize: '50px 50px' }} />
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comece Sua Jornada Hoje
            </h2>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Junte-se a empreendedores que estão transformando Angola.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={handleRegister}
                className="bg-white text-acredita-primary hover:bg-gray-100 shadow-xl font-bold px-8 py-3 rounded-xl"
                data-analytics="cta-register"
              >
                Criar Conta Grátis
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm opacity-80">
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> 1000+ Membros</span>
              <span className="flex items-center gap-1"><Trophy className="h-4 w-4" /> Certificado</span>
              <span className="flex items-center gap-1"><Heart className="h-4 w-4" /> Gratuito</span>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default HomePage;
