import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import KixikilaService from '../services/kixikila/kixikilaService';
import { KixikilaGroupDTO } from '../types/api';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Users, DollarSign, Calendar, Plus, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import PayoutsPanel from '../components/kixikila/PayoutsPanel';

interface Member {
  id: string;
  name: string;
  email: string;
  joined_date: string;
  is_admin: boolean;
  total_contributed: number;
  last_contribution: string;
}

interface Contribution {
  id: string;
  member: Member;
  amount: number;
  date: string;
  status: 'confirmed' | 'pending';
}

const KixikilaManagementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState<KixikilaGroupDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [totals, setTotals] = useState<{ cash: number; active: number; next: number }>({ cash: 0, active: 0, next: 0 });
  const [members, setMembers] = useState<Member[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'contributions' | 'payouts'>('overview');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState<{ status: 'all' | 'confirmed' | 'pending'; round?: number }>({ status: 'all' });

  const filteredContributions = contributions.filter(c => {
    const statusOk = filters.status === 'all' ? true : c.status === filters.status;
    const roundOk = typeof filters.round === 'number' ? (c as any).round === filters.round : true;
    return statusOk && roundOk;
  });

  const fetchGroupData = async () => {
    if (!id) {
      toast.error('ID do grupo inválido');
      setLoading(false);
      return;
    }
    try {
      const groupData = await KixikilaService.getGroup(parseInt(id));
      setGroup(groupData);

      let activeCount = 0;
      try {
        const membersResponse = await KixikilaService.getGroupMembers(parseInt(id));
        const remappedMembers: Member[] = (membersResponse.results || []).map((m: any) => ({
          // Prefer membership_id to align with contributions membership id
          id: (m.membership_id ?? m.id ?? m.member?.id)?.toString() || '0',
          name: m.user?.username || m.member_username || 'Member',
          email: m.user?.email || 'member@example.com',
          joined_date: m.joined_date || new Date().toISOString().split('T')[0],
          is_admin: !!m.is_admin,
          total_contributed: Number(m.total_contributed || 0),
          last_contribution: m.last_contribution || '',
        }));
        setMembers(remappedMembers);
        activeCount = remappedMembers.length;
      } catch (error) {
        console.warn('Could not load members, using empty list:', error);
        setMembers([]);
      }

      try {
        const contributionsResponse = await KixikilaService.getGroupContributions(parseInt(id));
        const contribs: Contribution[] = (contributionsResponse.results || []).map((c: any) => ({
          id: c.id?.toString() || '0',
          member: {
            id: (c.membership?.id ?? c.membership_id)?.toString() || '0',
            name: c.member_username || 'Member',
            email: c.membership?.member?.email || 'member@example.com',
            joined_date: c.payment_date || 'N/A',
            is_admin: false,
            total_contributed: Number(c.amount) || 0,
            last_contribution: c.payment_date || 'N/A',
          },
          amount: Number(c.amount) || 0,
          date: c.payment_date || new Date().toISOString().split('T')[0],
          status: (c.status === 'confirmed' ? 'confirmed' : 'pending') as 'confirmed' | 'pending',
        }));
        setContributions(contribs);

        const totalsByMembership: Record<string, number> = {};
        const totalsByName: Record<string, number> = {};
        for (const c of contribs) {
          if (c.status === 'confirmed') {
            const mid = c.member.id || '0';
            const mname = c.member.name || '';
            totalsByMembership[mid] = (totalsByMembership[mid] || 0) + (c.amount || 0);
            totalsByName[mname] = (totalsByName[mname] || 0) + (c.amount || 0);
          }
        }
        setMembers(prev => prev.map(m => ({
          ...m,
          total_contributed: (totalsByMembership[m.id] ?? totalsByName[m.name] ?? m.total_contributed ?? 0),
        })));

        try {
          const stats = await KixikilaService.getGroupStats(parseInt(id));
          setTotals({
            cash: stats.cash ?? 0,
            active: stats.active ?? activeCount,
            next: (stats.next ?? Number(groupData.monthly_contribution)) || 0,
          });
        } catch {
          const cash = (contributionsResponse.results || [])
            .filter((c: any) => c.status === 'confirmed')
            .reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0);
          const active = activeCount;
          const next = Number(groupData.monthly_contribution) || 0;
          setTotals({ cash, active, next });
        }
      } catch (error) {
        console.warn('Could not load contributions:', error);
        setContributions([]);
        setTotals({ cash: 0, active: activeCount, next: Number(groupData.monthly_contribution) || 0 });
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar dados do grupo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) {
      toast.error('Email é obrigatório');
      return;
    }

    setSubmitting(true);
    try {
      // Mock API call
      const newMember: Member = {
        id: String(members.length + 1),
        name: newMemberEmail.split('@')[0],
        email: newMemberEmail,
        joined_date: new Date().toISOString().split('T')[0],
        is_admin: false,
        total_contributed: 0,
        last_contribution: '',
      };

      setMembers([...members, newMember]);
      setNewMemberEmail('');
      setShowAddMemberModal(false);
      toast.success('Membro adicionado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar membro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este membro?')) return;

    try {
      setMembers(members.filter((m) => m.id !== memberId));
      toast.success('Membro removido');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover membro');
    }
  };

  const handleConfirmContribution = async (contributionId: string) => {
    try {
      await KixikilaService.confirmContribution(Number(contributionId));
      await fetchGroupData();
      try {
        const stats = await KixikilaService.getGroupStats(parseInt(id!));
        setTotals({
          cash: stats.cash ?? 0,
          active: stats.active ?? totals.active,
          next: stats.next ?? totals.next,
        });
      } catch {
        // keep current totals on stats fetch failure
      }
      toast.success('Contribuição confirmada!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao confirmar contribuição');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <LoadingSpinner text="Carregando grupo..." />
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
            <button
              onClick={() => navigate('/kixikila')}
              className="mt-4 bg-violet-600 text-white px-4 py-2 rounded"
            >
              Voltar aos Grupos
            </button>
          </Card>
        </div>
      </Layout>
    );
  }

  const isGroupAdmin = user?.id === group.admin_id;

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <button
            onClick={() => navigate(`/kixikila/${id}`)}
            className="flex items-center gap-2 text-violet-100 hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Grupo
          </button>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Users className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold">{group.name} - Gestão</h1>
              <p className="text-violet-100 mt-1">Gerencie membros, contribuições e configurações do grupo.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-l-4 border-violet-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total em Caixa</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">AOA {Number(totals.cash).toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-violet-600 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-violet-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Membros Ativos</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totals.active}</p>
                </div>
                <Users className="h-8 w-8 text-violet-600 opacity-20" />
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-violet-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Próximo Ciclo</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">AOA {Number(totals.next).toFixed(2)}</p>
                </div>
                <Calendar className="h-8 w-8 text-violet-600 opacity-20" />
              </div>
            </Card>
          </div>

          {/* Tabs */}
          {isGroupAdmin && (
            <div className="border-b border-gray-200">
              <div className="flex gap-8">
                {(['overview', 'members', 'contributions', 'payouts'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-violet-600 text-violet-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab === 'overview' && 'Visão Geral'}
                    {tab === 'members' && 'Membros'}
                    {tab === 'contributions' && 'Contribuições'}
                    {tab === 'payouts' && 'Desembolsos'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          {activeTab === 'overview' && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Sobre o Grupo</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Descrição</p>
                  <p className="text-gray-900 mt-1">{group.description}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tipo</p>
                  <p className="text-gray-900 mt-1 capitalize">{group.group_type?.replace('_', ' ') || 'N/A'}</p>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'members' && isGroupAdmin && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Gerenciar Membros</h2>
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Membro
                </button>
              </div>

              {showAddMemberModal && (
                <Card className="p-6 bg-violet-50">
                  <form onSubmit={handleAddMember} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email do Novo Membro
                      </label>
                      <input
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="exemplo@email.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg disabled:bg-gray-400"
                      >
                        {submitting ? 'Adicionando...' : 'Adicionar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddMemberModal(false)}
                        className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </Card>
              )}

              <Card className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 font-medium text-gray-700">Nome</th>
                        <th className="text-left py-3 font-medium text-gray-700">Email</th>
                        <th className="text-right py-3 font-medium text-gray-700">Total Contribuído</th>
                        <th className="text-left py-3 font-medium text-gray-700">Membro Desde</th>
                        <th className="text-center py-3 font-medium text-gray-700">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member) => (
                        <tr key={member.id} className="border-b border-gray-100">
                          <td className="py-3">
                            <span className="font-medium text-gray-900">
                              {member.name}
                              {member.is_admin && (
                                <span className="ml-2 text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded">
                                  Admin
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="py-3 text-gray-600">{member.email}</td>
                          <td className="py-3 text-right font-medium text-gray-900">
                            AOA {Number(member.total_contributed || 0).toFixed(2)}
                          </td>
                          <td className="py-3 text-gray-600">
                            {new Date(member.joined_date).toLocaleDateString('pt-AO')}
                          </td>
                          <td className="py-3 text-center">
                            {!member.is_admin && (
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'contributions' && isGroupAdmin && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Contribuições</h2>
                <div className="flex items-center gap-2">
                  <select
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value as 'all' | 'confirmed' | 'pending' })}
                  >
                    <option value="all">Todas</option>
                    <option value="confirmed">Confirmadas</option>
                    <option value="pending">Pendentes</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    placeholder="Ciclo"
                    className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                    value={filters.round ?? ''}
                    onChange={(e) => setFilters({ ...filters, round: e.target.value ? Number(e.target.value) : undefined })}
                  />
                  <button
                    onClick={async () => { await fetchGroupData(); toast.success('Atualizado'); }}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Atualizar
                  </button>
                </div>
              </div>

              <Card className="p-6">
                <div className="space-y-4">
                  {filteredContributions.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">Nenhuma contribuição encontrada com os filtros selecionados.</p>
                  ) : (
                    filteredContributions
                      .filter((c) => c.status === 'pending')
                      .map((contribution) => (
                        <div
                          key={contribution.id}
                          className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{contribution.member.name}</p>
                            <p className="text-sm text-gray-600">
                              AOA {Number(contribution.amount || 0).toFixed(2)} • {new Date(contribution.date).toLocaleDateString('pt-AO')}
                            </p>
                          </div>
                          <button
                            onClick={() => handleConfirmContribution(contribution.id)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                          >
                            <Check className="h-4 w-4" />
                            Confirmar
                          </button>
                        </div>
                      ))
                  )}
                </div>
              </Card>

              <h2 className="text-2xl font-bold text-gray-900 mt-8">Histórico de Contribuições</h2>
              <Card className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 font-medium text-gray-700">Membro</th>
                        <th className="text-right py-3 font-medium text-gray-700">Valor</th>
                        <th className="text-left py-3 font-medium text-gray-700">Data</th>
                        <th className="text-center py-3 font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContributions.map((contribution) => (
                        <tr key={contribution.id} className="border-b border-gray-100">
                          <td className="py-3 font-medium text-gray-900">{contribution.member.name}</td>
                          <td className="py-3 text-right font-medium text-gray-900">
                            AOA {Number(contribution.amount || 0).toFixed(2)}
                          </td>
                          <td className="py-3 text-gray-600">
                            {new Date(contribution.date).toLocaleDateString('pt-AO')}
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className={`text-xs px-3 py-1 rounded-full ${
                                contribution.status === 'confirmed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {contribution.status === 'confirmed' ? 'Confirmada' : 'Pendente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'payouts' && isGroupAdmin && (
            <PayoutsPanel
              groupId={parseInt(id!)}
              isAdmin={user?.is_staff || false}
              members={members}
              currentRound={group.current_round || 1}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default KixikilaManagementPage;
