import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { Calendar, Sparkles } from 'lucide-react';
import { useSeasons } from '../hooks/useSeasons';
import { Season } from '../types/Season';

const SeasonsPage = () => {
  const navigate = useNavigate();
  const { seasons, loading, error } = useSeasons();

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner text="Carregando temporadas..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Temporadas</h1>
              <p className="text-amber-100 mt-1">Acompanhe todas as temporadas do Acredita em Ti</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          {error ? (
            <div className="text-center text-red-600 font-semibold py-12">{error}</div>
          ) : !seasons || seasons.length === 0 ? (
            <Card className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma temporada encontrada</h3>
              <p className="text-gray-600">Ainda não há temporadas registadas. Fique atento às novidades!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seasons.map((season: Season) => (
                <Card key={season.id} className="p-6 border-l-4 border-amber-500 hover:shadow-lg transition-shadow">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{season.title}</h3>
                    <p className="text-gray-700 text-sm mb-3">{season.description}</p>
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-amber-600" />
                      <span>
                        {new Date(season.start_date).toLocaleDateString('pt-AO')} -{' '}
                        {new Date(season.end_date).toLocaleDateString('pt-AO')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Estado:</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        {season.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => navigate(`/season-details/${season.id}`)}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Ver Detalhes
                    </button>
                    <button
                      onClick={() => navigate('/participantes')}
                      className="w-full bg-white border border-amber-600 text-amber-600 hover:bg-amber-50 font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Ver Participantes
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SeasonsPage;
