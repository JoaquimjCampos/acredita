import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import MarketplaceService from '../services/marketplace/marketplaceService';
import { ServiceListingDTO } from '../types/api';
import { useAuth } from '../hooks/useAuth';
import { ShoppingBag, MapPin, DollarSign, User, Calendar, Phone, Mail, ArrowLeft, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MarketplaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<ServiceListingDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        if (id) {
          const data = await MarketplaceService.getListing(parseInt(id));
          setListing(data);
        }
      } catch (error: any) {
        toast.error(error.message || 'Erro ao carregar serviço');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleContact = () => {
    if (!user) {
      toast.error('Deve estar autenticado para contatar');
      navigate('/login');
      return;
    }
    // Implementar lógica de contato
    toast.success('Mensagem enviada com sucesso!');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner text="Carregando serviço..." />
        </div>
      </Layout>
    );
  }

  if (!listing) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Serviço não encontrado</h2>
              <button
                onClick={() => navigate('/marketplace')}
                className="mt-4 inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar para marketplace
              </button>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/marketplace')}
            className="mb-4 inline-flex items-center gap-2 text-cyan-100 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold">{listing.title}</h1>
              <p className="text-cyan-100 mt-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {listing.location}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-cyan-100 text-sm">Preço</p>
              <p className="text-3xl font-bold flex items-center gap-1 justify-end">
                <DollarSign className="h-6 w-6" /> {listing.price}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {listing.category && (
              <Card className="p-4 border-l-4 border-cyan-500">
                <p className="text-gray-600 text-sm mb-1">Categoria</p>
                <p className="text-lg font-semibold text-gray-900">{typeof listing.category === 'string' ? listing.category : listing.category?.name}</p>
              </Card>
            )}
            {listing.views && (
              <Card className="p-4 border-l-4 border-cyan-500">
                <p className="text-gray-600 text-sm mb-1">Visualizações</p>
                <p className="text-lg font-semibold text-gray-900">{listing.views}</p>
              </Card>
            )}
            <Card className="p-4 border-l-4 border-cyan-500">
              <p className="text-gray-600 text-sm mb-1">Tipo de Preço</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{listing.price_type}</p>
            </Card>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Descrição do Serviço</h2>
            <p className="text-gray-700 leading-relaxed">{listing.description}</p>
          </Card>

          {listing.provider && (
            <Card className="p-6 bg-cyan-50 border-l-4 border-cyan-600">
              <h2 className="text-xl font-bold text-cyan-900 mb-4">Informações do Prestador</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-cyan-600" />
                  <div>
                    <p className="text-sm text-cyan-700">Prestador</p>
                    <p className="font-semibold text-cyan-900">{listing.provider?.user?.first_name} {listing.provider?.user?.last_name}</p>
                  </div>
                </div>
                {listing.provider?.user?.phone_number && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-cyan-600" />
                    <div>
                      <p className="text-sm text-cyan-700">Telefone</p>
                      <p className="font-semibold text-cyan-900">{listing.provider.user.phone_number}</p>
                    </div>
                  </div>
                )}
                {listing.provider?.user?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-cyan-600" />
                    <div>
                      <p className="text-sm text-cyan-700">Email</p>
                      <p className="font-semibold text-cyan-900">{listing.provider.user.email}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-cyan-600" />
                  <div>
                    <p className="text-sm text-cyan-700">Membro desde</p>
                    <p className="font-semibold text-cyan-900">{new Date(listing.created_at).toLocaleDateString('pt-AO')}</p>
                  </div>
                </div>
              </div>

              {user && user.id?.toString() !== listing.provider_id?.toString() && (
                <button
                  onClick={handleContact}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  <MessageCircle className="h-5 w-5" /> Entrar em Contato
                </button>
              )}
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MarketplaceDetailPage;
