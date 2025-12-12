import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import KixikilaService from '../services/kixikila/kixikilaService';
import { KixikilaGroupDTO } from '../types/api';
import { useAuth } from '../hooks/useAuth';
import { Users, Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const KixikilaPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState<KixikilaGroupDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const filters = searchTerm ? { search: searchTerm } : undefined;
        const response = await KixikilaService.getGroups(filters);
        setGroups(response.results || response);
      } catch (error: any) {
        toast.error(error.message || 'Erro ao carregar grupos');
        setGroups([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchGroups();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const filteredGroups = useMemo(
    () => groups.filter((g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [groups, searchTerm]
  );

  const handleCreateGroup = () => {
    if (!user) {
      toast.error('Deve estar autenticado para criar um grupo');
      navigate('/login');
      return;
    }
    navigate('/kixikila/create');
  };

  return (
    <Layout>
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Users className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold">Kixikila - Grupos Comunitários</h1>
              <p className="text-violet-100 mt-1">Encontre e participe em grupos de interesse da comunidade Acredita.</p>
            </div>
            {user && (
              <button
                onClick={handleCreateGroup}
                className="ml-auto flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="h-4 w-4" /> Criar Grupo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar grupos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          </Card>

          {loading ? (
            <div className="flex justify-center py-12"><LoadingSpinner text="Carregando grupos..." /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <Card key={group.id} className="p-6 border-l-4 border-violet-500 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900 flex-1">{group.name}</h2>
                    <Users className="h-5 w-5 text-violet-600 flex-shrink-0" />
                  </div>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">{group.description}</p>
                  <div className="flex items-center justify-between mb-4 text-xs text-gray-600">
                    <span>Membros: {(group as any).member_count || 0}</span>
                  </div>
                  <button
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg transition-colors"
                    onClick={() => navigate(`/kixikila/${group.id}`)}
                  >
                    Ver Grupo
                  </button>
                </Card>
              ))}
              {filteredGroups.length === 0 && (
                <Card className="p-8 text-center col-span-full">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-700">Nenhum grupo encontrado. Ajuste sua pesquisa.</p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default KixikilaPage;
