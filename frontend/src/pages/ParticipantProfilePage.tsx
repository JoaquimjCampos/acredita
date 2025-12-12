import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { apiService } from '../services/api';
import { ParticipantSimple } from '../types';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Share2, 
  Instagram, 
  Facebook,
  Trophy,
  TrendingUp,
  Users,
  Sparkles
} from 'lucide-react';
import { cn } from '../utils';
import toast from 'react-hot-toast';

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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setParticipant({
        ...participant,
        total_votos: participant.total_votos + 1
      });
      setHasVoted(true);
      toast.success('Voto registrado com sucesso!');
    } catch (error) {
      console.error('Erro ao votar:', error);
      toast.error('Erro ao registrar voto');
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
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="Carregando participante..." />
        </div>
      </Layout>
    );
  }

  if (error || !participant) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <ErrorMessage message={error || 'Participante não encontrado.'} />
            <button onClick={() => navigate('/participantes')} className="mt-6 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg">
              Voltar aos Participantes
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-r from-red-600 to-pink-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <button onClick={() => navigate('/participantes')} className="mb-6 text-red-100 hover:text-white text-sm flex items-center gap-1">
            ← Voltar
          </button>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{participant.nome}</h1>
              <p className="text-red-100 mt-1 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {participant.provincia}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Foto e Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 border-l-4 border-red-500 md:col-span-1">
              <div className="text-center">
                {participant.foto_perfil ? (
                  <img 
                    src={participant.foto_perfil} 
                    alt={participant.nome}
                    className="w-full rounded-lg mb-4 object-cover h-48"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <Users className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <div className="text-center p-4 bg-white rounded-lg mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="w-6 h-6 text-red-500" />
                    <span className="text-2xl font-bold text-gray-900">{participant.total_votos}</span>
                  </div>
                  <p className="text-sm text-gray-600">Total de Votos</p>
                </div>
                <button
                  onClick={handleVote}
                  disabled={hasVoted || voting}
                  className={cn(
                    "w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors",
                    hasVoted || voting 
                      ? "bg-gray-200 text-gray-600 cursor-not-allowed" 
                      : "bg-red-600 hover:bg-red-700 text-white"
                  )}
                >
                  {voting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Votando...
                    </>
                  ) : (
                    <>
                      <Heart className={cn("w-5 h-5", hasVoted ? "fill-current" : "")} />
                      {hasVoted ? 'Votado' : 'Votar'}
                    </>
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="w-full mt-3 py-2 px-4 rounded-lg font-medium bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Partilhar
                </button>
              </div>
            </Card>

            {/* Detalhes Principais */}
            <div className="md:col-span-2 space-y-6">
              <Card className="p-6 border-l-4 border-red-500">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Informações</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">Idade</p>
                      <p className="font-semibold text-gray-900">{participant.idade} anos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">Provência</p>
                      <p className="font-semibold text-gray-900">{participant.provincia}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                        {participant.status === 'ativo' ? 'Ativo' : participant.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">Inscrição</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(participant.data_inscricao).toLocaleDateString('pt-AO', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Redes Sociais */}
              {participant.redes_sociais && (
                <Card className="p-6 border-l-4 border-red-500">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Redes Sociais</h3>
                  <div className="space-y-3">
                    {participant.redes_sociais.instagram && (
                      <a
                        href={`https://instagram.com/${participant.redes_sociais.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                      >
                        <Instagram className="w-5 h-5" />
                        <span className="font-medium">{participant.redes_sociais.instagram}</span>
                      </a>
                    )}
                    {participant.redes_sociais.facebook && (
                      <a
                        href={`https://facebook.com/${participant.redes_sociais.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-blue-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                      >
                        <Facebook className="w-5 h-5" />
                        <span className="font-medium">{participant.redes_sociais.facebook}</span>
                      </a>
                    )}
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* História Inspiradora */}
          <Card className="p-8 border-l-4 border-red-500 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-red-600" />
              História Inspiradora
            </h2>
            <p className="text-gray-700 leading-relaxed mb-8">{participant.historia}</p>

            <h3 className="text-xl font-bold text-gray-900 mb-4">Principais Conquistas</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <Trophy className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-green-800">Escola comunitária beneficia 200+ crianças</p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <Sparkles className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <p className="text-blue-800">Métodos pedagógicos inovadores implementados</p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                <p className="text-purple-800">Exemplo replicado em outras comunidades</p>
              </div>
            </div>
          </Card>

          {/* Apoio */}
          <Card className="p-8 border-l-4 border-red-500 text-center">
            <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Apoiar este Participante</h3>
            <p className="text-gray-600 mb-6">
              Ajude a realizar os sonhos deste participante com uma contribuição.
            </p>
            <button className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
              <Heart className="w-4 h-4 mr-2 inline" />
              Fazer Doação
            </button>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ParticipantProfilePage;
