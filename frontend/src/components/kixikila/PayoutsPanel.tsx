import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '../common';
import PayoutService from '../../services/kixikila/payoutService';
import { KixikilaPayoutDTO } from '../../types/api';
import { Clock, Send, Check, XCircle, RefreshCw, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface PayoutsPanelProps {
  groupId: number;
  isAdmin: boolean;
  members: Array<{ id: string; name: string; email: string }>;
  currentRound: number;
}

const PayoutsPanel: React.FC<PayoutsPanelProps> = ({ groupId, isAdmin, members, currentRound }) => {
  const [payouts, setPayouts] = useState<KixikilaPayoutDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [selectedRound, setSelectedRound] = useState(currentRound);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [submitting, setSubmitting] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState<{open:boolean; payoutId:number|null}>({open:false, payoutId:null});
  const [showFailModal, setShowFailModal] = useState<{open:boolean; payoutId:number|null}>({open:false, payoutId:null});
  const [completeMethod, setCompleteMethod] = useState('bank_transfer');
  const [failReason, setFailReason] = useState('');

  const fetchPayouts = useCallback(async () => {
    try {
      const data = await PayoutService.getPayouts({ group: groupId });
      setPayouts(data);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      toast.error('Erro ao carregar payouts');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchPayouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPayouts]);

  const handleCreatePayout = useCallback(async () => {
    if (!selectedRecipient || !selectedRound) {
      toast.error('Selecione um beneficiário e ronda');
      return;
    }

    setSubmitting(true);
    try {
      await PayoutService.createPayoutForRound({
        group_id: groupId,
        round: selectedRound,
        recipient_id: Number(selectedRecipient),
        payment_method: paymentMethod,
      });

      toast.success('Payout criado com sucesso!');
      setShowCreateModal(false);
      setSelectedRecipient('');
      await fetchPayouts();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Erro ao criar payout';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }, [groupId, selectedRound, selectedRecipient, paymentMethod, fetchPayouts]);

  const handleProcessPayout = useCallback(async (payoutId: number) => {
    try {
      await PayoutService.processPayout(payoutId);
      toast.success('Payout marcado como em processamento');
      await fetchPayouts();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Erro ao processar payout';
      toast.error(errorMsg);
    }
  }, [fetchPayouts]);

  const handleCompletePayout = useCallback((payoutId: number) => {
    setShowCompleteModal({open:true, payoutId});
    setCompleteMethod(paymentMethod || 'bank_transfer');
  }, [paymentMethod]);

  const submitCompletePayout = useCallback(async () => {
    if (!showCompleteModal.payoutId) return;
    try {
      await PayoutService.completePayout(showCompleteModal.payoutId, completeMethod);
      toast.success('Payout concluído com sucesso!');
      setShowCompleteModal({open:false, payoutId:null});
      await fetchPayouts();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.message || 'Erro ao completar payout';
      toast.error(errorMsg);
    }
  }, [showCompleteModal, completeMethod, fetchPayouts]);

  const handleFailPayout = useCallback((payoutId: number) => {
    setShowFailModal({open:true, payoutId});
    setFailReason('');
  }, []);

  const submitFailPayout = useCallback(async () => {
    if (!showFailModal.payoutId || !failReason.trim()) {
      toast.error('Informe o motivo da falha');
      return;
    }
    try {
      await PayoutService.failPayout(showFailModal.payoutId, failReason.trim());
      toast.success('Payout marcado como falhado');
      setShowFailModal({open:false, payoutId:null});
      setFailReason('');
      await fetchPayouts();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao falhar payout');
    }
  }, [showFailModal, failReason, fetchPayouts]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'processing':
        return <Send className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado';
      case 'processing':
        return 'Processando';
      case 'completed':
        return 'Concluído';
      case 'failed':
        return 'Falhado';
      default:
        return status;
    }
  };

  const { scheduledPayouts, processingPayouts, completedPayouts, failedPayouts } = useMemo(() => ({
    scheduledPayouts: payouts.filter(p => p.status === 'scheduled'),
    processingPayouts: payouts.filter(p => p.status === 'processing'),
    completedPayouts: payouts.filter(p => p.status === 'completed'),
    failedPayouts: payouts.filter(p => p.status === 'failed'),
  }), [payouts]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-40 bg-gray-200 animate-pulse rounded" />
          <div className="h-9 w-48 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <Card key={i}>
              <div className="h-16 bg-gray-100 animate-pulse rounded" />
            </Card>
          ))}
        </div>
        <Card>
          <div className="h-48 bg-gray-100 animate-pulse rounded" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Pagamentos</h3>
        <div className="flex gap-2">
          <button
            onClick={fetchPayouts}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              disabled={!isAdmin}
            >
              <Plus className="h-4 w-4" />
              Criar Payout
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Agendados</p>
              <p className="text-2xl font-bold">{scheduledPayouts.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Send className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Processando</p>
              <p className="text-2xl font-bold">{processingPayouts.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Concluídos</p>
              <p className="text-2xl font-bold">{completedPayouts.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Falhados</p>
              <p className="text-2xl font-bold">{failedPayouts.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ronda</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beneficiário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Taxa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Líquido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                {isAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="px-6 py-4 text-center text-gray-500">
                    Nenhum payout encontrado
                  </td>
                </tr>
              ) : (
                payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      #{payout.round}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>
                        <div className="font-medium">{payout.recipient_email}</div>
                        <div className="text-gray-500 text-xs">ID: {payout.recipient}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      {Number(payout.total_amount).toFixed(2)} AOA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Number(payout.platform_fee).toFixed(2)} AOA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      {Number(payout.net_amount).toFixed(2)} AOA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                        {getStatusIcon(payout.status)}
                        {getStatusLabel(payout.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payout.scheduled_date).toLocaleDateString()}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {payout.status === 'scheduled' && payout.can_be_disbursed && (
                            <button
                              onClick={() => handleProcessPayout(payout.id)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Processar"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}
                          {payout.status === 'processing' && (
                            <>
                              <button
                                onClick={() => handleCompletePayout(payout.id)}
                                className="text-green-600 hover:text-green-800"
                                title="Completar"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleFailPayout(payout.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Falhar"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Payout Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Criar Payout</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ronda
                </label>
                <input
                  type="number"
                  value={selectedRound}
                  onChange={(e) => setSelectedRound(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beneficiário
                </label>
                <select
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um membro</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="transfer">Transferência Bancária</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="cash">Dinheiro</option>
                  <option value="card">Cartão</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePayout}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                disabled={submitting}
              >
                {submitting ? 'Criando...' : 'Criar Payout'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Payout Modal */}
      {showCompleteModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Completar Payout</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pagamento</label>
                <select
                  value={completeMethod}
                  onChange={(e) => setCompleteMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bank_transfer">Transferência Bancária</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="cash">Dinheiro</option>
                  <option value="card">Cartão</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowCompleteModal({open:false, payoutId:null})}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={submitCompletePayout}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Completar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fail Payout Modal */}
      {showFailModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Falhar Payout</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <textarea
                  value={failReason}
                  onChange={(e) => setFailReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descreva o motivo da falha"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowFailModal({open:false, payoutId:null})}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={submitFailPayout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirmar Falha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutsPanel;
