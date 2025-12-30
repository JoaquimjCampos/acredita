import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useCartContext } from '../contexts/CartContext';
import { useAuth } from '../hooks/useAuth';
import MarketplaceService from '../services/marketplace/marketplaceService';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCartContext();
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Autenticação necessária</h2>
              <p className="text-gray-600 mb-4">Por favor, faça login para ver seu carrinho</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Fazer Login
              </button>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Carrinho vazio');
      return;
    }

    setSubmitting(true);
    try {
      // Create orders for each item in cart
      const orders = await Promise.all(
        items.map((item) =>
          MarketplaceService.createOrder({
            listing_id: item.id,
            quantity: item.quantity,
          })
        )
      );

      if (orders.length > 0) {
        toast.success(`${orders.length} pedido(s) criado(s) com sucesso!`);
        clearCart();
        navigate('/my-orders');
      }
    } catch (error: any) {
      console.error('Erro ao criar pedidos:', error);
      toast.error(error.message || 'Erro ao criar pedidos');
    } finally {
      setSubmitting(false);
    }
  };

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
          <h1 className="text-4xl font-bold">Carrinho de Compras</h1>
          <p className="text-cyan-100 mt-2">{totalItems} item(ns) no carrinho</p>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-5xl mx-auto px-4">
          {items.length === 0 ? (
            <Card className="p-8 text-center">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Carrinho vazio</h2>
              <p className="text-gray-600 mb-4">Adicione itens do marketplace para começar</p>
              <button
                onClick={() => navigate('/marketplace')}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" /> Ir para Marketplace
              </button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="p-4 border-l-4 border-cyan-500">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {item.listing.images && item.listing.images.length > 0 ? (
                          <img
                            src={item.listing.images[0]}
                            alt={item.listing.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e0f2fe" width="100" height="100"/%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <ShoppingCart className="h-8 w-8 text-cyan-300" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.listing.title}</h3>
                            <p className="text-sm text-gray-600">
                              {item.listing.provider?.business_name || 'Provider'}
                            </p>
                          </div>
                          <span className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs font-semibold rounded">
                            {item.listing.listing_type === 'product' ? 'Produto' : 'Serviço'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          {item.listing.listing_type === 'product' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Reduzir quantidade"
                              >
                                <Minus className="h-4 w-4 text-gray-600" />
                              </button>
                              <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                disabled={
                                  item.listing.quantity_available
                                    ? item.quantity >= item.listing.quantity_available
                                    : false
                                }
                                title="Aumentar quantidade"
                              >
                                <Plus className="h-4 w-4 text-gray-600" />
                              </button>
                            </div>
                          )}

                          {/* Price & Remove */}
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                {item.quantity > 1 && `${item.quantity} x `}
                                AOA {Number(item.listing.base_price).toLocaleString()}
                              </p>
                              <p className="font-semibold text-cyan-600">
                                AOA {(Number(item.listing.base_price) * item.quantity).toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-2 hover:bg-red-50 rounded transition-colors text-red-500"
                              title="Remover do carrinho"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Summary Sidebar */}
              <div className="lg:col-span-1">
                <Card className="p-6 sticky top-20 border-l-4 border-cyan-600">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo do Pedido</h3>

                  <div className="space-y-3 mb-6 pb-6 border-b">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({totalItems} itens):</span>
                      <span className="font-semibold text-gray-900">
                        AOA {totalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Impostos:</span>
                      <span className="font-semibold text-gray-900">AOA 0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Envio:</span>
                      <span className="font-semibold text-gray-900">Grátis</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold text-gray-900">Total:</span>
                      <span className="font-bold text-cyan-600">
                        AOA {totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={submitting || items.length === 0}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors mb-3"
                  >
                    {submitting ? <LoadingSpinner /> : 'Finalizar Compra'}
                  </button>

                  <button
                    onClick={() => clearCart()}
                    className="w-full text-gray-600 hover:text-gray-900 py-2 transition-colors"
                  >
                    Limpar Carrinho
                  </button>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
