import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import KixikilaService from '../services/kixikila/kixikilaService';
import { KixikilaGroupDTO, KixikilaMembershipDTO } from '../types/api';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Users, Shield, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface MemberRow {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  position: number;
  joined_date: string;
  contributions_made: number;
  payout_received: boolean;
}

const KixikilaMembersManagementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState<KixikilaGroupDTO | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{ show: boolean; action: 'suspend' | 'reactivate' | null; memberId: number | null; memberName: string }>({ show: false, action: null, memberId: null, memberName: '' });
  const [actionInProgress, setActionInProgress] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');

  const fetchData = async () => {
    if (!id) return;
    try {
      const groupData = await KixikilaService.getGroup(parseInt(id));
      setGroup(groupData);

      const membersData = await KixikilaService.getGroupMembers(parseInt(id));
      const memberRows: MemberRow[] = (membersData.results || []).map((m: any) => ({
        id: m.id,
        username: m.user?.username || m.member_username || 'Unknown',
        email: m.user?.email || m.member_email || '',
        is_active: typeof m.is_active === 'boolean' ? m.is_active : true,
        position: m.position || 0,
        joined_date: m.joined_date || new Date().toISOString(),
        contributions_made: m.contributions_made || 0,
        payout_received: m.payout_received || false,
      }));
      setMembers(memberRows);
    } catch (error: any) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSuspend = (memberId: number, memberName: string) => {
    setConfirmModal({ show: true, action: 'suspend', memberId, memberName });
  };

  const handleReactivate = (memberId: number, memberName: string) => {
    setConfirmModal({ show: true, action: 'reactivate', memberId, memberName });
  };

  const confirmAction = async () => {
    if (!id || !confirmModal.memberId || !confirmModal.action) return;
    setActionInProgress(true);
    try {
      if (confirmModal.action === 'suspend') {
        await KixikilaService.suspendMember(parseInt(id), confirmModal.memberId);
        toast.success(`${confirmModal.memberName} foi suspenso`);
      } else {
        await KixikilaService.reactivateMember(parseInt(id), confirmModal.memberId);
        toast.success(`${confirmModal.memberName} foi reativado`);
      }
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar ação');
    } finally {
      setActionInProgress(false);
      setConfirmModal({ show: false, action: null, memberId: null, memberName: '' });
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
                          (filterStatus === 'active' ? m.is_active : !m.is_active);
    return matchesSearch && matchesStatus;
  });

  const isGroupAdmin = user?.id === group?.admin_id;

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <LoadingSpinner text="Carregando membros..." />
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
              Voltar
            </button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <button
            onClick={() => navigate(`/kixikila/${id}/manage`)}
            className="flex items-center gap-2 text-violet-100 hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar à Gestão
          </button>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Users className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold">{group.name} - Gestão de Membros</h1>
              <p className="text-violet-100 mt-1">Gerencie membros e status de adesão</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-l-4 border-violet-500">
              <p className="text-gray-600 text-sm">Total de Membros</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{members.length}</p>
            </Card>
            <Card className="p-6 border-l-4 border-green-500">
              <p className="text-gray-600 text-sm">Membros Ativos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{members.filter(m => m.is_active).length}</p>
            </Card>
            <Card className="p-6 border-l-4 border-red-500">
              <p className="text-gray-600 text-sm">Membros Suspensos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{members.filter(m => !m.is_active).length}</p>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Pesquisar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="suspended">Suspensos</option>
              </select>
            </div>
          </Card>

          {/* Members Table */}
          <Card className="p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-medium text-gray-700">Membro</th>
                  <th className="text-left py-3 font-medium text-gray-700">Email</th>
                  <th className="text-center py-3 font-medium text-gray-700">Posição</th>
                  <th className="text-center py-3 font-medium text-gray-700">Contribuições</th>
                  <th className="text-center py-3 font-medium text-gray-700">Status</th>
                  <th className="text-center py-3 font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3">
                      <span className="font-medium text-gray-900">{member.username}</span>
                    </td>
                    <td className="py-3 text-gray-600">{member.email}</td>
                    <td className="py-3 text-center font-medium text-gray-900">#{member.position}</td>
                    <td className="py-3 text-center text-gray-600">{member.contributions_made}</td>
                    <td className="py-3 text-center">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${member.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {member.is_active ? 'Ativo' : 'Suspenso'}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      {isGroupAdmin && (
                        <div className="flex items-center justify-center gap-2">
                          {member.is_active ? (
                            <button
                              onClick={() => handleSuspend(member.id, member.username)}
                              className="text-yellow-700 hover:text-yellow-800 border border-yellow-300 bg-yellow-50 px-2 py-1 rounded text-xs"
                            >
                              Suspender
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivate(member.id, member.username)}
                              className="text-green-700 hover:text-green-800 border border-green-300 bg-green-50 px-2 py-1 rounded text-xs"
                            >
                              Reativar
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Nenhum membro encontrado</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <h2 className="text-lg font-bold text-gray-900">
                {confirmModal.action === 'suspend' ? 'Suspender Membro?' : 'Reativar Membro?'}
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              {confirmModal.action === 'suspend'
                ? `Tem certeza que deseja suspender ${confirmModal.memberName}?`
                : `Tem certeza que deseja reativar ${confirmModal.memberName}?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ show: false, action: null, memberId: null, memberName: '' })}
                disabled={actionInProgress}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAction}
                disabled={actionInProgress}
                className={`flex-1 text-white py-2 rounded-lg disabled:opacity-50 ${confirmModal.action === 'suspend' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {actionInProgress ? 'Processando...' : confirmModal.action === 'suspend' ? 'Suspender' : 'Reativar'}
              </button>
            </div>
          </Card>
        </div>
      )}
    </Layout>
  );
};

export default KixikilaMembersManagementPage;
