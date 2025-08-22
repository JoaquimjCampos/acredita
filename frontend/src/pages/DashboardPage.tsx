import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { Badge } from '../components/common/Badge';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { mcpFetch } from '../mcpClient';
import { Heart, Star, TrendingUp, Calendar, Users, Vote } from 'lucide-react';

interface DashboardStats {
  totalParticipants: number;
  totalVotes: number;
  currentSeason: string;
  userVotes: number;
  favoriteParticipant: string | null;
  nextEpisode: string | null;
}

interface RecentActivity {
  id: string;
  type: 'vote' | 'comment' | 'donation' | 'episode';
  description: string;
  timestamp: string;
  participantName?: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Chamada real para stats do dashboard
      const { data: statsData } = await mcpFetch('/api/participants/dashboard/');
      setStats(statsData);
      // Chamada real para atividades recentes (ajuste endpoint conforme backend)
      const { data: activityData } = await mcpFetch('/api/participants/activity/');
      setRecentActivity(activityData.results || activityData);
    } catch (err: any) {
      setError('Erro ao carregar dados do dashboard.');
      setStats(null);
      setRecentActivity([]);
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'vote': return <Vote className="w-4 h-4 text-primary-500" />;
      case 'comment': return <Heart className="w-4 h-4 text-red-500" />;
      case 'donation': return <Heart className="w-4 h-4 text-green-500" />;
      case 'episode': return <Calendar className="w-4 h-4 text-blue-500" />;
      default: return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
          <LoadingSpinner size="lg" text="Carregando dados do dashboard..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center" role="alert" aria-live="assertive">
          <ErrorMessage message={error} />
          <Button className="mt-6" onClick={loadDashboardData} aria-label="Tentar novamente">Tentar novamente</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-acredita-primary/10 to-acredita-secondary/10 py-10 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header personalizado */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-acredita-primary mb-2" tabIndex={0} aria-label={`Bem-vindo, ${user?.nome || ''}!`}>
                Bem-vindo, {user?.nome}!
              </h1>
              <p className="text-gray-700 text-lg" tabIndex={0}>
                Acompanhe o seu progresso, conquistas e actividades recentes.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <img src="/assets/avatar1.png" alt="Avatar" className="w-20 h-20 rounded-full border-4 border-acredita-primary shadow-lg" />
              <div className="flex flex-col items-center">
                <span className="text-acredita-primary font-bold">Nível 3</span>
                <Badge className="bg-yellow-400 text-white mt-1">Empreendedor</Badge>
              </div>
            </div>
          </div>

          {/* Cards de Estatísticas com animação */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <Card className="p-6 hover:scale-105 transition-transform duration-200 shadow-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0 animate-bounce">
                  <Users className="h-8 w-8 text-acredita-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Participantes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalParticipants}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 hover:scale-105 transition-transform duration-200 shadow-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0 animate-pulse">
                  <Vote className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total de Votos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalVotes.toLocaleString()}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 hover:scale-105 transition-transform duration-200 shadow-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0 animate-fade-in">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Seus Votos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.userVotes}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 hover:scale-105 transition-transform duration-200 shadow-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0 animate-bounce">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Temporada</p>
                  <p className="text-lg font-bold text-gray-900">{stats?.currentSeason}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Linha do tempo de actividade e conquistas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Atividade Recente */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-2xl font-bold text-acredita-primary mb-4">Atividade Recente</h2>
                {recentActivity.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    Ainda não há actividade. <br/> <span className="text-acredita-primary font-semibold">Explore os jogos e participe para aparecer aqui!</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-6 flex flex-col md:flex-row gap-4">
                  <Button 
                    variant="outline" 
                    className="w-full md:w-auto"
                    onClick={() => navigate('/atividades')}
                  >
                    Ver Todas as Atividades
                  </Button>
                  <Button 
                    variant="primary" 
                    className="w-full md:w-auto bg-acredita-primary text-white hover:bg-acredita-secondary"
                    onClick={() => navigate('/games')}
                  >
                    Experimentar Jogos
                  </Button>
                </div>
              </Card>

              {/* Conquistas e Badges */}
              <Card className="p-6 mt-8">
                <h3 className="text-lg font-semibold text-acredita-primary mb-4">
                  Conquistas
                </h3>
                <div className="flex flex-wrap gap-4">
                  <Badge className="bg-yellow-400 text-white">Primeiro Voto</Badge>
                  <Badge className="bg-green-500 text-white">Participante Activo</Badge>
                  <Badge className="bg-blue-500 text-white">Explorador de Jogos</Badge>
                  <Badge className="bg-acredita-primary text-white">Impacto Social</Badge>
                </div>
              </Card>
            </div>

            {/* Acções Rápidas e Sugestões */}
            <div className="flex flex-col gap-8">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Acções Rápidas
                </h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/votar')}
                  >
                    <Vote className="w-4 h-4 mr-2" />
                    Votar Agora
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/participantes')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Ver Participantes
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/doacoes')}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Contribuir
                  </Button>
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-acredita-primary mb-4">
                  Sugestões para Si
                </h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Complete o seu perfil para ganhar mais visibilidade.</li>
                  <li>Participe num jogo e desbloqueie badges.</li>
                  <li>Convide amigos e ganhe pontos extra.</li>
                  <li>Partilhe feedback para ajudar a melhorar a plataforma.</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
