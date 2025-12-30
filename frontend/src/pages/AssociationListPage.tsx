import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { gamesService } from '../services/gamesService';
import { Association } from '../types/games';
import { Puzzle, ArrowLeft, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const AssociationListPage: React.FC = () => {
  const navigate = useNavigate();
  const [associations, setAssociations] = React.useState<Association[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadAssociations();
  }, []);

  const loadAssociations = async () => {
    try {
      setLoading(true);
      const data = await gamesService.getAssociations();
      setAssociations(data);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao buscar associações:', err);
      setError('Não foi possível carregar as associações. Tente novamente mais tarde.');
      toast.error('Erro ao carregar associações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gradient-to-r from-pink-600 to-purple-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/jogos')}
              className="hover:bg-white/20 p-2 rounded-lg transition"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Puzzle className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Associações</h1>
              <p className="text-pink-100 mt-1">Encontre as conexões e ganhe pontos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner text="Carregando associações..." />
            </div>
          )}

          {error && (
            <Card className="text-center py-12 text-red-600 font-semibold">
              {error}
            </Card>
          )}

          {!loading && !error && associations.length === 0 && (
            <Card className="text-center py-12">
              <Puzzle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma associação disponível</h3>
              <p className="text-gray-600">Em breve teremos mais associações disponíveis.</p>
            </Card>
          )}

          {!loading && !error && associations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {associations.map((association) => (
                <Card key={association.id} className="p-6 border-l-4 border-pink-500 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{association.title}</h3>
                      <p className="text-sm text-gray-600">Jogo de Associação</p>
                    </div>
                    <Puzzle className="h-8 w-8 text-pink-600" />
                  </div>
                  <p className="text-gray-700 mb-4">{association.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                      <Zap className="h-3 w-3 mr-1" /> +75 XP
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      navigate(`/jogos/associacao/${association.id}`);
                      toast.success('Iniciando associação...');
                    }}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Jogar
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AssociationListPage;
