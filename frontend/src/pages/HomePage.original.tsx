import React, { Suspense, lazy } from 'react';
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
// Kixikila funding dashboard preview (authenticated users)
const SustainableFundingDashboard = lazy(() => import('../components/kixikila/SustainableFundingDashboard'));

// Lazy-loaded heavy components
const SponsorsSection = lazy(() => import('../components/SponsorsSection'));
const FundraisingSection = lazy(() => import('../components/FundraisingSection'));
const AdsSection = lazy(() => import('../components/AdsSection'));
const VideosSection = lazy(() => import('../components/VideosSection'));

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const context = user ? { user: user.id || user.email || user.nome, session: undefined } : {};
  const { seasons, loading: seasonsLoading, error: seasonsError } = useSeasons(context);
  const { leaderboard, loading: leaderboardLoading, error: leaderboardError } = useLeaderboard(context);

  return (
    <Layout>
      {/* Floating Feedback Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <FeedbackWidget />
      </div>

      {/* Skip to main content (accessibility) */}
      <a href="#main-content" className="skip-nav-link absolute left-2 top-2 z-50 bg-acredita-primary text-white px-3 py-2 rounded focus:translate-y-0 -translate-y-full focus:outline-none">
        Saltar para o conteúdo principal
      </a>

      {/* Hero Banner - Streamlined */}
      <div className="relative bg-gradient-to-br from-acredita-primary via-acredita-secondary to-white min-h-[70vh] flex flex-col justify-center items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <img src="/logo.svg" alt="Acredita em Ti" className="h-24 w-auto mb-6 mx-auto animate-fade-in" />
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
            Acredita em Ti, Acredita em Angola
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-8 leading-relaxed max-w-3xl mx-auto">
            A plataforma líder de empreendedorismo e inovação em Angola. Jogue, vote, aprenda e faça parte de uma comunidade que acredita no seu potencial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/registo')}
              className="bg-white text-acredita-primary hover:bg-gray-100 shadow-xl"
            >
              {isAuthenticated ? 'Ir para o Dashboard' : 'Começar Gratuitamente'}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            {!isAuthenticated && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/temporadas')}
                className="border-white text-white hover:bg-white/10"
              >
                Explorar Temporadas
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Value Proposition - Simplified */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto mb-4 bg-acredita-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="h-8 w-8 text-acredita-primary" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Participe e Ganhe</h3>
              <p className="text-gray-600">Acumule pontos através de jogos, votos e partilhas para trocar por prémios exclusivos.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Destaque-se</h3>
              <p className="text-gray-600">Mostre o seu talento, conquiste badges e seja reconhecido pela comunidade.</p>
            </div>
            <div className="text-center p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 group">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900">Impacte Angola</h3>
              <p className="text-gray-600">Apoie causas sociais e inspire outros a fazer parte da transformação.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Temporada em Destaque - Optimized */}
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
        emptyAction={<Button onClick={() => navigate('/temporadas')}>Ver Histórico</Button>}
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
                    {new Date(seasons[0].start_date).toLocaleDateString('pt-AO')} - {new Date(seasons[0].end_date).toLocaleDateString('pt-AO')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => navigate(`/temporadas/${seasons[0].id}`)} size="lg" className="flex-1 sm:flex-initial">
                    Explorar Temporada
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/participantes')} className="flex-1 sm:flex-initial">
                    Ver Participantes
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

      {/* Quiz Challenge */}
      <FeaturedQuizChallenge />

      {/* Top Participantes - Enhanced */}
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
                    index === 0 ? 'ring-2 ring-yellow-400' : index === 1 ? 'ring-2 ring-gray-400' : index === 2 ? 'ring-2 ring-amber-600' : ''
                  }`}
                >
                  <div className="relative">
                    {index < 3 && (
                      <div className="absolute -top-3 -right-3 z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : 
                            'bg-gradient-to-br from-amber-500 to-amber-700'
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
                <Button size="lg" onClick={() => navigate('/classificacao')}>
                  Ver Classificação Completa
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </>
        )}
      </SectionWrapper>

      {/* CTA Section - Streamlined */}
      {!isAuthenticated && (
        <section className="py-20 bg-gradient-to-r from-acredita-primary to-acredita-secondary text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Transforme o Seu Sonho em Realidade
            </h2>
            <p className="text-xl mb-10 opacity-95 max-w-2xl mx-auto">
              Junte-se a milhares de empreendedores angolanos que estão a construir o futuro.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/registo')}
              className="bg-white text-acredita-primary hover:bg-gray-100 shadow-2xl text-lg px-8 py-4"
            >
              Começar Gratuitamente
              <ChevronRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </section>
      )}

      {/* Conteúdo Pesado - Lazy Loaded */}
      <div id="main-content">
        {/* Funding Overview for authenticated users */}
        {isAuthenticated && (
          <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Financiamento Sustentável</h2>
                  <p className="text-gray-600">Veja rapidamente o seu progresso e o estado do seu grupo Kixikila.</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/kixikila')}>
                  Abrir Kixikila
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <Suspense fallback={<div className="h-40 rounded-xl bg-white shadow-sm animate-pulse" />}> 
                {/* Dashboard fetches current user funding via API; no prop required */}
                <SustainableFundingDashboard />
              </Suspense>
            </div>
          </section>
        )}
        {/* Preview Section: Kixikila (Savings Groups) */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-100 mb-4">
                <Users className="h-8 w-8 text-violet-600" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Kixikila - Grupos de Poupança</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Reúna-se com amigos e familiares para poupar e investir juntos numa plataforma segura e transparente.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 border-l-4 border-violet-500">
                <div className="h-32 bg-violet-50 rounded-lg mb-4 flex items-center justify-center">
                  <Users className="h-12 w-12 text-violet-200" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Grupos Colaborativos</h3>
                <p className="text-sm text-gray-600 mb-4">Crie e gerencie grupos de poupança com controle total sobre contribuições.</p>
              </Card>
              <Card className="p-6 border-l-4 border-violet-500">
                <div className="h-32 bg-violet-50 rounded-lg mb-4 flex items-center justify-center">
                  <Star className="h-12 w-12 text-violet-200" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Transparência Total</h3>
                <p className="text-sm text-gray-600 mb-4">Acompanhe cada transação e veja o progresso do seu grupo em tempo real.</p>
              </Card>
              <Card className="p-6 border-l-4 border-violet-500">
                <div className="h-32 bg-violet-50 rounded-lg mb-4 flex items-center justify-center">
                  <Heart className="h-12 w-12 text-violet-200" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Segurança Garantida</h3>
                <p className="text-sm text-gray-600 mb-4">Proteja seu investimento com mecanismos de segurança avançados.</p>
              </Card>
            </div>
            <div className="text-center">
              <Button
                size="lg"
                onClick={() => navigate('/kixikila')}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                Explorar Kixikila
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Preview Section: Marketplace */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100 mb-4">
                <ShoppingBag className="h-8 w-8 text-cyan-600" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Marketplace - Serviços Profissionais</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Ofereça seus serviços profissionais ou contrate talentos da comunidade Acredita.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 border-l-4 border-cyan-500">
                <div className="h-32 bg-cyan-50 rounded-lg mb-4 flex items-center justify-center">
                  <ShoppingBag className="h-12 w-12 text-cyan-200" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Múltiplas Categorias</h3>
                <p className="text-sm text-gray-600 mb-4">Encontre serviços em consultoria, design, tecnologia, marketing e muito mais.</p>
              </Card>
              <Card className="p-6 border-l-4 border-cyan-500">
                <div className="h-32 bg-cyan-50 rounded-lg mb-4 flex items-center justify-center">
                  <Star className="h-12 w-12 text-cyan-200" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Profissionais Avaliados</h3>
                <p className="text-sm text-gray-600 mb-4">Contrate com confiança baseado em avaliações e histórico de clientes.</p>
              </Card>
              <Card className="p-6 border-l-4 border-cyan-500">
                <div className="h-32 bg-cyan-50 rounded-lg mb-4 flex items-center justify-center">
                  <Heart className="h-12 w-12 text-cyan-200" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Preços Competitivos</h3>
                <p className="text-sm text-gray-600 mb-4">Negocie diretamente e obtenha os melhores preços para seus projetos.</p>
              </Card>
            </div>
            <div className="text-center">
              <Button
                size="lg"
                onClick={() => navigate('/marketplace')}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                Explorar Marketplace
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Preview Section: Certifications */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                <GraduationCap className="h-8 w-8 text-orange-600" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Certificações & Treinamentos</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Desenvolva suas competências com programas de treinamento certificados por especialistas.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="p-6 border-l-4 border-orange-500">
                <div className="h-32 bg-orange-50 rounded-lg mb-4 flex items-center justify-center">
                  <GraduationCap className="h-12 w-12 text-orange-200" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Cursos Qualificados</h3>
                <p className="text-sm text-gray-600 mb-4">Aprenda com instrutores experientes em áreas de grande demanda.</p>
              </Card>
              <Card className="p-6 border-l-4 border-orange-500">
                <div className="h-32 bg-orange-50 rounded-lg mb-4 flex items-center justify-center">
                  <Star className="h-12 w-12 text-orange-200" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Certificados Reconhecidos</h3>
                <p className="text-sm text-gray-600 mb-4">Obtenha certificados valorizados no mercado de trabalho angolano.</p>
              </Card>
              <Card className="p-6 border-l-4 border-orange-500">
                <div className="h-32 bg-orange-50 rounded-lg mb-4 flex items-center justify-center">
                  <Heart className="h-12 w-12 text-orange-200" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Preços Acessíveis</h3>
                <p className="text-sm text-gray-600 mb-4">Investimento em educação com opções de financiamento disponíveis.</p>
              </Card>
            </div>
            <div className="text-center">
              <Button
                size="lg"
                onClick={() => navigate('/certifications')}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Explorar Certificações
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Other Sections */}
        <GamesSection />
        <Suspense fallback={<div className="py-12" />}>
          <VideosSection />
        </Suspense>
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
    </Layout>
  );
};

export default HomePage;
