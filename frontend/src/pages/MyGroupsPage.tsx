import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button, Card, LoadingSpinner } from '../components/common';
import KixikilaService from '../services/kixikila/kixikilaService';
import { KixikilaGroupDTO } from '../types/api';
import { Users, ArrowRight, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const MyGroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<KixikilaGroupDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [reputation, setReputation] = useState<{
    reputation_score: number;
    trust_level: 'beginner' | 'reliable' | 'trusted' | 'champion';
    groups_participated: number;
  } | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const response = await KixikilaService.getGroups({ status: 'active' });
        setGroups(response.results);
        try {
          const rep = await KixikilaService.getMyReputation();
          setReputation({
            reputation_score: rep.reputation_score,
            trust_level: rep.trust_level,
            groups_participated: rep.groups_participated,
          });
        } catch {
          // ignore
        }
      } catch (error: any) {
        toast.error('Erro ao carregar meus grupos.');
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  if (loading) {
    return <Layout><div className="flex justify-center items-center h-96"><LoadingSpinner size="lg" /></div></Layout>;
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Heart className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Meus Grupos (Kixikila)</h1>
              <p className="text-purple-100 mt-1">Associações comunitárias de poupança e desenvolvimento</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          {reputation && (
            <Card className="p-4 mb-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Reputação Kixikila</p>
                  <p className="text-lg font-semibold text-gray-900">{reputation.trust_level.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Pontuação</p>
                  <p className="text-xl font-bold text-gray-900">{reputation.reputation_score}</p>
                </div>
              </div>
            </Card>
          )}
          {groups.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum grupo encontrado</h3>
              <p className="text-gray-600 mb-6">Você ainda não é membro de nenhum grupo Kixikila.</p>
              <Button variant="primary" onClick={() => navigate('/kixikila')}>
                Explorar Grupos
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <Card key={group.id} className="p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-500">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex-1">{group.name}</h3>
                    <Heart className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{group.group_type}</p>
                  <div className="flex items-center justify-between mb-4 py-3 border-y border-gray-200">
                    <span className="text-sm text-gray-500">{group.member_count} membros</span>
                    <span className="text-sm font-semibold text-purple-600">{group.monthly_contribution} Kz/mês</span>
                  </div>
                  <Button 
                    size="sm"
                    variant="outline" 
                    onClick={() => navigate(`/kixikila/${group.id}`)}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    Ver Grupo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyGroupsPage;
