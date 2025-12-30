import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { ArrowLeft, CheckCircle, MapPin, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { mcpFetch } from '../mcpClient';
import { ServiceProvider, ServiceListing } from '../types/marketplace';

const MarketplaceProviderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProvider(id);
      loadProviderListings(id);
    }
  }, [id]);

  const loadProvider = async (providerId: string) => {
    try {
      setLoading(true);
      const { data } = await mcpFetch<ServiceProvider>(`/api/v2/marketplace/providers/${providerId}/`);
      setProvider(data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar fornecedor');
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const loadProviderListings = async (providerId: string) => {
    try {
      // Prefer server-side filter if supported
      const { data } = await mcpFetch(`/api/v2/marketplace/listings/?provider=${providerId}`);
      let items = Array.isArray(data) ? data : (data?.results ?? []);
      if (!items || items.length === 0) {
        // Fallback: fetch all and filter client-side
        const { data: all } = await mcpFetch(`/api/v2/marketplace/listings/`);
        const allItems = Array.isArray(all) ? all : (all?.results ?? []);
        items = (allItems as ServiceListing[]).filter(l => String(l.provider?.id) === String(providerId));
      }
      setListings(items as ServiceListing[]);
    } catch (err) {
      console.warn('Falha ao carregar anúncios do fornecedor (tentativa com filtro). Tentando fallback:', err);
      try {
        const { data: all } = await mcpFetch(`/api/v2/marketplace/listings/`);
        const allItems = Array.isArray(all) ? all : (all?.results ?? []);
        const items = (allItems as ServiceListing[]).filter(l => String(l.provider?.id) === String(providerId));
        setListings(items);
      } catch (err2) {
        console.warn('Fallback também falhou:', err2);
        setListings([]);
      }
    }
  };

  if (loading) return <Layout><LoadingSpinner text="Carregando fornecedor..." /></Layout>;
  if (!provider) return <Layout><p className="text-red-500">Fornecedor não encontrado</p></Layout>;

  return (
    <Layout>
      <button
        onClick={() => navigate('/marketplace')}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2 m-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao Marketplace
      </button>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{provider.business_name}</h1>
              {provider.verified && (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Verificado
                </div>
              )}
            </div>
          </div>

          {provider.professional_category && (
            <div className="mb-2 inline-block bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded">
              {provider.professional_category.name}
            </div>
          )}

          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="font-semibold">{Number(provider?.rating ?? 0).toFixed(1)}</span>
            <span className="text-gray-600 text-sm">({provider.total_reviews} reviews)</span>
          </div>

          <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
            <MapPin className="h-4 w-4" />
            {provider.municipality}, {provider.province}
          </div>

          {provider.description && (
            <p className="text-sm text-gray-600 mb-3">{provider.description}</p>
          )}
        </Card>

        {/* Provider Listings */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Anúncios do Fornecedor</h2>
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div key={listing.id} className="cursor-pointer" onClick={() => navigate(`/marketplace/listing/${listing.id}`)}>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="w-full h-40 bg-gradient-to-br from-gray-200 to-gray-300">
                      {listing.images && listing.images[0] ? (
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-500 text-4xl">{listing.listing_type === 'service' ? '💼' : '📦'}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{listing.title}</h3>
                        {listing.listing_type === 'service' ? (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Serviço</span>
                        ) : (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Produto</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{listing.description}</p>
                      <div className="text-xl font-bold text-blue-600">
                        AOA {listing.base_price.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Este fornecedor ainda não possui anúncios visíveis.</p>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default MarketplaceProviderPage;
