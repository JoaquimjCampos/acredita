import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import MarketplaceService from '../services/marketplace/marketplaceService';
import { ServiceCategoryDTO } from '../types/api';
import { useAuth } from '../hooks/useAuth';
import { ShoppingBag, ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const MarketplaceCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<ServiceCategoryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    listing_type: 'service' as 'service' | 'product',
    title: '',
    description: '',
    category_id: '',
    price: '',
    price_type: 'fixed' as 'fixed' | 'hourly' | 'negotiable',
    delivery_time: '',
    quantity_available: '',
    sku: '',
    images: [] as File[],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await MarketplaceService.getCategories();
        setCategories(data);
      } catch (error: any) {
        console.error('Erro ao carregar categorias:', error);
        toast.error('Erro ao carregar categorias');
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, images: Array.from(e.target.files!) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category_id || !formData.price) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.listing_type === 'product' && !formData.quantity_available) {
      toast.error('Quantidade disponível é obrigatória para produtos');
      return;
    }

    setSubmitting(true);
    try {
      await MarketplaceService.createListing({
        listing_type: formData.listing_type,
        title: formData.title,
        description: formData.description,
        category_id: parseInt(formData.category_id),
        price: parseFloat(formData.price),
        price_type: formData.price_type,
        delivery_time: formData.delivery_time,
        quantity_available: formData.quantity_available ? parseInt(formData.quantity_available) : undefined,
        sku: formData.sku,
        images: formData.images,
      });
      toast.success('Anúncio criado com sucesso!');
      navigate('/marketplace');
    } catch (error: any) {
      console.error('Erro ao criar anúncio:', error);
      toast.error(error.response?.data?.error || error.message || 'Erro ao criar anúncio');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Autenticação necessária</h2>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
              >
                Fazer login
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
        <div className="max-w-3xl mx-auto px-4">
          <button
            onClick={() => navigate('/marketplace')}
            className="mb-4 inline-flex items-center gap-2 text-cyan-100 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Anunciar Serviço</h1>
              <p className="text-cyan-100 mt-1">Ofereça seu serviço profissional na comunidade Acredita.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Anúncio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Anúncio *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="listing_type"
                      value="service"
                      checked={formData.listing_type === 'service'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-gray-700">Serviço</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="listing_type"
                      value="product"
                      checked={formData.listing_type === 'product'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <span className="text-gray-700">Produto</span>
                  </label>
                </div>
              </div>

              {/* Título */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título {formData.listing_type === 'product' ? 'do Produto' : 'do Serviço'} *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder={formData.listing_type === 'product' ? 'Ex: Camiseta Premium' : 'Ex: Design de Logotipo'}
                />
              </div>

              {/* Descrição */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Descreva em detalhe..."
                />
              </div>

              {/* Categoria */}
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preço e Tipo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Preço (AOA) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label htmlFor="price_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Preço {formData.listing_type === 'service' ? '*' : ''}
                  </label>
                  <select
                    id="price_type"
                    name="price_type"
                    value={formData.price_type}
                    onChange={handleInputChange}
                    required={formData.listing_type === 'service'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="fixed">Preço Fixo</option>
                    {formData.listing_type === 'service' && (
                      <>
                        <option value="hourly">Por Hora</option>
                        <option value="negotiable">Negociável</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Campos específicos para serviços */}
              {formData.listing_type === 'service' && (
                <div>
                  <label htmlFor="delivery_time" className="block text-sm font-medium text-gray-700 mb-1">
                    Tempo de Entrega (ex: 2-3 dias)
                  </label>
                  <input
                    type="text"
                    id="delivery_time"
                    name="delivery_time"
                    value={formData.delivery_time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    placeholder="Descreva o tempo de entrega"
                  />
                </div>
              )}

              {/* Campos específicos para produtos */}
              {formData.listing_type === 'product' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="quantity_available" className="block text-sm font-medium text-gray-700 mb-1">
                        Quantidade Disponível *
                      </label>
                      <input
                        type="number"
                        id="quantity_available"
                        name="quantity_available"
                        value={formData.quantity_available}
                        onChange={handleInputChange}
                        required
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">
                        SKU / Código do Produto
                      </label>
                      <input
                        type="text"
                        id="sku"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        placeholder="SKU-12345"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Imagens */}
              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
                  Imagens (opcional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-cyan-400 transition">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="images"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-cyan-600 hover:text-cyan-500"
                      >
                        <span>Carregar imagens</span>
                        <input
                          id="images"
                          name="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">ou arraste aqui</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF até 5MB</p>
                    {formData.images.length > 0 && (
                      <p className="text-sm text-cyan-600 mt-2">{formData.images.length} imagem(ns) selecionada(s)</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/marketplace')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-cyan-600 text-white py-3 rounded-lg hover:bg-cyan-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? <LoadingSpinner size="sm" text="Publicando..." /> : 'Publicar Serviço'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default MarketplaceCreatePage;
