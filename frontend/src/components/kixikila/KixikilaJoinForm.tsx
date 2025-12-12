import React, { useState } from 'react';
import { Button, LoadingSpinner } from '../../components/common';
import KixikilaService from '../../services/kixikila/kixikilaService';
import toast from 'react-hot-toast';

interface KixikilaJoinFormProps {
  groupId: number;
}

const KixikilaJoinForm: React.FC<KixikilaJoinFormProps> = ({ groupId }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await KixikilaService.joinGroup(groupId);
      toast.success('Pedido de participação enviado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao solicitar participação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-green-50 to-white rounded-lg p-6 border border-green-200 space-y-5 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Solicitar Participação neste Grupo</h3>
      <Button type="submit" variant="primary" disabled={loading} className="w-full">
        {loading ? <><LoadingSpinner size="sm" className="mr-2" /> Processando...</> : 'Enviar Solicitação'}
      </Button>
    </form>
  );
};

export default KixikilaJoinForm;
