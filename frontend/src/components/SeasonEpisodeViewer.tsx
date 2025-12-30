
import React, { useEffect, useState } from 'react';
import { Card, LoadingSpinner, Button } from './common';
import apiService from '../services/api';
import { Episode } from '../types';

const SeasonEpisodeViewer: React.FC<{ seasonId: number }> = ({ seasonId }) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService.getSeasonEpisodes(seasonId)
      .then((res: any) => {
        if (Array.isArray(res.results)) {
          // Flatten if results is an array of arrays
          const flat = res.results.flat();
          setEpisodes(flat);
        } else {
          setEpisodes([]);
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [seasonId]);

  if (loading) return <LoadingSpinner text="A carregar episódios..." />;
  if (error) return <Card className="bg-red-50 text-red-700 p-4">{error}</Card>;

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-bold text-acredita-primary mb-4">Episódios da Temporada</h2>
      <ul className="space-y-4">
        {episodes.map((episode: Episode) => (
          <li key={episode.id} className="border-b pb-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-lg">{episode.titulo}</span>
                <div className="text-sm text-gray-600">{episode.descricao}</div>
                <div className="text-xs text-gray-500">{episode.data_exibicao}</div>
              </div>
              <Button size="sm" onClick={() => window.location.href = `/episodios/${episode.id}`}>Ver Detalhes</Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default SeasonEpisodeViewer;
