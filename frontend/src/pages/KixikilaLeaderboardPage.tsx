import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import KixikilaService from '../services/kixikila/kixikilaService';
import { Trophy, Award, TrendingUp, Target } from 'lucide-react';
import toast from 'react-hot-toast';

interface LeaderboardMember {
  rank: number;
  username: string;
  reputation_score: number;
  trust_level: string;
  contribution_count: number;
  on_time_count: number;
  late_count: number;
  missed_count: number;
  group_count: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardMember[];
}

const KixikilaLeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(50);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response: any = await KixikilaService.getLeaderboard(limit);
      if (response.leaderboard) {
        setLeaderboard(response.leaderboard);
      }
    } catch (error: any) {
      toast.error('Erro ao carregar leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [limit]);

  const getTrustLevelBadgeColor = (level: string) => {
    const upperLevel = level?.toUpperCase() || 'BEGINNER';
    switch (upperLevel) {
      case 'BEGINNER':
        return 'bg-blue-100 text-blue-700';
      case 'RELIABLE':
        return 'bg-green-100 text-green-700';
      case 'TRUSTED':
        return 'bg-purple-100 text-purple-700';
      case 'CHAMPION':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTrustLevelLabel = (level: string) => {
    const upperLevel = level?.toUpperCase() || 'BEGINNER';
    const labels: { [key: string]: string } = {
      'BEGINNER': 'Iniciante',
      'RELIABLE': 'Confiável',
      'TRUSTED': 'Confiado',
      'CHAMPION': 'Campeão',
    };
    return labels[upperLevel] || level;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-6 w-6 text-orange-400" />;
    return null;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <LoadingSpinner text="Carregando leaderboard..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Trophy className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold">Leaderboard Kixikila</h1>
              <p className="text-orange-100 mt-1">Ranking de reputação e confiabilidade</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total de Membros</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{leaderboard.length}</p>
                </div>
                <Target className="h-8 w-8 text-yellow-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Maior Pontuação</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {leaderboard.length > 0 ? leaderboard[0].reputation_score : 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Campeões</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {leaderboard.filter(m => m.trust_level?.toUpperCase() === 'CHAMPION').length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-purple-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-blue-500">
              <div>
                <p className="text-gray-600 text-sm mb-3">Mostrar Top</p>
                <select
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>Top 10</option>
                  <option value={25}>Top 25</option>
                  <option value={50}>Top 50</option>
                  <option value={100}>Top 100</option>
                </select>
              </div>
            </Card>
          </div>

          {/* Leaderboard Table */}
          <Card className="p-6 overflow-x-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ranking</h2>
            
            {leaderboard.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Posição</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Membro</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Nível</th>
                    <th className="text-right py-4 px-4 font-bold text-gray-700">Pontuação</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Contribuições</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Grupos</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((member, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${idx < 3 ? 'bg-gray-50' : ''}`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {getRankIcon(member.rank) && (
                            getRankIcon(member.rank)
                          )}
                          <span className="text-lg font-bold text-gray-900">
                            #{member.rank}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900">{member.username}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getTrustLevelBadgeColor(member.trust_level)}`}>
                          {getTrustLevelLabel(member.trust_level)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-lg font-bold text-violet-600">{member.reputation_score}</span>
                      </td>
                      <td className="py-4 px-4 text-center text-gray-600">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{member.contribution_count}</p>
                          <p className="text-xs text-gray-500">
                            {member.on_time_count}⭐ {member.late_count}🟡 {member.missed_count}❌
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                          {member.group_count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Nenhum membro no leaderboard</p>
              </div>
            )}
          </Card>

          {/* Legend */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Legenda</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className={`text-xs px-2 py-1 rounded-full font-medium mb-2 inline-block ${getTrustLevelBadgeColor('BEGINNER')}`}>
                  Iniciante
                </p>
                <p className="text-sm text-gray-600">Novos membros (0-20 pontos)</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className={`text-xs px-2 py-1 rounded-full font-medium mb-2 inline-block ${getTrustLevelBadgeColor('RELIABLE')}`}>
                  Confiável
                </p>
                <p className="text-sm text-gray-600">Membros ativos (21-50 pontos)</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className={`text-xs px-2 py-1 rounded-full font-medium mb-2 inline-block ${getTrustLevelBadgeColor('TRUSTED')}`}>
                  Confiado
                </p>
                <p className="text-sm text-gray-600">Membros confiáveis (51-80 pontos)</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className={`text-xs px-2 py-1 rounded-full font-medium mb-2 inline-block ${getTrustLevelBadgeColor('CHAMPION')}`}>
                  Campeão
                </p>
                <p className="text-sm text-gray-600">Elite confiável (81+ pontos)</p>
              </div>
            </div>
          </Card>

          {/* How It Works */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Como Funciona o Sistema de Reputação</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="font-medium text-gray-900">Contribuição No Prazo</p>
                  <p className="text-sm text-gray-600">+5 pontos por contribuição confirmada dentro do prazo</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">🟡</span>
                <div>
                  <p className="font-medium text-gray-900">Contribuição Atrasada</p>
                  <p className="text-sm text-gray-600">-10 pontos por contribuição atrasada</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">❌</span>
                <div>
                  <p className="font-medium text-gray-900">Contribuição Perdida</p>
                  <p className="text-sm text-gray-600">-20 pontos por contribuição não realizada</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default KixikilaLeaderboardPage;
