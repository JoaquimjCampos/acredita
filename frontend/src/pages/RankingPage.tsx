import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button } from '../components/common';
import { apiService } from '../services/api';
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
import { cn } from '../utils';

interface RankingData extends ParticipantSimple {
  posicao: number;
  variacao_posicao: number; // +1, -1, 0
  votos_semana: number;
  percentual_votos: number;
}

const RankingPage: React.FC = () => {
  const [ranking, setRanking] = useState<RankingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'geral' | 'semana' | 'mes'>('geral');

  useEffect(() => {
    loadRanking();
  }, [timeFilter]);

  const loadRanking = async () => {
    try {
      setLoading(true);
      
      // Dados mock do ranking (substitua pela chamada real da API)
      const mockRanking: RankingData[] = [
        {
          id: '1',
          nome: 'Maria Silva',
          idade: 25,
          provincia: 'Luanda',
          historia: 'Empreendedora dedicada à educação infantil',
          foto_perfil: null,
          total_votos: 1247,
          data_inscricao: '2025-01-15',
          status: 'ativo',
          posicao: 1,
          variacao_posicao: 0,
          votos_semana: 156,
          percentual_votos: 18.5,
          redes_sociais: {
            instagram: '@maria_silva_ao'
          }
        },
        {
          id: '2',
          nome: 'João Benedito',
          idade: 32,
          provincia: 'Benguela',
          historia: 'Professor que criou uma escola rural comunitária',
          foto_perfil: null,
          total_votos: 1156,
          data_inscricao: '2025-01-18',
          status: 'ativo',
          posicao: 2,
          variacao_posicao: 1,
          votos_semana: 142,
          percentual_votos: 17.1
        },
        {
          id: '3',
          nome: 'Ana Cristina',
          idade: 28,
          provincia: 'Huíla',
          historia: 'Enfermeira que fundou clínica móvel para comunidades rurais',
          foto_perfil: null,
          total_votos: 987,
          data_inscricao: '2025-01-20',
          status: 'ativo',
          posicao: 3,
          variacao_posicao: -1,
          votos_semana: 98,
          percentual_votos: 14.6
        },
        {
          id: '4',
          nome: 'Carlos Manuel',
          idade: 35,
          provincia: 'Malanje',
          historia: 'Agricultor que desenvolveu técnicas sustentáveis',
          foto_perfil: null,
          total_votos: 856,
          data_inscricao: '2025-01-22',
          status: 'ativo',
          posicao: 4,
          variacao_posicao: 2,
          votos_semana: 89,
          percentual_votos: 12.7
        },
        {
          id: '5',
          nome: 'Beatriz Santos',
          idade: 24,
          provincia: 'Cabinda',
          historia: 'Artista que promove cultura angolana através da arte',
          foto_perfil: null,
          total_votos: 742,
          data_inscricao: '2025-01-25',
          status: 'ativo',
          posicao: 5,
          variacao_posicao: 0,
          votos_semana: 76,
          percentual_votos: 11.0
        },
        {
          id: '6',
          nome: 'Miguel Ferreira',
          idade: 29,
          provincia: 'Huambo',
          historia: 'Engenheiro que criou soluções de energia solar para aldeias',
          foto_perfil: null,
          total_votos: 693,
          data_inscricao: '2025-01-28',
          status: 'ativo',
          posicao: 6,
          variacao_posicao: -2,
          votos_semana: 67,
          percentual_votos: 10.3
        }
      ];

      setRanking(mockRanking);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Classificação dos Participantes
            </h1>
            <p className="text-gray-600">
              Acompanhe a evolução dos nossos participantes
            </p>
          </div>

          {/* Filtros */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <Button
                  variant={timeFilter === 'geral' ? 'primary' : 'outline'}
                  onClick={() => setTimeFilter('geral')}
                >
                  Classificação Geral
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
              
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Última atualização: {new Date().toLocaleDateString('pt-AO')}
                </p>
              </div>
            </div>
          </Card>

          {/* Pódio - Top 3 */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              <Trophy className="w-8 h-8 inline mr-2 text-yellow-500" />
              Pódio
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ranking.slice(0, 3).map((participant, index) => (
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
                  <div className="mb-4">
                    {getPositionIcon(participant.posicao)}
                  </div>
                  
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                    {participant.foto_perfil ? (
                      <img 
                        src={participant.foto_perfil} 
                        alt={participant.nome}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <Users className="w-8 h-8 text-primary-500" />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {participant.nome}
                  </h3>
                  
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
                  
                  <Link to={`/participantes/${participant.id}`}>
                    <Button size="sm" className="mt-4 w-full">
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
              <h2 className="text-xl font-bold text-gray-900">
                Classificação Completa
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Província
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total de Votos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Esta Semana
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      %
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ranking.map((participant) => (
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
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mr-3">
                            {participant.foto_perfil ? (
                              <img 
                                src={participant.foto_perfil} 
                                alt={participant.nome}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <Users className="w-5 h-5 text-primary-500" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {participant.nome}
                            </div>
                            <div className="text-sm text-gray-500">
                              {participant.idade} anos
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {participant.provincia}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Heart className="w-4 h-4 text-red-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {participant.total_votos.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        +{participant.votos_semana}
                      </td>
                      
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
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {participant.percentual_votos}%
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link 
                          to={`/participantes/${participant.id}`}
                          className="text-primary-600 hover:text-primary-900"
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
