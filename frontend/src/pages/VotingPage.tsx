

import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useVoting } from '../hooks';
import { apiService } from '../services/api';
import { Heart, Star, MapPin } from 'lucide-react';

// Tipo importado do hook

const VotingPage: React.FC = () => {
  const { participants, loading, error } = useVoting();
  const [voting, setVoting] = useState<string | null>(null);
  const [voted, setVoted] = useState<string | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);

  const handleVote = async (participantId: string) => {
    setVoting(participantId);
    setVoteError(null);
    try {
      // apiService.vote deve ser mantido para registrar o voto
      await apiService.vote({ participante: participantId });
      setVoted(participantId);
    } catch (err: any) {
      setVoteError(err.message || 'Erro ao votar.');
    } finally {
      setVoting(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner text="Carregando participantes para votação..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <ErrorMessage message={error} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center mb-4">
            <Heart className="h-12 w-12 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Votação dos Participantes
            </h1>
          </div>
          <p className="text-xl opacity-95 max-w-3xl">
            Vote nos seus participantes favoritos e ajude-os a conquistar os seus sonhos
          </p>
        </div>
      </div>

      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {voteError && <ErrorMessage message={voteError} className="mb-4" />}
          {voted && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded" role="status" aria-live="polite">
              Voto registado com sucesso!
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {participants.map((p) => (
              <Card key={p.id} className="p-4 flex flex-col items-center transition-transform duration-200 hover:scale-105 hover:shadow-lg focus-within:scale-105 focus-within:shadow-lg border-2 border-transparent hover:border-acredita-primary">
                <div
                  className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mb-4 overflow-hidden outline-none"
                  tabIndex={0}
                  aria-label={`Participante: ${p.nome}`}
                >
                  {p.foto_perfil ? (
                    <img src={p.foto_perfil} alt={p.nome} className="w-full h-full object-cover" />
                  ) : (
                    <Star className="w-10 h-10 text-primary-500" aria-hidden="true" />
                  )}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">{p.nome}</h2>
                <p className="text-sm text-gray-500 mb-1">{p.idade} anos</p>
                <p className="text-sm text-gray-500 flex items-center mb-2">
                  <MapPin className="w-4 h-4 mr-1" aria-hidden="true" /> {p.provincia}
                </p>
                {typeof p.total_votos === 'number' && (
                  <p className="text-xs text-gray-400 mb-2">Votos: {p.total_votos}</p>
                )}
                <Button
                  className="w-full mt-auto"
                  size="sm"
                  variant="primary"
                  onClick={() => handleVote(p.id)}
                  loading={voting === p.id}
                  disabled={!!voted || voting === p.id}
                  aria-label={`Votar em ${p.nome}`}
                >
                  {voted === p.id ? 'Votado!' : 'Votar'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VotingPage;
