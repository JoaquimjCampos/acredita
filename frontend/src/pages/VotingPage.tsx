import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button } from '../components/common';
import { ParticipantSimple } from '../types';
import { 
  Heart, 
  Star, 
  Trophy, 
  Users, 
  MapPin, 
  Calendar,
  Vote,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { cn } from '../utils';
import toast from 'react-hot-toast';

const VotingPage: React.FC = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<ParticipantSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedParticipants, setVotedParticipants] = useState<Set<string>>(new Set());
  const [dailyVotesUsed, setDailyVotesUsed] = useState(0);
  const [votingInProgress, setVotingInProgress] = useState<string | null>(null);
  
  const MAX_DAILY_VOTES = 3;

  useEffect(() => {
    loadParticipants();
    loadUserVotingHistory();
  }, []);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      
      // Dados mock dos participantes (apenas os top para votação)
      const mockParticipants: ParticipantSimple[] = [
        {
          id: '1',
          nome: 'Maria Silva',
          idade: 25,
          provincia: 'Luanda',
          historia: 'Empreendedora dedicada à educação infantil que transformou sua comunidade.',
          foto_perfil: null,
          total_votos: 1247,
          data_inscricao: '2025-01-15',
          status: 'ativo',
          redes_sociais: {
            instagram: '@maria_silva_ao'
          }
        },
        {
          id: '2',
          nome: 'João Benedito',
          idade: 32,
          provincia: 'Benguela',
          historia: 'Professor que criou uma escola rural comunitária.',
          foto_perfil: null,
          total_votos: 1156,
          data_inscricao: '2025-01-18',
          status: 'ativo'
        },
        {
          id: '3',
          nome: 'Ana Cristina',
          idade: 28,
          provincia: 'Huíla',
          historia: 'Enfermeira que fundou clínica móvel para comunidades rurais.',
          foto_perfil: null,
          total_votos: 987,
          data_inscricao: '2025-01-20',
          status: 'ativo'
        },
        {
          id: '4',
          nome: 'Carlos Manuel',
          idade: 35,
          provincia: 'Malanje',
          historia: 'Agricultor que desenvolveu técnicas sustentáveis.',
          foto_perfil: null,
          total_votos: 856,
          data_inscricao: '2025-01-22',
          status: 'ativo'
        },
        {
          id: '5',
          nome: 'Beatriz Santos',
          idade: 24,
          provincia: 'Cabinda',
          historia: 'Artista que promove cultura angolana através da arte.',
          foto_perfil: null,
          total_votos: 742,
          data_inscricao: '2025-01-25',
          status: 'ativo'
        },
        {
          id: '6',
          nome: 'Miguel Ferreira',
          idade: 29,
          provincia: 'Huambo',
          historia: 'Engenheiro que criou soluções de energia solar para aldeias.',
          foto_perfil: null,
          total_votos: 693,
          data_inscricao: '2025-01-28',
          status: 'ativo'
        }
      ];

      setParticipants(mockParticipants);
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserVotingHistory = async () => {
    try {
      // Simular histórico de votos do utilizador (substituir por API real)
      const mockVotedToday = new Set(['2']); // Usuário já votou no participante 2
      const mockDailyVotes = 1;
      
      setVotedParticipants(mockVotedToday);
      setDailyVotesUsed(mockDailyVotes);
    } catch (error) {
      console.error('Erro ao carregar histórico de votos:', error);
    }
  };

  const handleVote = async (participantId: string, participantName: string) => {
    if (dailyVotesUsed >= MAX_DAILY_VOTES) {
      toast.error('Atingiu o limite diário de votos (3 votos por dia)');
      return;
    }

    if (votedParticipants.has(participantId)) {
      toast.error('Já votou neste participante hoje');
      return;
    }

    try {
      setVotingInProgress(participantId);
      
      // Simular chamada da API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Atualizar estado local
      setVotedParticipants(prev => {
        const newSet = new Set(prev);
        newSet.add(participantId);
        return newSet;
      });
      setDailyVotesUsed(prev => prev + 1);
      
      // Atualizar contagem de votos do participante
      setParticipants(prev => 
        prev.map(p => 
          p.id === participantId 
            ? { ...p, total_votos: p.total_votos + 1 }
            : p
        )
      );

      toast.success(`Voto registado com sucesso para ${participantName}! 🎉`);
    } catch (error) {
      console.error('Erro ao votar:', error);
      toast.error('Erro ao registar voto. Tente novamente.');
    } finally {
      setVotingInProgress(null);
    }
  };

  const getRemainingVotes = () => MAX_DAILY_VOTES - dailyVotesUsed;

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
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Vote className="w-12 h-12 text-primary-500 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">
                Votar nos Participantes
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-4">
              Apoie os seus participantes favoritos no programa "Acredita em Ti, Acredita em Angola"
            </p>
            
            {/* Status de Votos */}
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center">
                <Heart className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Votos utilizados hoje: {dailyVotesUsed}/{MAX_DAILY_VOTES}
                </span>
              </div>
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Votos restantes: {getRemainingVotes()}
                </span>
              </div>
            </div>
          </div>

          {/* Aviso sobre limite de votos */}
          {getRemainingVotes() === 0 && (
            <Card className="p-4 mb-8 bg-yellow-50 border-yellow-200">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-yellow-800 font-medium">
                    Limite diário atingido
                  </p>
                  <p className="text-yellow-700 text-sm">
                    Já utilizou todos os seus votos hoje. Volte amanhã para votar novamente!
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Grid de Participantes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {participants.map((participant, index) => {
              const hasVoted = votedParticipants.has(participant.id);
              const isVoting = votingInProgress === participant.id;
              const canVote = !hasVoted && getRemainingVotes() > 0 && !isVoting;

              return (
                <Card 
                  key={participant.id}
                  className={cn(
                    "overflow-hidden transition-all duration-300 hover:shadow-xl",
                    hasVoted ? "ring-2 ring-green-300 bg-green-50" : "hover:shadow-lg",
                    index < 3 ? "border-2 border-yellow-200" : ""
                  )}
                >
                  {/* Badge para Top 3 */}
                  {index < 3 && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="flex items-center bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        <Trophy className="w-3 h-3 mr-1" />
                        TOP {index + 1}
                      </div>
                    </div>
                  )}

                  {/* Foto do Participante */}
                  <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    {participant.foto_perfil ? (
                      <img 
                        src={participant.foto_perfil} 
                        alt={participant.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Users className="w-16 h-16 text-primary-500 mx-auto mb-2" />
                        <p className="text-lg font-bold text-primary-700">
                          {participant.nome.split(' ').map(n => n[0]).join('')}
                        </p>
                      </div>
                    )}
                    
                    {/* Overlay para participantes já votados */}
                    {hasVoted && (
                      <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {participant.nome}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          {participant.provincia}
                          <span className="mx-2">•</span>
                          <Calendar className="w-4 h-4 mr-1" />
                          {participant.idade} anos
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center text-primary-600">
                          <Heart className="w-5 h-5 mr-1" />
                          <span className="text-xl font-bold">{participant.total_votos.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-500">votos</p>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-6 line-clamp-3">
                      {participant.historia}
                    </p>

                    <div className="space-y-3">
                      {/* Botão de Votação */}
                      <Button
                        onClick={() => handleVote(participant.id, participant.nome)}
                        disabled={!canVote}
                        className={cn(
                          "w-full transition-all duration-300",
                          hasVoted 
                            ? "bg-green-500 hover:bg-green-600 text-white" 
                            : isVoting 
                            ? "bg-primary-400" 
                            : "bg-primary-500 hover:bg-primary-600"
                        )}
                        size="lg"
                      >
                        {isVoting ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Votando...
                          </div>
                        ) : hasVoted ? (
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Voto Registado
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Heart className="w-5 h-5 mr-2" />
                            Votar
                          </div>
                        )}
                      </Button>

                      {/* Botão Ver Perfil */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => navigate(`/participantes/${participant.id}`)}
                      >
                        Ver Perfil Completo
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Footer com instruções */}
          <Card className="mt-12 p-6 bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Como funciona a votação?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div className="flex items-start">
                <Star className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">3 votos por dia</p>
                  <p>Cada utilizador pode votar até 3 vezes por dia</p>
                </div>
              </div>
              <div className="flex items-start">
                <Heart className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">1 voto por participante</p>
                  <p>Pode votar apenas uma vez no mesmo participante por dia</p>
                </div>
              </div>
              <div className="flex items-start">
                <Trophy className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Classificação em tempo real</p>
                  <p>Os votos são contabilizados imediatamente</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default VotingPage;
