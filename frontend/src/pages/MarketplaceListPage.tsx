import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { Search, MapPin, Star, CheckCircle, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import { mcpFetch } from '../mcpClient';
import { ServiceListing } from '../types/marketplace';

const MarketplaceListPage: React.FC = () => {
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'service' | 'product'>('all');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [sortBy, setSortBy] = useState('-featured');
  const [filteredListings, setFilteredListings] = useState<ServiceListing[]>([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setLoading(true);
      const { data } = await mcpFetch('/api/v2/marketplace/listings/');
      setListings(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar anúncios do marketplace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...listings];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (l) =>
          l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.provider.business_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter((l) => l.listing_type === selectedType);
    }

    // Filter by province
    if (selectedProvince) {
      filtered = filtered.filter((l) => l.provider.province === selectedProvince);
    }

    // Sort
    if (sortBy === '-featured') {
      filtered.sort((a, b) => (b.featured ? 1 : -1) || b.views - a.views);
    } else if (sortBy === '-views') {
      filtered.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.base_price - b.base_price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.base_price - a.base_price);
    }

    setFilteredListings(filtered);
  }, [listings, searchTerm, selectedType, selectedProvince, sortBy]);

  const provinces = Array.from(new Set(listings.map((l) => l.provider.province)));

  if (loading) return <Layout><LoadingSpinner text="Carregando marketplace..." /></Layout>;

  return (
    <Layout>
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Marketplace Acredita</h1>
          <p className="text-blue-100 text-lg">Descubra serviços e produtos de qualidade</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Pesquisar</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Serviço, produto ou fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="service">Serviços</option>
                <option value="product">Produtos</option>
              </select>
            </div>

            {/* Province Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Localidade</label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas as províncias</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="-featured">Destaque</option>
                <option value="-views">Mais visualizações</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Mostrando {filteredListings.length} de {listings.length} anúncios
        </div>

        {/* Listings Grid */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="cursor-pointer"
                onClick={() => navigate(`/marketplace/listing/${listing.id}`)}
              >
                <Card className="flex flex-col hover:shadow-lg transition h-full">
                {/* Image */}
                <div className="w-full h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-lg overflow-hidden">
                  {listing.images && listing.images[0] ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {listing.listing_type === 'service' ? (
                        <span className="text-gray-500 text-4xl">💼</span>
                      ) : (
                        <ShoppingBag className="h-16 w-16 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>

                {/* Featured Badge */}
                {listing.featured && (
                  <div className="bg-amber-100 text-amber-800 px-3 py-1 text-xs font-semibold rounded">
                    ⭐ Destaque
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{listing.title}</h3>
                    {listing.listing_type === 'service' ? (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Serviço
                      </span>
                    ) : (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Produto
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{listing.description}</p>

                  {/* Provider */}
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-800">
                        {listing.provider.business_name}
                      </span>
                      {listing.provider.verified && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    {listing.provider.professional_category && (
                      <div className="text-xs text-gray-600 flex items-center gap-1">
                        <span className="inline-block bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                          {listing.provider.professional_category.name}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                      <MapPin className="h-3 w-3" />
                      {listing.provider.municipality}, {listing.provider.province}
                    </div>
                  </div>

                  {/* Rating & Views */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{Number(listing.provider?.rating ?? 0).toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-gray-500">{listing.views} visualizações</span>
                  </div>

                  {/* Price */}
                  <div className="text-2xl font-bold text-blue-600 mb-4">
                    AOA {listing.base_price.toLocaleString('pt-AO', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>

                  <Button
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/marketplace/listing/${listing.id}`);
                    }}
                  >
                    Ver Detalhes
                  </Button>
                </div>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">Nenhum anúncio encontrado com os filtros selecionados.</p>
            <Button onClick={() => { setSearchTerm(''); setSelectedType('all'); setSelectedProvince(''); }}>
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MarketplaceListPage;
