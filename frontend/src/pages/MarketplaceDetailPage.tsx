import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { ArrowLeft, MapPin, Star, CheckCircle, Heart, Share2, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { ServiceListing } from '../types/marketplace';
import { mcpFetch } from '../mcpClient';

const MarketplaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const messagingAvailable = false; // backend não expõe endpoint de mensagens neste ambiente
  const [listing, setListing] = useState<ServiceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contacting, setContacting] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [orderNotes, setOrderNotes] = useState('');
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    if (id) loadListing(id);
  }, [id]);

  const loadListing = async (listingId: string) => {
    try {
      setLoading(true);
      const { data } = await mcpFetch<ServiceListing>(`/api/v2/marketplace/listings/${listingId}/`);
      setListing(data);
      setMainImage(data?.images?.[0] || '');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar anúncio');
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!listing) return;
    const msg = contactMessage.trim();
    if (!msg) {
      toast.error('Escreva uma mensagem para o fornecedor.');
      return;
    }
    // Backend ainda não expõe endpoint de mensagens; evitamos 404 e damos feedback
    toast.error('Canal de mensagens não está disponível neste ambiente. Use o pedido para contactar.');
    setShowContact(false);
  };

  const handlePlaceOrder = async () => {
    if (!listing) return;
    const qty = Math.max(1, Number(orderQuantity) || 1);
    try {
      setOrdering(true);
      await mcpFetch('/api/v2/marketplace/orders/', {
        method: 'POST',
        body: JSON.stringify({
          listing: listing.id,
          quantity: qty,
          notes: orderNotes.trim() || undefined,
        })
      });
      toast.success('Pedido enviado ao fornecedor!');
      setShowOrder(false);
      setOrderQuantity(1);
      setOrderNotes('');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Falha ao fazer pedido');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner text="Carregando anúncio..." /></Layout>;
  if (!listing) return <Layout><p className="text-red-500">Anúncio não encontrado</p></Layout>;

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              {/* Main Image */}
              <div className="w-full h-96 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                {mainImage ? (
                  <img src={mainImage} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl">
                    {listing.listing_type === 'service' ? '💼' : '📦'}
                  </span>
                )}

                {/* Badge */}
                <div className="absolute top-4 left-4">
                  {listing.featured && (
                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
                      ⭐ Destaque
                    </span>
                  )}
                </div>

                {/* Type Badge */}
                <div className="absolute top-4 right-4">
                  {listing.listing_type === 'service' ? (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Serviço
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Produto
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {listing.images && listing.images.length > 1 && (
                <div className="flex gap-2 p-4 bg-gray-50 overflow-x-auto">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMainImage(img)}
                      className={`w-20 h-20 rounded-lg flex-shrink-0 ${
                        mainImage === img ? 'ring-2 ring-blue-600' : 'ring-1 ring-gray-200'
                      }`}
                    >
                      <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover rounded-lg" />
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Info & Contact */}
          <div className="space-y-4">
            {/* Title & Category */}
            <Card>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
              <p className="text-gray-600 text-sm mb-3">{listing.category.name}</p>
              {listing.tags && listing.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {listing.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>

            {/* Price */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
              <div className="text-sm text-gray-600 mb-1">Preço</div>
              <div className="text-4xl font-bold text-blue-600 mb-3">
                AOA {listing.base_price.toLocaleString('pt-AO', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              {listing.listing_type === 'product' && listing.quantity_available !== null && (
                <div className="text-sm text-gray-600 mb-2">
                  Em Stock: <span className="font-semibold">{listing.quantity_available}</span> unidades
                </div>
              )}
              {listing.delivery_time && (
                <div className="text-sm text-gray-600 mb-3">
                  Entrega: <span className="font-semibold">{listing.delivery_time}</span>
                </div>
              )}
              {messagingAvailable ? (
                <Button className="w-full mb-2" onClick={() => setShowContact((v) => !v)}>
                  {showContact ? 'Cancelar' : 'Contactar Fornecedor'}
                </Button>
              ) : (
                <div className="w-full mb-2 text-sm text-gray-600">Mensagens indisponíveis neste ambiente.</div>
              )}
              <Button className="w-full bg-gray-200 text-gray-900 hover:bg-gray-300" onClick={() => setShowOrder((v) => !v)}>
                {showOrder ? 'Cancelar' : 'Fazer Pedido'}
              </Button>
            </Card>

            {/* Actions */}
            <Card className="flex gap-2">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded transition ${
                  isFavorite
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                Guardar
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                <Share2 className="h-5 w-5" />
                Partilhar
              </button>
            </Card>

            {/* Provider Card */}
            <div
              className="cursor-pointer"
              onClick={() => navigate(`/marketplace/provider/${listing.provider.id}`)}
            >
              <Card className="hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{listing.provider.business_name}</h3>
                    {listing.provider.verified && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Verificado
                      </div>
                    )}
                  </div>
                </div>

                {listing.provider.professional_category && (
                  <div className="mb-2 inline-block bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded">
                    {listing.provider.professional_category.name}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-semibold">{Number(listing.provider?.rating ?? 0).toFixed(1)}</span>
                  <span className="text-gray-600 text-sm">({listing.provider.total_reviews} reviews)</span>
                </div>

                <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                  <MapPin className="h-4 w-4" />
                  {listing.provider.municipality}, {listing.provider.province}
                </div>

                {listing.provider.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">{listing.provider.description}</p>
                )}

                <Button className="w-full" onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/marketplace/provider/${listing.provider.id}`);
                }}>
                  Ver Perfil
                </Button>
              </Card>
            </div>
          </div>
        </div>

        {/* Description */}
        <Card className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Descrição</h2>
          <p className="text-gray-700 whitespace-pre-wrap mb-4">{listing.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <div className="text-gray-600 text-sm">Tipo</div>
              <div className="font-semibold text-gray-900">
                {listing.listing_type === 'service' ? 'Serviço' : 'Produto'}
              </div>
            </div>
            {listing.sku && (
              <div>
                <div className="text-gray-600 text-sm">SKU</div>
                <div className="font-semibold text-gray-900">{listing.sku}</div>
              </div>
            )}
            {listing.delivery_time && (
              <div>
                <div className="text-gray-600 text-sm">Entrega</div>
                <div className="font-semibold text-gray-900">{listing.delivery_time}</div>
              </div>
            )}
            <div>
              <div className="text-gray-600 text-sm">Visualizações</div>
              <div className="font-semibold text-gray-900">{listing.views}</div>
            </div>
          </div>
        </Card>

        {/* Contact & Order Section */}
        <Card className="mt-8 bg-blue-50 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Está interessado?</h2>
          <p className="text-gray-700 mb-4">
            Contacte o fornecedor para mais informações sobre este {listing.listing_type === 'service' ? 'serviço' : 'produto'} ou faça já um pedido.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {messagingAvailable ? (
              <Button className="flex-1 flex items-center justify-center gap-2" onClick={() => setShowContact(true)}>
                <MessageCircle className="h-5 w-5" />
                Enviar Mensagem
              </Button>
            ) : (
              <div className="flex-1 text-sm text-gray-700 bg-white border border-blue-100 rounded-lg p-3">
                Canal de mensagens não disponível neste ambiente.
              </div>
            )}
            <Button variant="outline" className="flex-1" onClick={() => setShowOrder(true)}>
              Fazer Pedido
            </Button>
          </div>

          {messagingAvailable && showContact && (
            <div className="bg-white rounded-lg p-4 border border-blue-100 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem para o fornecedor</label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Explique o que precisa, prazos, detalhes..."
              />
              <div className="flex justify-end mt-3 gap-2">
                <Button variant="outline" onClick={() => setShowContact(false)}>Cancelar</Button>
                <Button onClick={handleSendMessage} disabled={contacting}>{contacting ? 'A enviar...' : 'Enviar'}</Button>
              </div>
            </div>
          )}

          {showOrder && (
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              {listing.listing_type === 'product' && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade</label>
                  <input
                    type="number"
                    min={1}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Detalhes do pedido, preferências, prazos..."
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Preço base: <span className="font-semibold">AOA {listing.base_price.toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  {listing.listing_type === 'product' && (
                    <>
                      {' '}• Total estimado: <span className="font-semibold">AOA {(listing.base_price * Math.max(1, Number(orderQuantity) || 1)).toLocaleString('pt-AO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowOrder(false)}>Cancelar</Button>
                  <Button onClick={handlePlaceOrder} disabled={ordering}>{ordering ? 'A enviar...' : 'Confirmar Pedido'}</Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default MarketplaceDetailPage;
