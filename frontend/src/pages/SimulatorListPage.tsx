import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { gamesService } from '../services/gamesService';
import { Simulator } from '../types/games';
import { Brain, ArrowLeft, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const SimulatorListPage: React.FC = () => {
  const navigate = useNavigate();
  const [simulators, setSimulators] = React.useState<Simulator[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadSimulators();
  }, []);

  const loadSimulators = async () => {
    try {
      setLoading(true);
      const data = await gamesService.getSimulators();
      setSimulators(data);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao buscar simuladores:', err);
      setError('Não foi possível carregar os simuladores. Tente novamente mais tarde.');
      toast.error('Erro ao carregar simuladores');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/jogos')}
              className="hover:bg-white/20 p-2 rounded-lg transition"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Simuladores</h1>
              <p className="text-blue-100 mt-1">Teste suas competências em simulações realistas</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner text="Carregando simuladores..." />
            </div>
          )}

          {error && (
            <Card className="text-center py-12 text-red-600 font-semibold">
              {error}
            </Card>
          )}

          {!loading && !error && simulators.length === 0 && (
            <Card className="text-center py-12">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum simulador disponível</h3>
              <p className="text-gray-600">Em breve teremos mais simuladores disponíveis.</p>
            </Card>
          )}

          {!loading && !error && simulators.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {simulators.map((simulator) => (
                <Card key={simulator.id} className="p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{simulator.title}</h3>
                      <p className="text-sm text-gray-600">{simulator.scenario_type || 'Simulação'}</p>
                    </div>
                    <Brain className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-gray-700 mb-4">{simulator.description}</p>
                  
                  {simulator.difficulty && (
                    <div className="mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                        {simulator.difficulty}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                      <Zap className="h-3 w-3 mr-1" /> +100 XP
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      navigate(`/jogos/simuladores/${simulator.id}/generic`);
                      toast.success('Iniciando simulador...');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Iniciar Simulador
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

export default SimulatorListPage;
