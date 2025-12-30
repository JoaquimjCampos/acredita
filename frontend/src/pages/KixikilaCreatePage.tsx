import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common';
import KixikilaService from '../services/kixikila/kixikilaService';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface FormData {
  name: string;
  description: string;
  monthly_contribution: number;
  max_members: number;
  duration_months: number;
  start_date: string;
  group_type: 'professional' | 'neighborhood' | 'family' | 'business';
}

const KixikilaCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    monthly_contribution: 0,
    max_members: 10,
    duration_months: 12,
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    group_type: 'neighborhood',
  });

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-8 max-w-md w-full">
            <p className="text-center text-gray-600 mb-4">Você precisa estar autenticado para criar um grupo.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg"
            >
              Ir para Login
            </button>
          </Card>
        </div>
      </Layout>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'monthly_contribution' || name === 'max_members' || name === 'duration_months'
        ? parseFloat(value) || 0
        : value,
    }));

    // Inline validation per field
    const today = new Date().toISOString().split('T')[0];
    const newErrors: Record<string, string> = { ...errors };
    if (name === 'name') {
      newErrors.name = value.trim() ? '' : 'Nome do grupo é obrigatório';
    }
    if (name === 'monthly_contribution') {
      const v = parseFloat(value);
      newErrors.monthly_contribution = isNaN(v) || v < 0 ? 'Contribuição deve ser 0 ou maior' : '';
    }
    if (name === 'max_members') {
      const v = parseFloat(value);
      newErrors.max_members = v < 3 || v > 50 ? 'Máx. membros deve estar entre 3 e 50' : '';
    }
    if (name === 'duration_months') {
      const v = parseFloat(value);
      newErrors.duration_months = v < 3 || v > 24 ? 'Duração deve estar entre 3 e 24 meses' : '';
    }
    if (name === 'start_date') {
      newErrors.start_date = value < today ? 'Data de início não pode ser no passado' : '';
    }
    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all fields
    const today = new Date().toISOString().split('T')[0];
    const newErrors: Record<string, string> = {
      name: formData.name.trim() ? '' : 'Nome do grupo é obrigatório',
      monthly_contribution: formData.monthly_contribution < 0 ? 'Contribuição mensal não pode ser negativa' : '',
      max_members: formData.max_members < 3 || formData.max_members > 50 ? 'Máx. membros deve estar entre 3 e 50' : '',
      duration_months: formData.duration_months < 3 || formData.duration_months > 24 ? 'Duração deve estar entre 3 e 24 meses' : '',
      start_date: formData.start_date < today ? 'Data de início não pode ser no passado' : '',
    };
    setErrors(newErrors);
    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) {
      toast.error('Por favor, corrija os erros do formulário');
      return;
    }

    setLoading(true);
    try {
      const response = await KixikilaService.createGroup({
        name: formData.name,
        description: formData.description,
        monthly_contribution: formData.monthly_contribution,
        max_members: formData.max_members,
        duration_months: formData.duration_months,
        start_date: formData.start_date,
        group_type: formData.group_type,
      });
      toast.success('Grupo criado com sucesso!');
      navigate(`/kixikila/${response.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar grupo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/kixikila')}
            className="flex items-center gap-2 text-violet-100 hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Grupos
          </button>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Criar Novo Grupo</h1>
              <p className="text-violet-100 mt-1">Estabeleça as regras e comece seu grupo de poupança.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome do Grupo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Grupo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Poupança da Família Silva"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
                {errors.name && (<p className="mt-1 text-xs text-red-600">{errors.name}</p>)}
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descreva o objetivo e propósito do grupo..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Grid: Tipo e Contribuição */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tipo de Grupo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Grupo *
                  </label>
                  <select
                    name="group_type"
                    value={formData.group_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="neighborhood">Bairro</option>
                    <option value="professional">Profissional</option>
                    <option value="family">Familiar</option>
                    <option value="business">Empresarial</option>
                  </select>
                </div>

                {/* Contribuição Mensal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contribuição Mensal
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 font-semibold">
                        AOA
                      </span>
                      <input
                        type="number"
                        name="monthly_contribution"
                        value={formData.monthly_contribution}
                        onChange={handleChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full pl-16 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  {errors.monthly_contribution && (<p className="mt-1 text-xs text-red-600">{errors.monthly_contribution}</p>)}
                </div>
              </div>

              {/* Grid: Membros, Duração e Data */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Número Máximo de Membros */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máx. Membros *
                  </label>
                  <input
                    type="number"
                    name="max_members"
                    value={formData.max_members}
                    onChange={handleChange}
                    min="3"
                    max="50"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">3-50 pessoas</p>
                  {errors.max_members && (<p className="mt-1 text-xs text-red-600">{errors.max_members}</p>)}
                </div>

                {/* Duração em Meses */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duração (meses) *
                  </label>
                  <input
                    type="number"
                    name="duration_months"
                    value={formData.duration_months}
                    onChange={handleChange}
                    min="3"
                    max="24"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">3-24 meses</p>
                  {errors.duration_months && (<p className="mt-1 text-xs text-red-600">{errors.duration_months}</p>)}
                </div>

                {/* Data de Início */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data Início *
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                  {errors.start_date && (<p className="mt-1 text-xs text-red-600">{errors.start_date}</p>)}
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate('/kixikila')}
                  className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || Object.values(errors).some(Boolean)}
                  className="flex-1 px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {loading ? 'Criando...' : 'Criar Grupo'}
                </button>
              </div>
            </form>
          </Card>

          {/* Info Box */}
          <Card className="p-6 mt-8 bg-violet-50 border-l-4 border-violet-500">
            <h3 className="font-semibold text-violet-900 mb-2">Dicas para Criar um Grupo Bem-Sucedido</h3>
            <ul className="text-sm text-violet-800 space-y-1">
              <li>✓ Escolha um nome claro e descritivo</li>
              <li>✓ Defina objetivos realistas e mensuráveis</li>
              <li>✓ Estabeleça regras transparentes desde o início</li>
              <li>✓ Comece com um pequeno número de membros confiáveis</li>
              <li>✓ Mantenha registros detalhados de todas as transações</li>
            </ul>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default KixikilaCreatePage;
