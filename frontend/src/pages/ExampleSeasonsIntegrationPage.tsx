import React from 'react';
import { useSeasons } from '../hooks/useSeasons';
import { Card, LoadingSpinner } from '../components/common';

const ExampleSeasonsIntegrationPage: React.FC = () => {
  const { seasons, loading, error } = useSeasons();

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Exemplo de Integração de Temporadas</h1>
      {loading ? (
        <LoadingSpinner text="A carregar temporadas..." />
      ) : error ? (
        <div className="text-red-600 font-semibold">{error}</div>
      ) : seasons.length === 0 ? (
        <Card className="text-center py-8">Nenhuma temporada encontrada.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {seasons.map((season: any) => (
            <Card key={season.id} className="p-4">
              <h2 className="text-lg font-semibold text-acredita-primary mb-2">{season.title}</h2>
              <p className="text-gray-700 mb-1">{season.description}</p>
              <div className="text-xs text-gray-500 mb-1">{season.status}</div>
              <div className="text-xs text-gray-400">{new Date(season.start_date).toLocaleDateString('pt-AO')} - {new Date(season.end_date).toLocaleDateString('pt-AO')}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExampleSeasonsIntegrationPage;
