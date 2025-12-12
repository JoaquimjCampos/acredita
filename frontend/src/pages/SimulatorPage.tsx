import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { mcpFetch } from '../mcpClient';
import { Simulation } from '../types/Simulation';
import { Zap, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const SimulatorPage: React.FC = () => {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSimulations();
  }, []);

  const loadSimulations = async () => {
    setLoading(true);
    try {
      setError(null);
      const { data } = await mcpFetch('/api/games/simulator/simulators/');
      setSimulations(data?.results || data || []);
    } catch (err) {
      setError('Erro ao carregar simuladores.');
      toast.error('Não foi possível carregar os simuladores.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSims = simulations.filter((sim) =>
    sim.title.toLowerCase().includes(search.toLowerCase()) ||
    sim.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Zap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Simuladores</h1>
              <p className="text-orange-100 mt-1">Simule e teste seus conhecimentos em cenários realistas.</p>
            </div>
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
                  placeholder="Pesquisar simuladores..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </Card>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12"><LoadingSpinner text="Carregando simuladores..." /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSims.map((sim) => (
                <Card key={sim.id} className="p-6 border-l-4 border-orange-500 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{sim.title}</h2>
                    </div>
                    <Zap className="h-5 w-5 text-orange-600" />
                  </div>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">{sim.description}</p>
                  <button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition-colors"
                    onClick={() => (window.location.href = `/jogos/simuladores/${sim.id}`)}
                  >
                    Simular
                  </button>
                </Card>
              ))}
              {filteredSims.length === 0 && (
                <Card className="p-8 text-center col-span-full">
                  <Zap className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-700">Nenhum simulador encontrado. Ajuste sua pesquisa.</p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SimulatorPage;
