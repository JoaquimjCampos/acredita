import { cn } from '../utils';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { OptimizedImage } from '../components/common/OptimizedImage';
import { 
  Trophy, 
  Medal, 
  Award, 
  Heart,
  TrendingUp, 
  TrendingDown,
  Minus,
  Crown,
  MapPin,
  Users
} from 'lucide-react';

import { useLeaderboard } from '../hooks';

const RankingPage: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<'geral' | 'semana' | 'mes'>('geral');
  const { leaderboard, loading, error } = useLeaderboard();

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error || !leaderboard || leaderboard.length === 0) {
    return (
      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                <Trophy className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Classificação</h1>
                <p className="text-yellow-100 mt-1">Acompanhe a evolução dos participantes</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 min-h-screen py-12">
          <div className="max-w-6xl mx-auto px-4">
            <Card className="p-12 text-center">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum participante no ranking</h3>
              <p className="text-gray-600">A classificação será actualizada assim que houver votos.</p>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Award className="w-8 h-8 text-amber-600" />;
      default:
        return (
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-gray-600">{position}</span>
          </div>
        );
    }
  };

  const getVariationIcon = (variation: number) => {
    if (variation > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (variation < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getVariationText = (variation: number) => {
    if (variation > 0) {
      return `+${variation}`;
    } else if (variation < 0) {
      return `${variation}`;
    } else {
      return '—';
    }
  };

  const getPositionCardClass = (position: number) => {
    switch (position) {
      case 1:
        return 'border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50';
      case 2:
        return 'border-2 border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50';
      case 3:
        return 'border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50';
      default:
        return 'border border-gray-200';
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Classificação</h1>
              <p className="text-yellow-100 mt-1">Acompanhe a evolução dos participantes</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">

          {/* Filtros */}
          <Card className="p-6 mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant={timeFilter === 'geral' ? 'primary' : 'outline'}
                onClick={() => setTimeFilter('geral')}
              >
                Geral
              </Button>
              <Button
                variant={timeFilter === 'semana' ? 'primary' : 'outline'}
                onClick={() => setTimeFilter('semana')}
              >
                Esta Semana
              </Button>
              <Button
                variant={timeFilter === 'mes' ? 'primary' : 'outline'}
                onClick={() => setTimeFilter('mes')}
              >
                Este Mês
              </Button>
            </div>
          </Card>

          {/* Pódio - Top 3 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Pódio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {leaderboard.slice(0, 3).map((participant, index) => (
                <Card 
                  key={participant.id}
                  className={cn(
                    "text-center p-6",
                    getPositionCardClass(participant.posicao),
                    index === 0 ? "md:order-2 md:scale-110" : "",
                    index === 1 ? "md:order-1" : "",
                    index === 2 ? "md:order-3" : ""
                  )}
                >
                  <div className="mb-4">{getPositionIcon(participant.posicao)}</div>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-yellow-100 to-amber-100">
                    <OptimizedImage
                      src={participant.foto_perfil}
                      alt={participant.nome}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover rounded-full"
                      fallbackIcon={<Users className="w-8 h-8 text-amber-500" />}
                      lazy={false}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{participant.nome}</h3>
                  <div className="flex items-center justify-center text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {participant.provincia}
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    <Heart className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-xl font-bold text-gray-900">
                      {participant.total_votos.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-center text-sm mb-4">
                    {getVariationIcon(participant.variacao_posicao)}
                    <span className={cn(
                      "ml-1 font-medium",
                      participant.variacao_posicao > 0 ? "text-green-600" : 
                      participant.variacao_posicao < 0 ? "text-red-600" : "text-gray-500"
                    )}>
                      {getVariationText(participant.variacao_posicao)}
                    </span>
                  </div>
                  <Link to={`/participantes/${participant.id}`}>
                    <Button size="sm" className="mt-2 w-full">
                      Ver Perfil
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>

          {/* Classificação Completa */}
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Classificação Completa</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posição</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participante</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Província</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total de Votos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Esta Semana</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variação</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((participant) => (
                    <tr 
                      key={participant.id}
                      className={cn(
                        "hover:bg-gray-50 transition-colors",
                        participant.posicao <= 3 ? "bg-yellow-50" : ""
                      )}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getPositionIcon(participant.posicao)}
                          <span className="ml-3 text-sm font-medium text-gray-900">
                            #{participant.posicao}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                            <OptimizedImage
                              src={participant.foto_perfil}
                              alt={participant.nome}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover rounded-full"
                              fallbackIcon={<Users className="w-5 h-5 text-amber-500" />}
                              lazy={true}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{participant.nome}</div>
                            <div className="text-sm text-gray-500">{participant.idade} anos</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{participant.provincia}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 text-red-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">{participant.total_votos.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">+{participant.votos_semana}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getVariationIcon(participant.variacao_posicao)}
                          <span className={cn(
                            "ml-1 text-sm font-medium",
                            participant.variacao_posicao > 0 ? "text-green-600" : 
                            participant.variacao_posicao < 0 ? "text-red-600" : "text-gray-500"
                          )}>
                            {getVariationText(participant.variacao_posicao)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{participant.percentual_votos}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link 
                          to={`/participantes/${participant.id}`}
                          className="text-amber-600 hover:text-amber-900 transition-colors"
                        >
                          Ver Perfil
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RankingPage;
