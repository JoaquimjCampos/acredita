import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import KixikilaService from '../services/kixikila/kixikilaService';
import { KixikilaGroupDTO } from '../types/api';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, DollarSign, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const KixikilaContributePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState<KixikilaGroupDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'card' | 'cash'>('transfer');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const copyToClipboard = async (text: string, label?: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      toast.success(`${label || 'Texto'} copiado`);
    } catch {
      toast.error('Falha ao copiar');
    }
  };

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        if (id && !isNaN(parseInt(id))) {
          const data = await KixikilaService.getGroup(parseInt(id));
          setGroup(data);
          setAmount(data.monthly_contribution?.toString() || '');
        }
      } catch (error: any) {
        toast.error(error.message || 'Erro ao carregar grupo');
        navigate(`/kixikila/${id}`);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [id, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <LoadingSpinner text="Carregando..." />
        </div>
      </Layout>
    );
  }

  if (!group) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-8">
            <p className="text-gray-600">Grupo não encontrado</p>
          </Card>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Por favor, insira um valor válido');
      return;
    }

    setSubmitting(true);
    try {
      // Ask backend for the current user's membership on this group
      const membershipInfo = await KixikilaService.checkMembership(parseInt(id!));
      const userMembershipId = membershipInfo.is_member ? membershipInfo.membership?.id : undefined;

      if (!userMembershipId) {
        toast.error('Você precisa ser membro deste grupo para contribuir');
        return;
      }

      // Create contribution (backend will also enforce ownership of membership)
      const created = await KixikilaService.createContribution({
        membership_id: userMembershipId,
        amount: parseFloat(amount),
        payment_method: paymentMethod,
      } as any);

      toast.success('Contribuição registrada com sucesso!');
      setSuccess(true);

      // Refresh group stats so management/detail pages reflect new totals
      try {
        if (id && !isNaN(parseInt(id))) {
          await KixikilaService.getGroupStats(parseInt(id));
        }
      } catch (e) {
        console.warn('Could not refresh group stats after contribution:', e);
      }

      setTimeout(() => {
        navigate(`/kixikila/${id}`);
      }, 2000);
    } catch (error: any) {
      console.error('Contribution error:', error);
      toast.error(error.message || 'Erro ao processar contribuição');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate(`/kixikila/${id}`)}
            className="flex items-center gap-2 text-violet-100 hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Grupo
          </button>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <DollarSign className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Fazer Contribuição</h1>
              <p className="text-violet-100 mt-1">{group.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4">
          {success ? (
            <Card className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Contribuição Registrada!</h2>
              <p className="text-gray-600 mb-6">
                Sua contribuição de AOA {amount} foi registrada com sucesso.
              </p>
              <button
                onClick={() => navigate(`/kixikila/${id}`)}
                className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg"
              >
                Voltar ao Grupo
              </button>
            </Card>
          ) : (
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-violet-50 p-4 rounded-lg">
                    <p className="text-sm text-violet-800">Contribuição Sugerida</p>
                    <p className="text-2xl font-bold text-violet-900 mt-1">
                      AOA {Number(group.monthly_contribution || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">Seu Saldo</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">Ativo</p>
                  </div>
                </div>

                {/* Divider */}
                <hr className="border-gray-200" />

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor da Contribuição (AOA)
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 font-semibold">
                        AOA
                      </span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setAmount(group.monthly_contribution?.toString() || '')}
                      className="px-4 py-3 border border-violet-600 text-violet-600 rounded-lg hover:bg-violet-50 font-medium"
                    >
                      Sugerido
                    </button>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Método de Pagamento
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'transfer' as const, label: 'Transferência Bancária', desc: 'IBAN ou referência de conta' },
                      { value: 'card' as const, label: 'Cartão / Dinheiro Móvel', desc: 'Cartão de débito ou Unitel, Vodafone' },
                      { value: 'cash' as const, label: 'Dinheiro Físico', desc: 'Entrega pessoal ou transferência segura' },
                    ].map((method) => (
                      <label key={method.value} className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="payment_method"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={(e) => setPaymentMethod(e.target.value as 'transfer' | 'card' | 'cash')}
                          className="h-4 w-4 text-violet-600"
                        />
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-gray-900">{method.label}</p>
                          <p className="text-sm text-gray-600">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment Details */}
                {paymentMethod === 'transfer' && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-2">Detalhes para Transferência</p>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p className="flex items-center justify-between">
                        <span>Banco: Banco de Poupança e Crédito</span>
                      </p>
                      <p className="flex items-center justify-between gap-2">
                        <span>IBAN: PT50 0002 0123 1234567890</span>
                        <button type="button" className="px-2 py-1 text-xs border border-blue-600 text-blue-600 rounded hover:bg-blue-100" onClick={() => copyToClipboard('PT50 0002 0123 1234567890', 'IBAN')}>Copiar</button>
                      </p>
                      <p className="flex items-center justify-between gap-2">
                        <span>Referência: {group.id}</span>
                        <button type="button" className="px-2 py-1 text-xs border border-blue-600 text-blue-600 rounded hover:bg-blue-100" onClick={() => copyToClipboard(String(group.id), 'Referência')}>Copiar</button>
                      </p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm font-medium text-yellow-900 mb-2">Instruções de Pagamento</p>
                    <div className="text-sm text-yellow-800 space-y-1">
                      <p>1. Abra o app do seu banco ou operador móvel</p>
                      <p>2. Escolha "Enviar Dinheiro" ou "Pagamento"</p>
                      <p>3. Use o número do grupo: {group.id}</p>
                      <p>4. Confirme o pagamento</p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cash' && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-900 mb-2">Instruções para Dinheiro Físico</p>
                    <div className="text-sm text-green-800 space-y-1">
                      <p>Entre em contacto com o administrador do grupo para:</p>
                      <p>• Agendar encontro presencial</p>
                      <p>• Arranjar envio seguro de dinheiro</p>
                      <p>• Obter recibo oficial</p>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <hr className="border-gray-200" />

                {/* Summary */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-700">Valor a Contribuir:</span>
                    <span className="text-2xl font-bold text-violet-600">
                      AOA {parseFloat(amount || '0').toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Esta contribuição será adicionada ao saldo comunitário do grupo.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/kixikila/${id}`)}
                    className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !amount}
                    className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    {submitting ? 'Processando...' : 'Confirmar Contribuição'}
                  </button>
                </div>
              </form>
            </Card>
          )}

          {/* Info Box */}
          <Card className="p-6 mt-8 bg-violet-50 border-l-4 border-violet-500">
            <h3 className="font-semibold text-violet-900 mb-3">Importante</h3>
            <ul className="text-sm text-violet-800 space-y-2">
              <li>✓ Guarde o recibo de sua contribuição</li>
              <li>✓ A contribuição será confirmada em até 24h</li>
              <li>✓ Contacte o admin para questões de pagamento</li>
              <li>✓ Contribuições são não-reembolsáveis conforme regras do grupo</li>
            </ul>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default KixikilaContributePage;
