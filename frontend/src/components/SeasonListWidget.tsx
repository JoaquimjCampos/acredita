import React, { useEffect, useState } from 'react';
import { Card, LoadingSpinner, Button } from './common';
import apiService from '../services/api.original';

import { Season } from '../types';

const SeasonListWidget: React.FC = () => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService.getSeasons()
      .then(res => {
        if (Array.isArray(res.results)) {
          setSeasons(res.results.flat());
        } else {
          setSeasons([]);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="A carregar temporadas..." />;
  if (error) return <Card className="bg-red-50 text-red-700 p-4">{error}</Card>;

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-bold text-acredita-primary mb-4">Temporadas</h2>
      <ul className="space-y-4">
        {seasons.map((season: Season) => (
          <li key={season.id} className="border-b pb-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-lg">{season.nome}</span>
                <span className="ml-2 text-xs text-gray-500">{season.status}</span>
                <div className="text-sm text-gray-600">Ano: {season.ano}</div>
              </div>
              <Button size="sm" onClick={() => window.location.href = `/temporadas/${season.id}`}>Ver Detalhes</Button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default SeasonListWidget;
