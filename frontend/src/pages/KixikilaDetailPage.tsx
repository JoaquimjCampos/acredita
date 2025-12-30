import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import KixikilaService from '../services/kixikila/kixikilaService';
import { KixikilaGroupDTO } from '../types/api';
import { useAuth } from '../hooks/useAuth';
import { Users, MapPin, TrendingUp, Plus, ArrowLeft, Settings, DollarSign, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const KixikilaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState<KixikilaGroupDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [membersCount, setMembersCount] = useState<number>(0);
  const [totalInCash, setTotalInCash] = useState<number>(0);
  const [nextCycleAmount, setNextCycleAmount] = useState<number>(0);
  const [participationRate, setParticipationRate] = useState<number>(0);
  const [recentContributions, setRecentContributions] = useState<any[]>([]);
  const [cycleInfo, setCycleInfo] = useState<any>(null);
  const [reputation, setReputation] = useState<any>(null);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        if (id && !isNaN(parseInt(id))) {
          const data = await KixikilaService.getGroup(parseInt(id));
          setGroup(data);
          setNextCycleAmount(Number(data.monthly_contribution) || 0);
          
          // Check if user is member
          if (user) {
            try {
              const membershipData = await KixikilaService.checkMembership(parseInt(id));
              setIsMember(membershipData.is_member);
            } catch (error) {
              // If endpoint fails, default to not member
              setIsMember(false);
            }
          }

          // Load aggregated stats from backend
          try {
            const stats = await KixikilaService.getGroupStats(parseInt(id));
            setMembersCount(stats.active || 0);
            setTotalInCash(stats.cash || 0);
            setNextCycleAmount(stats.next || Number(data.monthly_contribution) || 0);
            setParticipationRate(stats.participation_rate ?? 0);
          } catch (err) {
            // Keep defaults if endpoint fails
            setMembersCount(0);
            setTotalInCash(0);
          }

          // Load recent contributions for timeline
          try {
            const contribs = await KixikilaService.getGroupContributions(parseInt(id));
            // Get last 5 contributions
            setRecentContributions(contribs.results?.slice(0, 5) || []);
          } catch (err) {
            // Keep empty timeline if endpoint fails
            setRecentContributions([]);
          }

          // Load cycle information (round, next beneficiary, etc)
          try {
            const cycles = await KixikilaService.getGroupCycles(parseInt(id));
            setCycleInfo(cycles);
          } catch (err) {
            // Keep empty if endpoint fails
            setCycleInfo(null);
          }

          // Load my reputation
          if (user) {
            try {
              const rep = await KixikilaService.getMyReputation();
              setReputation(rep);
            } catch (err) {
              setReputation(null);
            }
          }
        }
      } catch (error: any) {
        toast.error(error.message || 'Erro ao carregar grupo');
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [id, user]);

  const handleJoinGroup = async () => {
    try {
      if (id) {
        await KixikilaService.joinGroup(parseInt(id));
        setIsMember(true);
        toast.success('Você se juntou ao grupo!');
      }
    } catch (error: any) {
      const message = error.message || 'Erro ao entrar no grupo';
      toast.error(message);
      // If error is "already member", update state
      if (message.includes('já é membro') || message.includes('already')) {
        setIsMember(true);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner text="Carregando detalhes do grupo..." />
        </div>
      </Layout>
    );
  }

  if (!group) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Grupo não encontrado</h2>
              <button
                onClick={() => navigate('/kixikila')}
                className="mt-4 inline-flex items-center gap-2 text-violet-600 hover:text-violet-700"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar para grupos
              </button>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/kixikila')}
            className="mb-4 inline-flex items-center gap-2 text-violet-100 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Users className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold">{group.name}</h1>
              <p className="text-violet-100 mt-2">{group.description}</p>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-sm text-violet-100">Total em Caixa</p>
                  <p className="text-2xl font-bold">AOA {Number(totalInCash).toFixed(2)}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-sm text-violet-100">Membros Ativos</p>
                  <p className="text-2xl font-bold">{membersCount}</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-sm text-violet-100">Próximo Ciclo</p>
                  <p className="text-2xl font-bold">AOA {Number(nextCycleAmount).toFixed(2)}</p>
                </div>
              </div>
            </div>
            {user && !isMember && (
              <button
                onClick={handleJoinGroup}
                className="ml-auto flex items-center gap-2 bg-white text-violet-600 hover:bg-violet-50 px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                <Plus className="h-4 w-4" /> Entrar no Grupo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6 border-l-4 border-violet-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Membros</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{membersCount}</p>
                </div>
                <Users className="h-10 w-10 text-violet-600 opacity-20" />
              </div>
            </Card>

            {group.monthly_contribution && (
              <Card className="p-6 border-l-4 border-violet-500">
                <div className="flex items-center justify-between">
                  <div>
                  <p className="text-gray-600 text-sm font-medium">Contribuição Mensal</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    AOA {Number(group.monthly_contribution).toFixed(2)}
                  </p>
                  </div>
                  <DollarSign className="h-10 w-10 text-violet-600 opacity-20" />
                </div>
              </Card>
            )}

            {group.start_date && (
              <Card className="p-6 border-l-4 border-violet-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Desde</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {new Date(group.start_date).toLocaleDateString('pt-AO')}
                    </p>
                  </div>
                  <Calendar className="h-10 w-10 text-violet-600 opacity-20" />
                </div>
              </Card>
            )}

            <Card className="p-6 border-l-4 border-violet-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Status</p>
                  <p className="text-lg font-bold text-green-600 mt-1">Ativo</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-600 opacity-20" />
              </div>
            </Card>
          </div>

          {/* Member Status Card */}
          {isMember && (
            <Card className="p-6 bg-violet-50 border-l-4 border-violet-600">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-violet-900">Você é membro deste grupo</h3>
                  <p className="text-violet-800 text-sm mt-1">Acesso completo aos recursos e atividades</p>
                </div>
                <button
                  onClick={() => navigate(`/kixikila/${id}/manage`)}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg"
                >
                  <Settings className="h-4 w-4" />
                  Gerenciar
                </button>
              </div>
            </Card>
          )}

          {/* Cycle Information Card */}
          {cycleInfo && (
            <Card className="p-6 bg-blue-50 border-l-4 border-blue-600">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Ciclo Atual</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-blue-800">Ronda</p>
                  <p className="text-2xl font-bold text-blue-900">{cycleInfo.current_round}/{cycleInfo.total_rounds}</p>
                </div>
                {cycleInfo.next_beneficiary && (
                  <>
                    <div>
                      <p className="text-sm text-blue-800">Próximo Beneficiário</p>
                      <p className="text-lg font-bold text-blue-900">{cycleInfo.next_beneficiary.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-800">Valor Previsto</p>
                      <p className="text-lg font-bold text-blue-900">AOA {Number(cycleInfo.next_beneficiary.amount).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-800">Data Agendada</p>
                      <p className="text-lg font-bold text-blue-900">{new Date(cycleInfo.next_beneficiary.scheduled_date).toLocaleDateString('pt-AO')}</p>
                    </div>
                  </>
                )}
              </div>
              {cycleInfo.current_round_contributions && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm text-blue-800 mb-2">Contribuições desta Ronda</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-blue-900">✓ Confirmadas: {cycleInfo.current_round_contributions.confirmed}</span>
                    <span className="text-yellow-700">⏳ Pendentes: {cycleInfo.current_round_contributions.pending}</span>
                    <span className="text-red-600">⚠ Atrasadas: {cycleInfo.current_round_contributions.late}</span>
                  </div>
                </div>
              )}
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Sobre o Grupo</h2>
                <p className="text-gray-700 leading-relaxed mb-6">{group.description}</p>
                
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tipo de Grupo</h3>
                    <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm">
                      {group.group_type?.replace('_', ' ') || 'Poupança Rotativa'}
                    </div>
                  </div>
              </Card>

              {/* Activity Timeline */}
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Atividades Recentes</h2>
                <div className="space-y-6">
                  {recentContributions && recentContributions.length > 0 ? (
                    recentContributions.map((contrib) => {
                      const daysAgo = Math.floor(
                        (new Date().getTime() - new Date(contrib.payment_date).getTime()) / (1000 * 60 * 60 * 24)
                      );
                      const timeLabel = daysAgo === 0 ? 'Hoje' : daysAgo === 1 ? 'Ontem' : `Há ${daysAgo} dias`;
                      return (
                        <div key={contrib.id} className="flex gap-4 pb-6 border-b border-gray-200 last:border-b-0">
                          <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                            <DollarSign className="h-5 w-5 text-violet-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {contrib.member_username} contribuiu AOA {Number(contrib.amount).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">{timeLabel}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-gray-500">Sem atividades recentes</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Group Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tipo</p>
                    <p className="text-gray-900 capitalize mt-1">{group.group_type?.replace('_', ' ') || 'Poupança'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total em Caixa</p>
                    <p className="text-2xl font-bold text-violet-600 mt-1">
                      AOA {Number(totalInCash).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Criado em</p>
                    <p className="text-gray-900 mt-1">
                      {group.created_at ? new Date(group.created_at).toLocaleDateString('pt-AO') : 'N/A'}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Reputation */}
              {reputation && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Reputação</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Nível</p>
                      <p className="text-xl font-bold capitalize">{reputation.trust_level.replace('_', ' ')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Score</p>
                      <p className="text-2xl font-bold">{reputation.reputation_score}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Actions */}
              <Card className="p-6 space-y-3">
                {!isMember && user && (
                  <button
                    onClick={handleJoinGroup}
                    className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Entrar no Grupo
                  </button>
                )}
                
                {!user && (
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Fazer Login
                  </button>
                )}

                {isMember && (
                  <button
                    onClick={() => navigate(`/kixikila/${id}/contribute`)}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    <DollarSign className="h-4 w-4" />
                    Fazer Contribuição
                  </button>
                )}

                {/* Export CSV (owner only) */}
                {user && group && (group as any).created_by_username === (user as any).username && (
                  <button
                    onClick={async () => {
                      try {
                        await KixikilaService.exportGroupContributions(Number(id));
                      } catch (e: any) {
                        toast.error(e.message || 'Erro ao exportar CSV');
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 border border-violet-300 text-violet-700 hover:bg-violet-50 px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Exportar Contribuições (CSV)
                  </button>
                )}

                <button
                  onClick={() => navigate('/kixikila')}
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-3 rounded-lg font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar aos Grupos
                </button>
              </Card>

              {/* Stats */}
              <Card className="p-6 bg-violet-50">
                <h3 className="text-lg font-semibold text-violet-900 mb-4">Estatísticas</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-violet-800">Taxa de Participação</span>
                    <span className="font-semibold text-violet-900">95%</span>
                  </div>
                  <div className="w-full bg-violet-200 rounded-full h-2">
                    <div className="bg-violet-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default KixikilaDetailPage;
