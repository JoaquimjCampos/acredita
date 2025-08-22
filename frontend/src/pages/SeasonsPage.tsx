import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { Users, Star, Calendar } from 'lucide-react';
import { useSeasons } from '../hooks/useSeasons';
import { Season } from '../types/Season';

const SeasonsPage = () => {
  const navigate = useNavigate();
  const { seasons, loading, error } = useSeasons();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-6" tabIndex={-1} aria-label="Conteúdo principal das temporadas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-acredita-primary" /> Temporadas <Star className="h-7 w-7 text-yellow-400 ml-2" />
          </h2>
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <LoadingSpinner text="A carregar temporadas..." />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 font-semibold mb-8">{error}</div>
          ) : seasons.length === 0 ? (
            <Card className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma temporada encontrada</h3>
              <p className="text-gray-600 mb-6">Ainda não há temporadas registadas. Fique atento às novidades!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {seasons.map((season: Season) => (
                <Card key={season.id} className="p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-acredita-primary mb-2">{season.title}</h3>
                    <p className="text-gray-700 mb-2">{season.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(season.start_date).toLocaleDateString('pt-AO')} - {new Date(season.end_date).toLocaleDateString('pt-AO')}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">Estado: <span className="font-semibold text-acredita-primary">{season.status}</span></div>
                    {season.poster_image && (
                      <img src={season.poster_image} alt={season.title} className="w-full h-40 object-cover rounded-lg mb-2" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <Button onClick={() => navigate(`/temporadas/${season.id}`)} size="sm">Ver Detalhes</Button>
                    <Button variant="outline" size="sm" onClick={() => navigate('/participantes')}>Ver Participantes</Button>
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
