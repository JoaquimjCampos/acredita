import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { AdBanner } from '../components/ads/AdBanner';
import { mcpFetch } from '../mcpClient';
import { AssociationGame } from '../types/AssociationGame';
import { Ad } from '../types/Ad';

const AssociationPage: React.FC = () => {
  const [games, setGames] = useState<AssociationGame[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGames();
    loadAds();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await mcpFetch('/api/games/association/');
      setGames(data.results || data);
    } catch (err) {
      setError('Erro ao carregar jogos de associação.');
    } finally {
      setLoading(false);
    }
  };

  const loadAds = async () => {
    try {
      const { data } = await mcpFetch('/api/ads/ads/active/');
      setAds(data);
    } catch {
      // Não bloqueia a página se falhar
    }
  };

  if (loading) {
    return <Layout><LoadingSpinner text="Carregando jogos de associação..." /></Layout>;
  }
  if (error) {
    return <Layout><p className="text-red-500">{error}</p></Layout>;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {ads.length > 0 && (
            <div className="mb-8">
              {ads.map(ad => (
                <AdBanner key={ad.id} title={ad.title} image_url={ad.image_url} link={ad.link} />
              ))}
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Jogos de Associação</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {games.map((game) => (
              <Card key={game.id} title={game.title} className="flex flex-col h-full">
                <p className="mb-4 text-gray-700 flex-1">{game.description}</p>
                <Button
                  className="w-full mt-auto"
                  onClick={() => window.location.href = `/jogos/associacao/${game.id}`}
                >
                  Jogar Associação
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AssociationPage;
