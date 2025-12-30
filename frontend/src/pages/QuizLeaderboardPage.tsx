import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { Trophy, Award, Clock, Target, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface LeaderboardEntry {
  user: string;
  score: number;
  started_at: string;
  finished_at: string | null;
  time_taken: number | null;
  correct_answers: number;
  total_answers: number;
  season_number: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
}

const QuizLeaderboardPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [seasonFilter, setSeasonFilter] = useState<string>('all');
  const [quizTitle, setQuizTitle] = useState('Quiz');

  const fetchLeaderboard = async () => {
    if (!id) return;
    setLoading(true);
    try {
      // Fetch quiz details
      const quizResponse = await fetch(`/api/games/quiz/quizzes/${id}/`);
      if (quizResponse.ok) {
        const quizData = await quizResponse.json();
        setQuizTitle(quizData.title || 'Quiz');
      }

      // Fetch leaderboard
      const params = seasonFilter !== 'all' ? `?season_number=${seasonFilter}` : '';
      const response = await fetch(`/api/games/quiz/quizzes/${id}/leaderboard/${params}`);
      
      if (!response.ok) {
        throw new Error('Falha ao carregar leaderboard');
      }

      const data: LeaderboardData = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [id, seasonFilter]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-6 w-6 text-orange-400" />;
    return null;
  };

  const formatTime = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
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

  const topScore = leaderboard.length > 0 ? leaderboard[0].score : 0;
  const averageScore = leaderboard.length > 0 
    ? leaderboard.reduce((sum, entry) => sum + entry.score, 0) / leaderboard.length 
    : 0;
  const fastestTime = leaderboard
    .filter(e => e.time_taken !== null)
    .reduce((min, entry) => entry.time_taken! < min ? entry.time_taken! : min, Infinity);

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Trophy className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold">{quizTitle} - Leaderboard</h1>
              <p className="text-purple-100 mt-1">Classificação dos melhores desempenhos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pontuação Máxima</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{topScore}</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pontuação Média</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{averageScore.toFixed(1)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Tempo Mais Rápido</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {fastestTime !== Infinity ? formatTime(fastestTime) : 'N/A'}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </Card>
          </div>

          {/* Season Filter */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Classificação</h2>
              <select
                value={seasonFilter}
                onChange={(e) => setSeasonFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todas as Temporadas</option>
                <option value="1">Temporada 1</option>
                <option value="2">Temporada 2</option>
                <option value="3">Temporada 3</option>
              </select>
            </div>
          </Card>

          {/* Leaderboard Table */}
          <Card className="p-6 overflow-x-auto">
            {leaderboard.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Posição</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Utilizador</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Pontuação</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Precisão</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Tempo</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, idx) => {
                    const rank = idx + 1;
                    const accuracy = entry.total_answers > 0 
                      ? ((entry.correct_answers / entry.total_answers) * 100).toFixed(1) 
                      : '0';
                    
                    return (
                      <tr
                        key={idx}
                        className={`border-b border-gray-100 hover:bg-gray-50 ${idx < 3 ? 'bg-gray-50' : ''}`}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {getRankIcon(rank)}
                            <span className="text-lg font-bold text-gray-900">
                              #{rank}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-gray-900">{entry.user}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-lg font-bold text-purple-600">
                            {entry.score}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`font-medium ${
                            parseFloat(accuracy) >= 80 ? 'text-green-600' :
                            parseFloat(accuracy) >= 60 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {accuracy}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center text-gray-600">
                          {formatTime(entry.time_taken)}
                        </td>
                        <td className="py-4 px-4 text-center text-gray-600 text-sm">
                          {new Date(entry.started_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Nenhuma submissão encontrada</p>
                <p className="text-gray-500 text-sm mt-2">Seja o primeiro a completar este quiz!</p>
              </div>
            )}
          </Card>

          {/* Achievement Badges */}
          {leaderboard.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Conquistas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-yellow-600" />
                    <div>
                      <p className="font-bold text-yellow-900">Campeão</p>
                      <p className="text-sm text-yellow-700">
                        {leaderboard[0]?.user} - {leaderboard[0]?.score} pontos
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-bold text-blue-900">Mais Rápido</p>
                      <p className="text-sm text-blue-700">
                        {fastestTime !== Infinity ? formatTime(fastestTime) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <Target className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-bold text-green-900">Mais Preciso</p>
                      <p className="text-sm text-green-700">
                        {leaderboard[0]?.total_answers > 0 
                          ? `${((leaderboard[0].correct_answers / leaderboard[0].total_answers) * 100).toFixed(1)}%`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default QuizLeaderboardPage;
