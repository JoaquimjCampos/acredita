import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import MarketplaceService from '../services/marketplace/marketplaceService';
import { ServiceOrderDTO } from '../types/api';
import { ShoppingBag, ArrowLeft, CheckCircle, Clock, AlertCircle, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const MyOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<ServiceOrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const response = await MarketplaceService.getMyOrders();
        setOrders(response);
      } catch (error: any) {
        console.error('Erro ao carregar pedidos:', error);
        toast.error('Erro ao carregar pedidos');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'pending':
        return 'text-yellow-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'Pendente',
      accepted: 'Aceite',
      in_progress: 'Em Progresso',
      completed: 'Concluído',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  const filteredOrders = selectedStatus
    ? orders.filter((order) => order.status === selectedStatus)
    : orders;

  const statuses = [
    { key: 'pending', label: 'Pendentes', count: orders.filter((o) => o.status === 'pending').length },
    { key: 'accepted', label: 'Aceites', count: orders.filter((o) => o.status === 'accepted').length },
    { key: 'in_progress', label: 'Em Progresso', count: orders.filter((o) => o.status === 'in_progress').length },
    { key: 'completed', label: 'Concluídos', count: orders.filter((o) => o.status === 'completed').length },
  ];

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Autenticação necessária</h2>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Fazer Login
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
        <div className="max-w-5xl mx-auto px-4">
          <button
            onClick={() => navigate('/marketplace')}
            className="mb-4 inline-flex items-center gap-2 text-cyan-100 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Marketplace
          </button>
          <h1 className="text-4xl font-bold">Meus Pedidos</h1>
          <p className="text-cyan-100 mt-2">{orders.length} pedido(s) total</p>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-5xl mx-auto px-4">
          {/* Status Filters */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedStatus(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedStatus === null
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Todos ({orders.length})
            </button>
            {statuses.map((status) => (
              <button
                key={status.key}
                onClick={() => setSelectedStatus(status.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  selectedStatus === status.key
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {status.label} ({status.count})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner text="Carregando pedidos..." />
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h2>
              <p className="text-gray-600 mb-4">
                {selectedStatus ? 'Nenhum pedido com este status' : 'Comece a fazer pedidos no marketplace'}
              </p>
              <button
                onClick={() => navigate('/marketplace')}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" /> Ir para Marketplace
              </button>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="p-6 border-l-4 border-cyan-500 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        Pedido #{order.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('pt-AO', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                      {getStatusIcon(order.status)}
                      <span className={`font-semibold text-sm ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4 pb-4 border-b">
                    {/* Listing Info */}
                    <div className="flex gap-4">
                      <div className="h-20 w-20 rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {order.listing?.images && order.listing.images.length > 0 ? (
                          <img
                            src={order.listing.images[0]}
                            alt={order.listing.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e0f2fe" width="100" height="100"/%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <ShoppingBag className="h-8 w-8 text-cyan-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{order.listing?.title}</h4>
                        <p className="text-sm text-gray-600">
                          {order.listing?.provider?.business_name || 'Provider'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            {order.listing?.provider?.municipality || 'Luanda'}
                          </div>
                          <span className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs font-semibold rounded">
                            {order.listing?.listing_type === 'product' ? 'Produto' : 'Serviço'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Quantidade</p>
                      <p className="text-lg font-semibold text-gray-900">1</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Preço Unitário</p>
                      <p className="text-lg font-semibold text-gray-900">
                        AOA {Number(order.listing?.base_price || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status Pagamento</p>
                      <p className={`text-lg font-semibold ${
                        order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-lg font-semibold text-cyan-600">
                        AOA {Number(order.total_amount).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/marketplace/${order.listing?.id}`)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                    >
                      Ver Item
                    </button>
                    {order.status === 'pending' && (
                      <button
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium"
                      >
                        Cancelar Pedido
                      </button>
                    )}
                    {order.status === 'completed' && (
                      <button
                        onClick={() => navigate(`/reviews/${order.id}`)}
                        className="px-4 py-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-700 rounded-lg transition-colors text-sm font-medium"
                      >
                        Deixar Avaliação
                      </button>
                    )}
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

export default MyOrdersPage;
