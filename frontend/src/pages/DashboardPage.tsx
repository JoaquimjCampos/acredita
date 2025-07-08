import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout/Layout';
import { Card, Button } from '../components/common';
import { apiService } from '../services/api';
import { User, Trophy, Heart, Star, TrendingUp, Calendar, Users, Vote } from 'lucide-react';
import { cn } from '../utils';

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

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simular dados do dashboard (substitua pelas chamadas reais da API)
      const mockStats: DashboardStats = {
        totalParticipants: 24,
        totalVotes: 15847,
        currentSeason: "Temporada 2025",
        userVotes: 12,
        favoriteParticipant: "Maria Silva",
        nextEpisode: "2025-07-15"
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'vote',
          description: 'Votou em Maria Silva',
          timestamp: '2025-07-08T10:30:00',
          participantName: 'Maria Silva'
        },
        {
          id: '2',
          type: 'episode',
          description: 'Novo episódio disponível',
          timestamp: '2025-07-07T20:00:00'
        },
        {
          id: '3',
          type: 'donation',
          description: 'Contribuiu para o programa',
          timestamp: '2025-07-06T15:45:00'
        }
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header de Boas-vindas */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo, {user?.first_name || user?.username}!
            </h1>
            <p className="text-gray-600">
              Acompanhe o progresso do programa "Acredita em Ti, Acredita em Angola"
            </p>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-primary-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Participantes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalParticipants}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Vote className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total de Votos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalVotes.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Seus Votos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.userVotes}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Temporada</p>
                  <p className="text-lg font-bold text-gray-900">{stats?.currentSeason}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Atividade Recente */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Atividade Recente</h2>
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
                
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/atividades')}
                  >
                    Ver Todas as Atividades
                  </Button>
                </div>
              </Card>
            </div>

            {/* Painel Lateral */}
            <div className="space-y-6">
              
              {/* Participante Favorito */}
              {stats?.favoriteParticipant && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Seu Favorito
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{stats.favoriteParticipant}</p>
                      <p className="text-sm text-gray-500">Participante favorito</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    size="sm"
                    onClick={() => navigate('/participantes/1')}
                  >
                    Ver Perfil
                  </Button>
                </Card>
              )}

              {/* Próximo Episódio */}
              {stats?.nextEpisode && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Próximo Episódio
                  </h3>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-8 h-8 text-primary-500" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(stats.nextEpisode).toLocaleDateString('pt-AO')}
                      </p>
                      <p className="text-sm text-gray-500">Não perca!</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    size="sm"
                    onClick={() => navigate('/temporadas')}
                  >
                    Ver Episódios
                  </Button>
                </Card>
              )}

              {/* Acções Rápidas */}
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
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
