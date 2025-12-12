import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button, Card, LoadingSpinner } from '../components/common';
import MarketplaceService from '../services/marketplace/marketplaceService';
import { ServiceListingDTO } from '../types/api';
import { ShoppingBag, ArrowRight, Store } from 'lucide-react';
import toast from 'react-hot-toast';

const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ServiceListingDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await MarketplaceService.getListings({ status: 'active' });
        setOrders(response.results);
      } catch (error: any) {
        toast.error('Erro ao carregar minhas solicitações.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <Layout><div className="flex justify-center items-center h-96"><LoadingSpinner size="lg" /></div></Layout>;
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Store className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Minhas Solicitações</h1>
              <p className="text-blue-100 mt-1">Serviços profissionais que você requisitou</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          {orders.length === 0 ? (
            <Card className="p-12 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma solicitação encontrada</h3>
              <p className="text-gray-600 mb-6">Você ainda não requisitou nenhum serviço no marketplace.</p>
              <Button variant="primary" onClick={() => navigate('/marketplace')}>
                Explorar Marketplace
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map((listing) => (
                <Card key={listing.id} className="p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex-1">{listing.title}</h3>
                    <Store className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{listing.location}</p>
                  <div className="flex items-center justify-between mb-4 py-3 border-y border-gray-200">
                    <span className="text-sm text-gray-500">Solicitação Ativa</span>
                    <span className="text-sm font-semibold text-blue-600">{listing.price} Kz</span>
                  </div>
                  <Button 
                    size="sm"
                    variant="outline" 
                    onClick={() => navigate(`/marketplace/${listing.id}`)}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    Ver Serviço
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyOrdersPage;
