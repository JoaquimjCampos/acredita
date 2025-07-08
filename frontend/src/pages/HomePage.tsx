import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSeasons, useLeaderboard } from '../hooks';
import { Button, Card, LoadingSpinner, Badge } from '../components/common';
import { Layout } from '../components/layout/Layout';
import { 
  Heart, 
  Users, 
  Trophy, 
  Star, 
  TrendingUp, 
  Calendar,
  Play,
  ChevronRight,
  Flag,
  User
} from 'lucide-react';
import { formatDate, getGreeting } from '../utils';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { currentSeason, isLoading: seasonsLoading } = useSeasons();
  const { leaderboard, isLoading: leaderboardLoading } = useLeaderboard();

  const greeting = getGreeting();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-acredita-primary to-acredita-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Heart className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Acredita em Ti
            </h1>
            <h2 className="text-2xl md:text-3xl font-light mb-6">
              Acredita em Angola
            </h2>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              O programa de televisão que transforma sonhos em realidade, 
              apoiando empreendedores angolanos a construírem um futuro melhor.
            </p>
            
            {isAuthenticated && user ? (
              <div className="space-y-4">
                <p className="text-lg">
                  {greeting}, <span className="font-semibold">{user.first_name}</span>! 
                  Bem-vindo de volta à sua jornada empreendedora.
                </p>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => navigate('/dashboard')}
                  className="bg-white text-acredita-primary hover:bg-gray-100"
                >
                  Ver Meu Dashboard
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/registo')}
                  className="bg-white text-acredita-primary hover:bg-gray-100"
                >
                  Candidatar-me Agora
                  <Star className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/participantes')}
                  className="border-white text-white hover:bg-white hover:text-acredita-primary"
                >
                  Conhecer Participantes
                  <Users className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Bandeira de Angola decorativa */}
        <div className="absolute top-0 right-0 opacity-10">
          <Flag className="h-64 w-64" />
        </div>
      </section>

      {/* Estatísticas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-acredita-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">150+</div>
              <div className="text-gray-600">Participantes</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-acredita-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">25</div>
              <div className="text-gray-600">Vencedores</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-acredita-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">500M</div>
              <div className="text-gray-600">Kwanzas Investidos</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900">1000+</div>
              <div className="text-gray-600">Empregos Criados</div>
            </div>
          </div>
        </div>
      </section>

      {/* Temporada Actual */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Temporada Actual
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Acompanhe a jornada dos nossos empreendedores nesta temporada emocionante.
            </p>
          </div>

          {seasonsLoading ? (
            <LoadingSpinner size="lg" text="A carregar informações da temporada..." />
          ) : currentSeason ? (
            <Card className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Badge variant="info" size="md">
                      Temporada {currentSeason.numero}
                    </Badge>
                    {currentSeason.ativa && (
                      <Badge variant="success" size="md">
                        Em Exibição
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {currentSeason.titulo}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {currentSeason.descricao}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Início: {formatDate(currentSeason.data_inicio)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{currentSeason.total_participantes} participantes</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Play className="h-4 w-4" />
                      <span>{currentSeason.total_episodios} episódios</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-x-4">
                    <Button onClick={() => navigate('/temporadas')}>
                      Ver Episódios
                    </Button>
                    {currentSeason.inscricoes_abertas && (
                      <Button 
                        variant="outline"
                        onClick={() => navigate('/registo')}
                      >
                        Candidatar-me
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-acredita-primary to-acredita-secondary rounded-lg p-8 text-white">
                  <h4 className="text-xl font-bold mb-4">Como Participar</h4>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold">1</span>
                      </div>
                      <div>
                        <p className="font-semibold">Crie a sua conta</p>
                        <p className="text-sm opacity-90">Registe-se na plataforma com os seus dados</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold">2</span>
                      </div>
                      <div>
                        <p className="font-semibold">Submeta a candidatura</p>
                        <p className="text-sm opacity-90">Conte-nos sobre o seu projeto empresarial</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold">3</span>
                      </div>
                      <div>
                        <p className="font-semibold">Participe no programa</p>
                        <p className="text-sm opacity-90">Se selecionado, mostre o seu talento</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
      </section>

      {/* Top Participantes */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Top Participantes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Conheça os empreendedores que estão a liderar a classificação.
            </p>
          </div>

          {leaderboardLoading ? (
            <LoadingSpinner size="lg" text="A carregar classificação..." />
          ) : leaderboard.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaderboard.slice(0, 6).map((participant, index) => (
                <Card key={participant.id} className="text-center">
                  <div className="relative">
                    {index < 3 && (
                      <div className="absolute -top-3 -right-3">
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
                          alt={participant.nome_completo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-acredita-primary">
                          <User className="h-8 w-8 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {participant.nome_completo}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {participant.profissao}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      {participant.localizacao}
                    </p>
                    
                    <div className="flex items-center justify-center space-x-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-acredita-primary">
                          #{participant.posicao_ranking}
                        </div>
                        <div className="text-gray-500">Posição</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-acredita-primary">
                          {participant.pontuacao_total}
                        </div>
                        <div className="text-gray-500">Pontos</div>
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

          {leaderboard.length > 6 && (
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
      <section className="py-16 bg-gradient-to-r from-acredita-secondary to-acredita-primary text-white">
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
                className="bg-white text-acredita-primary hover:bg-gray-100"
              >
                Começar Agora
                <Star className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/sobre')}
                className="border-white text-white hover:bg-white hover:text-acredita-primary"
              >
                Saber Mais
              </Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
