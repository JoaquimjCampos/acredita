import React from 'react';
import { useAds } from '../hooks/useAds';
import { Card, LoadingSpinner } from '../components/common';

const AdsSection: React.FC = () => {
  const { ads, loading, error } = useAds();
  const [search, setSearch] = React.useState('');
  const [type, setType] = React.useState('all');
  const [activeOnly, setActiveOnly] = React.useState(true);
  const [order, setOrder] = React.useState<'title'|'type'>('title');

  let filteredAds = ads.filter(ad =>
    (type === 'all' || ad.type === type) &&
    ad.title.toLowerCase().includes(search.toLowerCase()) &&
    (!activeOnly || ad.active)
  );
  filteredAds = [...filteredAds].sort((a, b) => {
    if (order === 'title') return a.title.localeCompare(b.title);
    if (order === 'type') return (a.type || '').localeCompare(b.type || '');
    return 0;
  });

  if (loading) {
    return <LoadingSpinner size="lg" text="A carregar publicidades..." />;
  }

  if (error) {
    return <div className="text-red-600 font-semibold text-center" role="alert">{error}</div>;
  }

  if (!ads.length) {
    return (
      <Card className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma publicidade activa</h3>
        <p className="text-gray-600 mb-6">Não há publicidades no momento.</p>
      </Card>
    );
  }

  return (
    <section className="py-8 bg-white animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Pesquisar publicidade..."
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
            <option value="banner">Banner</option>
            <option value="video">Vídeo</option>
            <option value="popup">Popup</option>
          </select>
          <select
            value={order}
            onChange={e => setOrder(e.target.value as 'title'|'type')}
            className="border rounded px-4 py-2 w-full md:w-1/4"
          >
            <option value="title">Ordenar por Título</option>
            <option value="type">Ordenar por Tipo</option>
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={e => setActiveOnly(e.target.checked)}
              className="form-checkbox"
            />
            Apenas ativos
          </label>
        </div>
        {/* Carrossel visual para destaque */}
        {filteredAds.length > 0 ? (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-8 min-w-full">
              {filteredAds.map(ad => (
                <Card key={ad.id} className="flex flex-col min-w-[320px] max-w-xs shadow-lg hover:scale-105 transition-transform duration-300">
                  {ad.image_url && (
                    <a href={ad.link} target="_blank" rel="noopener noreferrer">
                      <img src={ad.image_url} alt={ad.title} className="h-40 w-full object-cover rounded-t" />
                    </a>
                  )}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{ad.title}</h3>
                    <p className="text-gray-700 mb-4">{ad.description}</p>
                    <span className="text-xs text-gray-500 mb-2">Tipo: {ad.type}</span>
                    <a href={ad.link} target="_blank" rel="noopener noreferrer" className="text-acredita-primary font-semibold mt-auto">Saber Mais</a>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma publicidade encontrada</h3>
            <p className="text-gray-600 mb-6">Ajuste os filtros ou tente outra busca.</p>
          </Card>
        )}
      </div>
    </section>
  );
};

export default AdsSection;
