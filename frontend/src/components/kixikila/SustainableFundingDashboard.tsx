import React, { useState, useEffect } from 'react';
import { Card } from '../common';
import { TrendingUp, Users, DollarSign, Zap, Trophy, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface FundingData {
  total_raised: number;
  total_contributed: number;
  active_group_id: number | null;
  active_group_name: string | null;
  next_payout_date: string | null;
  next_payout_amount: number | null;
  reputation_score: number;
  groups_count: number;
}

interface SustainableFundingDashboardProps {
  participantId: number;
}

const SustainableFundingDashboard: React.FC<SustainableFundingDashboardProps> = ({ participantId }) => {
  const [funding, setFunding] = useState<FundingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    fetchFunding();
  }, [participantId]);

  const fetchFunding = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get(`/api/v2/participants/my-funding/`);
      setFunding({
        total_raised: 0,
        total_contributed: 0,
        active_group_id: null,
        active_group_name: null,
        next_payout_date: null,
        next_payout_amount: null,
        reputation_score: 50,
        groups_count: 0,
      });
    } catch (error) {
      console.error('Error fetching funding data:', error);
      toast.error('Erro ao carregar dados de financiamento');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando dados de financiamento...</div>;
  }

  if (!funding) {
    return (
      <Card className="p-6 bg-yellow-50 border border-yellow-200">
        <p className="text-yellow-800">Erro ao carregar dados de financiamento</p>
      </Card>
    );
  }

  const hasGroup = funding.active_group_id !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">💰 Financiamento Sustentável</h2>
        {!hasGroup && (
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition"
          >
            Aderir ao Kixikila
          </button>
        )}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Raised */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Levantado</p>
              <p className="text-3xl font-bold text-green-600">
                {funding.total_raised.toLocaleString('pt-AO')} AOA
              </p>
              <p className="text-xs text-gray-500 mt-1">via Kixikila</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Total Contributed */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Contribuído</p>
              <p className="text-3xl font-bold text-blue-600">
                {funding.total_contributed.toLocaleString('pt-AO')} AOA
              </p>
              <p className="text-xs text-gray-500 mt-1">em grupos ativos</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Reputation Score */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Score de Reputação</p>
              <p className="text-3xl font-bold text-purple-600">
                {funding.reputation_score}/100
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {funding.reputation_score >= 75 ? '⭐ Excelente' : 
                 funding.reputation_score >= 50 ? '👍 Bom' : 
                 '⚠️ Precisa melhoria'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Trophy className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Active Group Info */}
      {hasGroup ? (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ✅ Grupo Ativo: {funding.active_group_name}
              </h3>
              <div className="space-y-1 text-sm text-gray-700">
                <p>👥 Participando em <strong>{funding.groups_count} grupo(s)</strong></p>
                {funding.next_payout_date && (
                  <p>📅 Próximo payout: <strong>{new Date(funding.next_payout_date).toLocaleDateString('pt-AO')}</strong></p>
                )}
                {funding.next_payout_amount && (
                  <p>💸 Valor esperado: <strong>{funding.next_payout_amount.toLocaleString('pt-AO')} AOA</strong></p>
                )}
              </div>
            </div>
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      ) : (
        <Card className="bg-yellow-50 border border-yellow-200">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-1">Sem Grupo Ativo</h3>
              <p className="text-sm text-yellow-800 mb-3">
                Aderir a um grupo Kixikila é uma forma sustentável de financiar seu negócio em solidariedade com pares.
              </p>
              <button
                onClick={() => setShowJoinModal(true)}
                className="text-sm bg-yellow-600 text-white px-4 py-1 rounded hover:bg-yellow-700"
              >
                Explorar Grupos
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Education Section */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Como Funciona Kixikila?</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: 1, title: 'Forma Grupo', desc: '5-10 pares do programa' },
            { step: 2, title: 'Contribui', desc: 'Mensalmente (ex: 5.000 AOA)' },
            { step: 3, title: 'Recebe', desc: 'A sua vez vem (ordem rotativa)' },
            { step: 4, title: 'Investe', desc: 'Desenvolve negócio/educação' },
          ].map((item) => (
            <div key={item.step} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">{item.step}</div>
              <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
              <p className="text-xs text-gray-600 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* CTA Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-50 border border-blue-200 p-6 text-center">
          <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Leaderboard</h3>
          <p className="text-sm text-gray-700 mb-4">
            Veja quanto financiamento levantaram outros participantes
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
            Ver Ranking
          </button>
        </Card>

        <Card className="bg-purple-50 border border-purple-200 p-6 text-center">
          <Trophy className="h-12 w-12 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Histórico de Sucesso</h3>
          <p className="text-sm text-gray-700 mb-4">
            Casos de participantes que transformaram suas vidas com Kixikila
          </p>
          <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 w-full">
            Ler Histórias
          </button>
        </Card>
      </div>

      {/* Modal would go here */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Aderir a um Grupo</h3>
            <p className="text-gray-600 mb-6">
              Escolha entre criar um novo grupo ou aderir a um existente.
            </p>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Criar Novo Grupo
              </button>
              <button className="w-full bg-gray-200 text-gray-900 py-2 rounded hover:bg-gray-300">
                Aderir a Grupo Existente
              </button>
              <button
                onClick={() => setShowJoinModal(false)}
                className="w-full text-gray-600 py-2 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SustainableFundingDashboard;
