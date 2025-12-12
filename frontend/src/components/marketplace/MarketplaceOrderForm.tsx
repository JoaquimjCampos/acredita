import React, { useState } from 'react';
import { Button, Input, LoadingSpinner } from '../../components/common';
import MarketplaceService from '../../services/marketplace/marketplaceService';
import toast from 'react-hot-toast';

interface MarketplaceOrderFormProps {
  listingId: number;
}

const MarketplaceOrderForm: React.FC<MarketplaceOrderFormProps> = ({ listingId }) => {
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'cash'>('card');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await MarketplaceService.createOrder({ listing_id: listingId, payment_method: paymentMethod, notes });
      toast.success('Solicitação enviada com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao solicitar serviço.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-6 border border-blue-200 space-y-5 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Solicitar este Serviço</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pagamento *</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'transfer' | 'cash')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="card">Cartão de Crédito</option>
          <option value="transfer">Transferência Bancária</option>
          <option value="cash">Dinheiro</option>
        </select>
      </div>
      <Input
        label="Observações adicionais (opcional)"
        value={notes}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
        placeholder="Descreva suas necessidades específicas..."
      />
      <Button type="submit" variant="primary" disabled={loading} className="w-full">
        {loading ? <><LoadingSpinner size="sm" className="mr-2" /> Processando...</> : 'Enviar Solicitação'}
      </Button>
    </form>
  );
};

export default MarketplaceOrderForm;
