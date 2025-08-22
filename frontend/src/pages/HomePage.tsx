import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSeasons } from '../hooks/useSeasons';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { Button, Card, LoadingSpinner, Banner } from '../components/common';
import { Layout } from '../components/layout/Layout';
import { Heart, Star, Calendar, Trophy, ChevronRight, User } from 'lucide-react';
import SponsorsSection from '../components/SponsorsSection';
import FundraisingSection from '../components/FundraisingSection';
import AdsSection from '../components/AdsSection';
import GamesSection from '../components/GamesSection';
import VideosSection from '../components/VideosSection';
import { VideoUploadSection } from '../components/VideoUploadSection';
import MediaUploadSection from '../components/MediaUploadSection';

import { Participant } from '../types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  // Pass user/session context to hooks for backend alignment
  const context = user ? { user: user.id || user.email || user.nome, session: undefined } : {};
  const { seasons, loading: seasonsLoading, error: seasonsError } = useSeasons(context);
  const { leaderboard, loading: leaderboardLoading, error: leaderboardError } = useLeaderboard(context);

  return (
    <Layout>
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-acredita-primary via-acredita-secondary to-white min-h-[60vh] flex flex-col justify-center items-center overflow-hidden animate-fade-in">
        <div className="absolute inset-0 pointer-events-none opacity-30 bg-[url('assets/angola-map.svg')] bg-no-repeat bg-center bg-contain" />
        <Banner
          title="Acredita em Ti, Acredita em Angola"
          subtitle="Transforme o seu sonho em realidade com inovação, colaboração e impacto social."
          ctaText={isAuthenticated ? 'Ir para o Dashboard' : 'Comece Agora'}
          ctaHref={isAuthenticated ? '/dashboard' : '/registo'}
        >
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            Bem-vindo à plataforma líder de empreendedorismo e inovação em Angola.<br />
            Descubra oportunidades, jogue, vote, partilhe e faça parte de uma comunidade que acredita no seu potencial.<br />
            <span className="block mt-4 text-lg text-acredita-primary font-semibold animate-pulse">Junte-se, convide amigos e ganhe recompensas exclusivas!</span>
          </p>
        </Banner>
      </div>

      {/* Onboarding visual e gamificado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="flex flex-col items-center p-6 bg-white/90 shadow-xl rounded-xl animate-fade-in">
          <Trophy className="h-10 w-10 text-acredita-primary mb-2 animate-bounce" />
          <h3 className="font-bold text-lg mb-2">Participe e Ganhe</h3>
          <p className="text-gray-700 text-center">Jogue, vote, partilhe e acumule pontos para trocar por prémios e experiências exclusivas.</p>
        </Card>
        <Card className="flex flex-col items-center p-6 bg-white/90 shadow-xl rounded-xl animate-fade-in">
          <Star className="h-10 w-10 text-yellow-500 mb-2 animate-pulse" />
          <h3 className="font-bold text-lg mb-2">Destaque-se</h3>
          <p className="text-gray-700 text-center">Mostre o seu talento, conquiste badges e seja reconhecido pela comunidade.</p>
        </Card>
        <Card className="flex flex-col items-center p-6 bg-white/90 shadow-xl rounded-xl animate-fade-in">
          <Heart className="h-10 w-10 text-red-500 mb-2 animate-fade-in" />
          <h3 className="font-bold text-lg mb-2">Impacte Angola</h3>
          <p className="text-gray-700 text-center">Apoie causas sociais, inspire outros e faça parte de um movimento de transformação.</p>
        </Card>
      </div>

      {/* Temporada em destaque */}
      <div className="mb-12">
        {seasonsError && (
          <Card className="bg-red-50 border border-red-200 text-red-700 py-6 mb-6 animate-shake text-center">
            <h3 className="text-lg font-bold mb-2">Erro ao carregar temporadas</h3>
            <p className="mb-2">{typeof seasonsError === 'string' && seasonsError.includes('<!DOCTYPE') ? 'O backend não respondeu com dados válidos. Verifique se o servidor está ativo e o endpoint correto.' : seasonsError}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>Tentar Novamente</Button>
          </Card>
        )}
        {seasonsLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <LoadingSpinner size="lg" text="A carregar informações da temporada..." />
          </div>
        ) : seasons && seasons.length > 0 ? (
          <Card className="p-8 bg-gradient-to-br from-white to-acredita-primary/10 shadow-xl border-2 border-acredita-primary animate-fade-in">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-acredita-primary mb-2">{seasons[0].title}</h3>
                <p className="text-gray-700 mb-2">{seasons[0].description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(seasons[0].start_date).toLocaleDateString('pt-AO')} - {new Date(seasons[0].end_date).toLocaleDateString('pt-AO')}
                </div>
                <div className="text-xs text-gray-500 mb-2">Estado: <span className="font-semibold text-acredita-primary">{seasons[0].status}</span></div>
              </div>
              {seasons[0].poster_image && (
                <img src={seasons[0].poster_image} alt={seasons[0].title} className="w-48 h-48 object-cover rounded-lg shadow-lg border-2 border-acredita-primary" />
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-6">
              <Button onClick={() => navigate(`/temporadas/${seasons[0].id}`)} size="lg">Ver Detalhes</Button>
              <Button variant="outline" onClick={() => navigate('/temporadas')}>Ver Todas as Temporadas</Button>
            </div>
          </Card>
        ) : (
          <Card className="text-center py-12 animate-fade-in">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma temporada activa
            </h3>
            <p className="text-gray-600 mb-6">
              Não há temporadas a decorrer neste momento. Fique atento às novidades!
            </p>
            <Button onClick={() => navigate('/temporadas')}>
              Ver Temporadas Anteriores
            </Button>
          </Card>
        )}
      </div>

      {/* Top Participantes */}
      <section className="py-16 bg-white animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Top Participantes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Conheça os empreendedores que estão a liderar a classificação.
            </p>
          </div>
          {leaderboardError && (
            <div className="text-red-500 text-center mb-4">Erro ao carregar classificação: {leaderboardError.toString()}</div>
          )}
          {leaderboardLoading ? (
            <LoadingSpinner size="lg" text="A carregar classificação..." />
          ) : leaderboard && leaderboard.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaderboard.slice(0, 6).map((participant: Participant, index: number) => (
                <Card key={participant.id} className="text-center">
                  <div className="relative">
                    {index < 3 && (
                      <div className={`absolute -top-3 -right-3`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          'bg-amber-600'
                        }`}>
                          <Trophy className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                      {participant.foto_perfil ? (
                        <img
                          src={participant.foto_perfil}
                          alt={participant.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-acredita-primary">
                          <User className="h-8 w-8 text-white" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {participant.nome}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {participant.provincia}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      {participant.idade} anos
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-acredita-primary">
                          #{participant.posicao ?? index + 1}
                        </div>
                        <div className="text-gray-500">Posição</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-acredita-primary">
                          {participant.total_votos}
                        </div>
                        <div className="text-gray-500">Votos</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ainda não há classificação
              </h3>
              <p className="text-gray-600 mb-6">
                A classificação será actualizada assim que os participantes começarem a competir.
              </p>
            </Card>
          )}

          {leaderboard && leaderboard.length > 6 && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={() => navigate('/classificacao')}
              >
                Ver Classificação Completa
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-acredita-secondary to-acredita-primary text-white animate-fade-in">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para Transformar o Seu Sonho em Realidade?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se aos empreendedores que estão a construir o futuro de Angola.
            A sua ideia pode ser a próxima a mudar vidas.
          </p>
          {!isAuthenticated && (
            <div className="space-x-4">
              <Button
                size="lg"
                onClick={() => navigate('/registo')}
                className="bg-white text-acredita-primary hover:bg-gray-100 transition-colors duration-200 focus:ring-2 focus:ring-acredita-primary"
                aria-label="Começar Agora"
              >
                Começar Agora
                <Star className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/sobre')}
                className="border-white text-white hover:bg-white hover:text-acredita-primary transition-colors duration-200 focus:ring-2 focus:ring-acredita-primary"
                aria-label="Saber Mais"
              >
                Saber Mais
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Patrocinadores e Parceiros */}
      <SponsorsSection />
      {/* Campanhas de Doação & Fundraising */}
      <FundraisingSection />
      {/* Publicidades */}
      <AdsSection />
      {/* Jogos */}
      <GamesSection />
      {/* Vídeos */}
      <VideosSection />
      {/* Upload de Vídeos */}
      <VideoUploadSection />
      {/* Upload de Media (Vídeo, Imagem, Áudio, Documento) */}
      <MediaUploadSection />
    </Layout>
  );
};

export default HomePage;
