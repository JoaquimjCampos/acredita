import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { mcpFetch } from '../mcpClient';
import { AssociationGame } from '../types/AssociationGame';

const AssociationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<AssociationGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) loadGame(id);
  }, [id]);

  const loadGame = async (gameId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await mcpFetch(`/api/games/association/`);
      const found = (data.results || data).find((g: AssociationGame) => String(g.id) === String(gameId));
      setGame(found || null);
    } catch (err) {
      setError('Erro ao carregar jogo de associação.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Layout><LoadingSpinner text="Carregando associação..." /></Layout>;
  }
  if (error || !game) {
    return <Layout><p className="text-red-500">{error || 'Jogo de associação não encontrado.'}</p></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <Card title={game.title}>
          <p className="mb-4 text-gray-700">{game.description}</p>
          {/* Aqui pode ir a lógica do jogo de associação */}
          <Button variant="primary" onClick={() => alert('Associação iniciada!')}>Iniciar Associação</Button>
        </Card>
      </div>
    </Layout>
  );
};

export default AssociationDetailPage;
