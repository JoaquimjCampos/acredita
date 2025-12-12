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
import React, { Suspense, lazy, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSeasons } from '../hooks/useSeasons';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { Button, Card } from '../components/common';
import { OptimizedImage } from '../components/common/OptimizedImage';
import { Layout } from '../components/layout/Layout';
import { Heart, Star, Calendar, Trophy, ChevronRight, User, ShoppingBag, GraduationCap, Users } from 'lucide-react';
import { SectionWrapper } from '../components/layout/SectionWrapper';
import FeedbackWidget from '../components/FeedbackWidget';
import GamesSection from '../components/GamesSection';
import FeaturedQuizChallenge from '../components/FeaturedQuizChallenge';
import { Participant } from '../types';

// Lazy-loaded primary sections (high engagement)
const SustainableFundingDashboard = lazy(() => import('../components/kixikila/SustainableFundingDashboard'));
const VideosSection = lazy(() => import('../components/VideosSection'));

// Lazy-loaded secondary sections (deferred)
const SponsorsSection = lazy(() => import('../components/SponsorsSection'));
const FundraisingSection = lazy(() => import('../components/FundraisingSection'));
const AdsSection = lazy(() => import('../components/AdsSection'));

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

// Value Proposition Configuration
const VALUE_PROPS = [
  {
    icon: Trophy,
    color: 'from-blue-500 to-blue-600',
    label: 'Participe e Ganhe',
    desc: 'Acumule pontos, desbloqueie prémios e recompensas exclusivas.'
  },
  {
    icon: Star,
    color: 'from-amber-500 to-amber-600',
    label: 'Destaque-se',
    desc: 'Construa sua reputação e ganhe reconhecimento da comunidade.'
  },
  {
    icon: Heart,
    color: 'from-red-500 to-red-600',
    label: 'Impacte Angola',
    desc: 'Apoie causas sociais e transforme sua comunidade.'
  }
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Memoize context to avoid unnecessary re-renders
  const context = useMemo(
    () => user ? { user: user.id || user.email || user.nome, session: undefined } : {},
    [user]
  );

  const { seasons, loading: seasonsLoading, error: seasonsError } = useSeasons(context);
  const { leaderboard, loading: leaderboardLoading, error: leaderboardError } = useLeaderboard(context);

  // Memoize navigation handlers
  const handleNavigate = useCallback((path: string) => navigate(path), [navigate]);
  const handleRegister = useCallback(() => handleNavigate('/registo'), [handleNavigate]);
  const handleDashboard = useCallback(() => handleNavigate(isAuthenticated ? '/dashboard' : '/registo'), [handleNavigate, isAuthenticated]);

  return (
    <Layout>
      {/* Floating Feedback Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <FeedbackWidget />
      </div>

      {/* Skip to main content (accessibility) */}
      <a
        href="#main-content"
        className="skip-nav-link absolute left-2 top-2 z-50 bg-acredita-primary text-white px-3 py-2 rounded focus:translate-y-0 -translate-y-full focus:outline-none"
      >
        Saltar para o conteúdo principal
      </a>

      {/* ===== HERO SECTION ===== */}
      <div className="relative bg-gradient-to-br from-acredita-primary via-acredita-secondary to-white min-h-[65vh] flex flex-col justify-center items-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}
        />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <img src="/logo.svg" alt="Acredita em Ti" className="h-20 w-auto mb-6 mx-auto animate-fade-in" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
            Acredita em Ti, Acredita em Angola
          </h1>
          <p className="text-lg md:text-xl text-white/95 mb-8 leading-relaxed max-w-2xl mx-auto font-light">
            Plataforma de empreendedorismo, inovação e financiamento colaborativo. Desenvolva seu negócio com a comunidade.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              size="lg"
              onClick={handleDashboard}
              className="bg-white text-acredita-primary hover:bg-gray-100 shadow-lg font-semibold"
            >
              {isAuthenticated ? 'Dashboard' : 'Começar'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            {!isAuthenticated && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleNavigate('/temporadas')}
                className="border-white text-white hover:bg-white/10 font-semibold"
              >
                Temporadas
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ===== VALUE PROPOSITION ===== */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white" aria-labelledby="value-prop-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="value-prop-heading" className="sr-only">
            Proposição de valor do Acredita
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUE_PROPS.map(({ icon: Icon, color, label, desc }, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-all duration-300 group">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold text-center text-gray-900 mb-2">{label}</h3>
                <p className="text-sm text-center text-gray-600">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED SEASON ===== */}
      <SectionWrapper
        id="featured-season"
        title="Temporada em Destaque"
        subtitle="Acompanhe a temporada actual e vote nos seus participantes favoritos"
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
                    onClick={() => handleNavigate(`/temporadas/${seasons[0].id}`)}
                    size="lg"
                    className="flex-1 sm:flex-initial"
                  >
                    Explorar
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button variant="outline" onClick={() => handleNavigate('/participantes')} className="flex-1 sm:flex-initial">
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

      {/* ===== QUIZ CHALLENGE ===== */}
      <FeaturedQuizChallenge />

      {/* ===== LEADERBOARD ===== */}
      <SectionWrapper
        id="leaderboard"
        title="Top Participantes"
        subtitle="Conheça os empreendedores em destaque"
        loading={leaderboardLoading}
        error={leaderboardError}
        empty={!leaderboardLoading && !leaderboardError && (!leaderboard || leaderboard.length === 0)}
        emptyIcon={<Trophy className="h-16 w-16 text-gray-400" />}
        emptyTitle="Classificação em breve"
        emptyMessage="Aguarde o início da competição para ver a classificação."
        containerClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {leaderboard && leaderboard.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {leaderboard.slice(0, 6).map((participant: Participant, index: number) => (
                <Card
                  key={participant.id}
                  className={`p-6 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                    index === 0
                      ? 'ring-2 ring-yellow-400'
                      : index === 1
                      ? 'ring-2 ring-gray-400'
                      : index === 2
                      ? 'ring-2 ring-amber-600'
                      : ''
                  }`}
                >
                  <div className="relative">
                    {index < 3 && (
                      <div className="absolute -top-3 -right-3 z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                            index === 0
                              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                              : index === 1
                              ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                              : 'bg-gradient-to-br from-amber-500 to-amber-700'
                          }`}
                        >
                          <Trophy className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-4 overflow-hidden ring-4 ring-white shadow-lg">
                      <OptimizedImage
                        src={participant.foto_perfil}
                        alt={participant.nome}
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                        fallbackIcon={<User className="h-10 w-10 text-gray-400" />}
                      />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">{participant.nome}</h4>
                    <p className="text-sm text-gray-500 mb-4">{participant.provincia}</p>
                    <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-100">
                      <div>
                        <div className="text-2xl font-bold text-acredita-primary">#{participant.posicao ?? index + 1}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Posição</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-acredita-primary">{participant.total_votos?.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Votos</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            {leaderboard.length > 6 && (
              <div className="text-center">
                <Button size="lg" onClick={() => handleNavigate('/classificacao')}>
                  Ver Classificação Completa
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </>
        )}
      </SectionWrapper>

      {/* ===== PRIMARY CONTENT ===== */}
      <div id="main-content">
        {/* Funding Dashboard - Authenticated Users */}
        {isAuthenticated && (
          <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Seu Financiamento</h2>
                  <p className="text-sm md:text-base text-gray-600 mt-1">Gerencie seu perfil Kixikila e grupos ativos</p>
                </div>
                <Button size="sm" onClick={() => handleNavigate('/kixikila')} className="whitespace-nowrap">
                  Abrir <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <Suspense fallback={<div className="h-40 rounded-lg bg-white shadow-sm animate-pulse" />}>
                <SustainableFundingDashboard />
              </Suspense>
            </div>
          </section>
        )}

        {/* Module Previews - Unified Pattern */}
        <section className="space-y-0" aria-labelledby="modules-heading">
          <h2 id="modules-heading" className="sr-only">
            Módulos principais do Acredita
          </h2>
          {MODULE_PREVIEWS.map((module, idx) => {
            const Icon = module.icon;
            const bgColor = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50';
            return (
              <div key={module.id} className={bgColor}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    {/* Header + Features */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-lg bg-gradient-to-br ${module.color} shadow-md`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{module.title}</h3>
                          <p className="text-sm text-gray-600">{module.subtitle}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                        {module.features.map((f, i) => (
                          <div key={i} className="p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-sm text-gray-900">{f.label}</p>
                            <p className="text-xs text-gray-600 mt-1">{f.desc}</p>
                          </div>
                        ))}
                      </div>
                      <Button
                        size="lg"
                        onClick={() => handleNavigate(module.path)}
                        className={`mt-6 bg-gradient-to-r ${module.color} hover:shadow-lg`}
                      >
                        Explorar {module.title}
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* High-Engagement Sections - Prioritized Lazy Load */}
        <Suspense fallback={<div className="py-20" />}>
          <GamesSection />
        </Suspense>
        <Suspense fallback={<div className="py-20" />}>
          <VideosSection />
        </Suspense>

        {/* Secondary Sections - Deferred Lazy Load */}
        <Suspense fallback={<div className="py-12" />}>
          <AdsSection />
        </Suspense>
        <Suspense fallback={<div className="py-12" />}>
          <SponsorsSection />
        </Suspense>
        <Suspense fallback={<div className="py-12" />}>
          <FundraisingSection />
        </Suspense>
      </div>

      {/* ===== FINAL CTA ===== */}
      {!isAuthenticated && (
        <section className="py-16 md:py-20 bg-gradient-to-r from-acredita-primary via-acredita-secondary to-acredita-primary text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '30px 30px'
            }}
          />
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Junte-se à Revolução do Empreendedorismo
            </h2>
            <p className="text-base md:text-lg opacity-90 max-w-2xl mx-auto mb-8 font-light">
              Milhares de empreendedores angolanos já estão transformando suas vidas no Acredita.
            </p>
            <Button
              size="lg"
              onClick={handleRegister}
              className="bg-white text-acredita-primary hover:bg-gray-50 shadow-xl font-semibold px-8 py-3"
            >
              Começar Agora
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default HomePage;
