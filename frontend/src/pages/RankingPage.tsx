import { cn } from '../utils';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { ErrorMessage } from '../components/common/ErrorMessage';

import { ParticipantSimple } from '../types';
import { 
  Trophy, 
  Medal, 
  Award, 
  Heart, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Crown,
  Star,
  MapPin,
  Users,
  Calendar
} from 'lucide-react';

import { useLeaderboard } from '../hooks';

const RankingPage: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<'geral' | 'semana' | 'mes'>('geral');
  const { leaderboard, loading, error } = useLeaderboard();

  const participantes: ParticipantSimple[] = [];


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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
          <LoadingSpinner size="lg" text="Carregando ranking..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center" role="alert" aria-live="assertive">
          <ErrorMessage message={error} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
  <div className="min-h-screen bg-gray-50 py-6" tabIndex={-1} aria-label="Conteúdo principal da classificação">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3" tabIndex={0} aria-label="Título da página: Classificação dos Participantes">
              <Star className="h-8 w-8 text-yellow-400" /> Classificação dos Participantes <Users className="h-7 w-7 text-acredita-primary ml-2" />
            </h1>
            <p className="text-gray-600" tabIndex={0}>
              Acompanhe a evolução dos nossos participantes
            </p>
          </div>

          {/* Filtros */}
          <Card className="p-6 mb-8" aria-label="Filtros de classificação">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4" role="group" aria-label="Filtros de tempo da classificação">
                <Button
                  variant={timeFilter === 'geral' ? 'primary' : 'outline'}
                  onClick={() => setTimeFilter('geral')}
                  aria-pressed={timeFilter === 'geral'}
                  tabIndex={0}
                >
                  Classificação Geral
                </Button>
                <Button
                  variant={timeFilter === 'semana' ? 'primary' : 'outline'}
                  onClick={() => setTimeFilter('semana')}
                  aria-pressed={timeFilter === 'semana'}
                  tabIndex={0}
                >
                  Esta Semana
                </Button>
                <Button
                  variant={timeFilter === 'mes' ? 'primary' : 'outline'}
                  onClick={() => setTimeFilter('mes')}
                  aria-pressed={timeFilter === 'mes'}
                  tabIndex={0}
                >
                  Este Mês
                </Button>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 flex items-center gap-2" aria-label="Última atualização">
                  <Calendar className="h-5 w-5 text-acredita-primary" /> Última atualização: {new Date().toLocaleDateString('pt-AO')}
                </p>
              </div>
            </div>
          </Card>

          {/* Pódio - Top 3 */}
          <div className="mb-12" aria-label="Pódio dos participantes">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center" tabIndex={0}>
              <Trophy className="w-8 h-8 inline mr-2 text-yellow-500" aria-hidden="true" />
              Pódio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {leaderboard.slice(0, 3).map((participant, index) => (
                <Card 
                  key={participant.id}
                  className={cn(
                    "text-center p-6",
                    getPositionCardClass(participant.posicao),
                    index === 0 ? "md:order-2 transform md:scale-110" : "",
                    index === 1 ? "md:order-1" : "",
                    index === 2 ? "md:order-3" : ""
                  )}
                >
                  <div
                    tabIndex={0}
                    aria-label={`Participante ${participant.nome}, posição ${participant.posicao}`}
                  >
                    <div className="mb-4">{getPositionIcon(participant.posicao)}</div>
                    <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                      {participant.foto_perfil ? (
                        <img 
                          src={participant.foto_perfil} 
                          alt={participant.nome}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <Users className="w-8 h-8 text-primary-500" aria-label="Sem foto de perfil" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{participant.nome}</h3>
                    <div className="flex items-center justify-center text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" aria-hidden="true" />
                      {participant.provincia}
                    </div>
                    <div className="flex items-center justify-center mb-4">
                      <Heart className="w-5 h-5 text-red-500 mr-2" aria-hidden="true" />
                      <span className="text-xl font-bold text-gray-900">
                        {participant.total_votos.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-center text-sm">
                      {getVariationIcon(participant.variacao_posicao)}
                      <span className={cn(
                        "ml-1 font-medium",
                        participant.variacao_posicao > 0 ? "text-green-600" : 
                        participant.variacao_posicao < 0 ? "text-red-600" : "text-gray-500"
                      )}>
                        {getVariationText(participant.variacao_posicao)}
                      </span>
                    </div>
                    <Link to={`/participantes/${participant.id}`} tabIndex={0} aria-label={`Ver perfil de ${participant.nome}`}>
                      <Button size="sm" className="mt-4 w-full">
                        Ver Perfil
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Classificação Completa */}
          <Card className="overflow-hidden" aria-label="Tabela de classificação completa">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900" tabIndex={0}>Classificação Completa</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" aria-label="Tabela de classificação dos participantes">
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
                      tabIndex={0}
                      aria-label={`Linha da tabela: ${participant.nome}, posição ${participant.posicao}`}
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
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mr-3">
                            {participant.foto_perfil ? (
                              <img 
                                src={participant.foto_perfil} 
                                alt={participant.nome}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <Users className="w-5 h-5 text-primary-500" aria-label="Sem foto de perfil" />
                            )}
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
                          <Heart className="w-4 h-4 text-red-500 mr-1" aria-hidden="true" />
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
                          className="text-primary-600 hover:text-primary-900"
                          tabIndex={0}
                          aria-label={`Ver perfil de ${participant.nome}`}
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
