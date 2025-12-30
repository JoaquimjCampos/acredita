import React, { useEffect, useState } from 'react';
import { Card, LoadingSpinner } from './common';
import apiService from '../services/api';

const CurrentSeasonBanner: React.FC = () => {
  const [season, setSeason] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService.getCurrentSeason()
      .then((res: any) => setSeason(res))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="A carregar temporada atual..." />;
  if (error) return <Card className="bg-red-50 text-red-700 p-4">{error}</Card>;
  if (!season) return null;

  return (
    <Card className="p-6 mb-6 bg-gradient-to-r from-acredita-primary to-acredita-secondary text-white">
      <h2 className="text-2xl font-bold mb-2">Temporada Atual</h2>
      <div className="mb-2 font-semibold text-lg">{season.title}</div>
      <div className="mb-2 text-sm">{season.description}</div>
      <div className="text-xs">{season.start_date} - {season.end_date}</div>
      <div className="mt-2 text-xs">Estado: <span className="font-bold">{season.status}</span></div>
    </Card>
  );
};

export default CurrentSeasonBanner;
