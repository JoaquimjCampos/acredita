import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { Calendar, Video, Sparkles } from 'lucide-react';
import { useSeasonDetails } from '../hooks/useSeasonDetails';
import { useEpisodes } from '../hooks/useEpisodes';

const SeasonDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { season, loading: seasonLoading, error: seasonError } = useSeasonDetails(id);
  const { episodes, loading: episodesLoading, error: episodesError } = useEpisodes(id);

  if (seasonLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner text="A carregar detalhes da temporada..." />
        </div>
      </Layout>
    );
  }

  if (seasonError || !season) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 font-semibold mb-4">{seasonError || 'Temporada não encontrada.'}</div>
            <button onClick={() => navigate(-1)} className="text-amber-600 hover:text-amber-700 font-medium">
              ← Voltar
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <button onClick={() => navigate(-1)} className="mb-6 text-amber-100 hover:text-white font-medium text-sm flex items-center gap-2">
            ← Voltar
          </button>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{season.title}</h1>
              <p className="text-amber-100 mt-1">{season.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 border-l-4 border-amber-500">
              <p className="text-sm text-gray-600 mb-1">Início</p>
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <Calendar className="h-5 w-5 text-amber-600" />
                {new Date(season.start_date).toLocaleDateString('pt-AO')}
              </div>
            </Card>
            <Card className="p-6 border-l-4 border-amber-500">
              <p className="text-sm text-gray-600 mb-1">Fim</p>
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <Calendar className="h-5 w-5 text-amber-600" />
                {new Date(season.end_date).toLocaleDateString('pt-AO')}
              </div>
            </Card>
            <Card className="p-6 border-l-4 border-amber-500">
              <p className="text-sm text-gray-600 mb-1">Estado</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700">
                {season.status}
              </span>
            </Card>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Episódios</h2>
          {episodesLoading ? (
            <LoadingSpinner text="A carregar episódios..." />
          ) : episodesError ? (
            <div className="text-center text-red-600 font-semibold mb-8">{episodesError}</div>
          ) : episodes && episodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {episodes.map((ep: any) => (
                <Card key={ep.id} className="p-6 border-l-4 border-amber-500 hover:shadow-lg transition-shadow">
                  {ep.video_url ? (
                    <video controls className="w-full h-40 rounded-lg mb-4 bg-black">
                      <source src={ep.video_url} type="video/mp4" />
                      Seu navegador não suporta vídeo.
                    </video>
                  ) : ep.image_url ? (
                    <img src={ep.image_url} alt={`Episódio ${ep.titulo}`} className="w-full h-40 object-cover rounded-lg mb-4" loading="lazy" />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <Video className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900">Episódio {ep.numero}</h3>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">{ep.titulo}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                    <Calendar className="h-4 w-4" />
                    {new Date(ep.data_exibicao).toLocaleDateString('pt-AO')}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{ep.descricao}</p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum episódio encontrado</h3>
              <p className="text-gray-600">Esta temporada ainda não possui episódios registados.</p>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SeasonDetailsPage;
