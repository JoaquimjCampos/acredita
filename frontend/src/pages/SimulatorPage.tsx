
import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { AdBanner } from '../components/ads/AdBanner';
import { useAds } from '../hooks';
import { Ad } from '../types/Ad';
import { Simulation } from '../types/Simulation';
import { mcpFetch } from '../mcpClient';

const SimulatorPage: React.FC = () => {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { ads } = useAds();

  useEffect(() => {
    const loadSimulations = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await mcpFetch('/api/games/simulator/');
        setSimulations(data.results || data);
      } catch (err) {
        setError('Erro ao carregar simuladores.');
      } finally {
        setLoading(false);
      }
    };
    loadSimulations();
  }, []);

  if (loading) {
    return <Layout><LoadingSpinner text="Carregando simuladores..." /></Layout>;
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
              {ads.map((ad: Ad) => (
                <AdBanner key={ad.id} title={ad.title} image_url={ad.image_url} link={ad.link} />
              ))}
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Simuladores</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {simulations.map((sim) => (
              <Card key={sim.id} title={sim.title} className="flex flex-col h-full">
                <p className="mb-4 text-gray-700 flex-1">{sim.description}</p>
                <Button
                  className="w-full mt-auto"
                  onClick={() => window.location.href = `/jogos/simuladores/${sim.id}`}
                >
                  Simular
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SimulatorPage;
