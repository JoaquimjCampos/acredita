import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import MarketplaceService from '../services/marketplace/marketplaceService';
import { ServiceListingDTO, ServiceCategoryDTO, FilterOptions } from '../types/api';
import { useAuth } from '../hooks/useAuth';
import { ShoppingBag, Search, Plus, DollarSign, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState<ServiceListingDTO[]>([]);
  const [categories, setCategories] = useState<ServiceCategoryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await MarketplaceService.getCategories();
        setCategories(data);
      } catch (error: any) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const filters: FilterOptions = {
          search: searchTerm || undefined,
          category_id: selectedCategory ? parseInt(selectedCategory) : undefined,
        };
        const response = await MarketplaceService.getListings(filters);
        setListings(response.results || response);
      } catch (error: any) {
        toast.error(error.message || 'Erro ao carregar serviços');
        setListings([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchListings();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory]);

  const categoryOptions = useMemo(() => categories, [categories]);

  const handleCreateListing = () => {
    if (!user) {
      toast.error('Deve estar autenticado para anunciar');
      navigate('/login');
      return;
    }
    navigate('/marketplace/create');
  };

  return (
    <Layout>
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold">Marketplace</h1>
              <p className="text-cyan-100 mt-1">Descubra e ofereça serviços profissionais na comunidade Acredita.</p>
            </div>
            {user && (
              <button
                onClick={handleCreateListing}
                className="ml-auto flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="h-4 w-4" /> Anunciar Serviço
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar serviços..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              {categoryOptions.length > 0 && (
                <div className="sm:w-60 relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 appearance-none"
                  >
                    <option value="">Todas as categorias</option>
                    {categoryOptions.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </Card>

          {loading ? (
            <div className="flex justify-center py-12"><LoadingSpinner text="Carregando serviços..." /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden border-l-4 border-cyan-500 hover:shadow-md transition-shadow">
                  {/* Image Section */}
                  <div className="h-48 bg-gradient-to-br from-cyan-100 to-blue-100 relative overflow-hidden">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23e0f2fe" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="18" text-anchor="middle" dy=".3em" fill="%230369a1"%3EImagem não disponível%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-cyan-300" />
                      </div>
                    )}
                    {listing.listing_type === 'product' && (
                      <span className="absolute top-2 right-2 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                        Produto
                      </span>
                    )}
                    {listing.featured && (
                      <span className="absolute top-2 left-2 px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-semibold rounded-full">
                        ⭐ Destaque
                      </span>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-2">{listing.title}</h2>
                    </div>
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">{listing.description}</p>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-3">
                      {listing.category && <span className="px-2 py-1 rounded-full bg-cyan-50 text-cyan-700">{typeof listing.category === 'string' ? listing.category : listing.category?.name}</span>}
                    </div>
                    <div className="flex items-center justify-between mb-4 py-3 border-t border-gray-200">
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {listing.provider?.municipality || 'Luanda'}
                      </span>
                      {listing.listing_type === 'product' && listing.quantity_available && (
                        <span className="text-xs text-gray-600 font-semibold">{listing.quantity_available} em stock</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-cyan-600 flex items-center gap-1">
                        <DollarSign className="h-4 w-4" /> {listing.base_price}
                      </span>
                      {listing.provider?.provider_type === 'merchant' && (
                        <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">Comerciante</span>
                      )}
                    </div>
                    <button
                      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg transition-colors text-sm font-medium"
                      onClick={() => navigate(`/marketplace/${listing.id}`)}
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </Card>
              ))}
              {listings.length === 0 && (
                <Card className="p-8 text-center col-span-full">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-700">Nenhum serviço encontrado. Ajuste sua pesquisa.</p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MarketplacePage;
