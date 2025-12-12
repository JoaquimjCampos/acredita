import React from 'react';
import { useVideos } from '../hooks/useVideos';
import { Card, LoadingSpinner } from '../components/common';
import { OptimizedImage } from './common/OptimizedImage';

const VideosSection: React.FC = () => {
  const { videos, loading, error } = useVideos();
  const [search, setSearch] = React.useState('');
  const [type, setType] = React.useState('all');
  const [order, setOrder] = React.useState<'title'|'video_type'>('title');
  let filteredVideos = videos.filter(video =>
    (type === 'all' || (video.video_type === type)) &&
    video.title.toLowerCase().includes(search.toLowerCase())
  );
  filteredVideos = [...filteredVideos].sort((a, b) => {
    if (order === 'title') return a.title.localeCompare(b.title);
    if (order === 'video_type') return (a.video_type || '').localeCompare(b.video_type || '');
    return 0;
  });

  if (loading) {
    return <LoadingSpinner size="lg" text="A carregar vídeos..." />;
  }

  if (error) {
    return <div className="text-red-600 font-semibold text-center" role="alert">{error}</div>;
  }

  if (!videos.length) {
    return (
      <Card className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum vídeo disponível</h3>
        <p className="text-gray-600 mb-6">Não há vídeos no momento.</p>
      </Card>
    );
  }

  return (
    <section className="py-8 bg-white animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Pesquisar vídeo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-4 py-2 w-full md:w-1/4"
          />
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="border rounded px-4 py-2 w-full md:w-1/4"
          >
            <option value="all">Todos os tipos</option>
            <option value="entrevista">Entrevista</option>
            <option value="pitch">Pitch</option>
            <option value="aula">Aula</option>
            <option value="outro">Outro</option>
          </select>
          <select
            value={order}
            onChange={e => setOrder(e.target.value as 'title'|'video_type')}
            className="border rounded px-4 py-2 w-full md:w-1/4"
          >
            <option value="title">Ordenar por Título</option>
            <option value="video_type">Ordenar por Tipo</option>
          </select>
        </div>
        {/* Carrossel visual para destaque */}
        {filteredVideos.length > 0 ? (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-8 min-w-full">
              {filteredVideos.map(video => (
                <Card key={video.id} className="flex flex-col min-w-[320px] max-w-xs shadow-lg hover:scale-105 transition-transform duration-300">
                  {video.thumbnail && (
                    <a href={video.url} target="_blank" rel="noopener noreferrer">
                      <OptimizedImage src={video.thumbnail} alt={video.title} width={400} height={160} className="h-40 w-full object-cover rounded-t" lazy={true} />
                    </a>
                  )}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{video.title}</h3>
                    <p className="text-gray-700 mb-4">{video.description}</p>
                    <span className="text-xs text-gray-500 mb-2">Tipo: {video.video_type}</span>
                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-acredita-primary font-semibold mt-auto">Assistir</a>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum vídeo encontrado</h3>
            <p className="text-gray-600 mb-6">Ajuste os filtros ou tente outra busca.</p>
          </Card>
        )}
      </div>
    </section>
  );
};

export default VideosSection;
