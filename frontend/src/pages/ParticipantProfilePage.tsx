import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { apiService } from '../services/api';
import { ParticipantSimple } from '../types';
import { 
  ArrowLeft, 
  Heart, 
  MapPin, 
  Calendar, 
  Share2, 
  Instagram, 
  Facebook,
  Trophy,
  Star,
  Users,
  TrendingUp
} from 'lucide-react';
import { cn } from '../utils';

const ParticipantProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState<ParticipantSimple | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    if (id) {
      loadParticipant(id);
    }
  }, [id]);

  const loadParticipant = async (participantId: string) => {
    try {
      setLoading(true);
      setError(null);
  const response = await apiService.getParticipant(Number(participantId));
      if (response.sucesso) {
        setParticipant(response.dados);
        // TODO: Verificar se o utilizador já votou neste participante (chamada real)
        setHasVoted(false);
      } else {
        setError('Participante não encontrado.');
        setParticipant(null);
      }
    } catch (err: any) {
      setError('Erro ao carregar participante.');
      setParticipant(null);
      console.error('Erro ao carregar participante:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!participant || hasVoted) return;
    
    try {
      setVoting(true);
      
      // Implementar votação
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
      
      setParticipant({
        ...participant,
        total_votos: participant.total_votos + 1
      });
      setHasVoted(true);
    } catch (error) {
      console.error('Erro ao votar:', error);
    } finally {
      setVoting(false);
    }
  };

  const handleShare = async () => {
    if (!participant) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${participant.nome} - Acredita em Ti, Acredita em Angola`,
          text: participant.historia.substring(0, 200) + '...',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erro ao partilhar:', error);
      }
    } else {
      // Fallback para browsers que não suportam Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
          <LoadingSpinner size="lg" text="Carregando participante..." />
        </div>
      </Layout>
    );
  }

  if (error || !participant) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center" role="alert" aria-live="assertive">
          <div className="text-center">
            <ErrorMessage message={error || 'Participante não encontrado.'} />
            <Button className="mt-6" onClick={() => navigate('/participantes')}>Voltar aos Participantes</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
  <div className="min-h-screen bg-gray-50 py-6" tabIndex={-1} aria-label="Conteúdo principal do perfil do participante">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Botão Voltar */}
          <Button
            variant="outline"
            onClick={() => navigate('/participantes')}
            className="mb-6"
            aria-label="Voltar aos Participantes"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Participantes
          </Button>

          {/* Header do Perfil */}
          <Card className="overflow-hidden mb-8">
            <div className="md:flex">
              
              {/* Foto do Participante */}
              <div className="md:w-1/3">
                <div className="h-64 md:h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  {participant.foto_perfil ? (
                    <img 
                      src={participant.foto_perfil} 
                      alt={participant.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Users className="w-24 h-24 text-primary-500 mx-auto mb-4" />
                      <p className="text-2xl font-bold text-primary-700">
                        {participant.nome.split(' ').map(n => n[0]).join('')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações Principais */}
              <div className="md:w-2/3 p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {participant.nome}
                    </h1>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span className="mr-4">{participant.provincia}</span>
                      <Calendar className="w-5 h-5 mr-2" />
                      <span>{participant.idade} anos</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Partilhar
                  </Button>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Heart className="w-6 h-6 text-red-500 mr-2" />
                      <span className="text-2xl font-bold text-gray-900">
                        {participant.total_votos}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Total de Votos</p>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
                      <span className="text-2xl font-bold text-gray-900">#3</span>
                    </div>
                    <p className="text-sm text-gray-600">Posição</p>
                  </div>
                </div>

                {/* Botão de Votação */}
                <div className="flex space-x-4">
                  <Button
                    onClick={handleVote}
                    disabled={hasVoted || voting}
                    className="flex-1"
                    size="lg"
                  >
                    {voting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Heart className={cn(
                        "w-5 h-5 mr-2",
                        hasVoted ? "fill-current" : ""
                      )} />
                    )}
                    {hasVoted ? 'Votado' : voting ? 'Votando...' : 'Votar'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* História do Participante */}
            <div className="lg:col-span-2">
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  História Inspiradora
                </h2>
                <div className="prose prose-lg text-gray-600 leading-relaxed">
                  <p>{participant.historia}</p>
                </div>

                {/* Conquistas/Marcos */}
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Principais Conquistas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <Trophy className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-green-800">Escola comunitária beneficia 200+ crianças</span>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <Star className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-blue-800">Métodos pedagógicos inovadores implementados</span>
                    </div>
                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-600 mr-3" />
                      <span className="text-purple-800">Exemplo replicado em outras comunidades</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Painel Lateral */}
            <div className="space-y-6">
              
              {/* Redes Sociais */}
              {participant.redes_sociais && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Redes Sociais
                  </h3>
                  <div className="space-y-3">
                    {participant.redes_sociais.instagram && (
                      <a
                        href={`https://instagram.com/${participant.redes_sociais.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                      >
                        <Instagram className="w-5 h-5 mr-3" />
                        <span>{participant.redes_sociais.instagram}</span>
                      </a>
                    )}
                    {participant.redes_sociais.facebook && (
                      <a
                        href={`https://facebook.com/${participant.redes_sociais.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-3 bg-blue-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                      >
                        <Facebook className="w-5 h-5 mr-3" />
                        <span>{participant.redes_sociais.facebook}</span>
                      </a>
                    )}
                  </div>
                </Card>
              )}

              {/* Informações Adicionais */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informações
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Data de Inscrição</p>
                    <p className="font-medium text-gray-900">
                      {new Date(participant.data_inscricao).toLocaleDateString('pt-AO', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {participant.status === 'ativo' ? 'Ativo' : participant.status}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Apoiar */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Apoiar este Participante
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Ajude a realizar os sonhos deste participante com uma contribuição.
                </p>
                <Button className="w-full" variant="outline">
                  <Heart className="w-4 h-4 mr-2" />
                  Fazer Doação
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ParticipantProfilePage;
