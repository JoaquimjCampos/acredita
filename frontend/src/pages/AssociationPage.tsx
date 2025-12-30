import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { mcpFetch } from '../mcpClient';
import { Association } from '../types/games';
import { Lightbulb, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const AssociationPage: React.FC = () => {
  const [games, setGames] = useState<Association[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    setLoading(true);
    try {
      setError(null);
      const { data } = await mcpFetch('/api/games/association/');
      setGames(data.results || data);
    } catch (err) {
      setError('Erro ao carregar jogos de associação.');
      toast.error('Não foi possível carregar os jogos.');
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games.filter((game) =>
    game.title.toLowerCase().includes(search.toLowerCase()) ||
    game.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Lightbulb className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Jogos de Associação</h1>
              <p className="text-emerald-100 mt-1">Desafie seu raciocínio lógico com jogos de associação de conceitos.</p>
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
                  placeholder="Pesquisar jogos de associação..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
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
            <div className="flex justify-center py-12"><LoadingSpinner text="Carregando jogos..." /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <Card key={game.id} className="p-6 border-l-4 border-emerald-500 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{game.title}</h2>
                    </div>
                    <Lightbulb className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">{game.description}</p>
                  <button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition-colors"
                    onClick={() => (window.location.href = `/jogos/associacao/${game.id}`)}
                  >
                    Jogar Associação
                  </button>
                </Card>
              ))}
              {filteredGames.length === 0 && (
                <Card className="p-8 text-center col-span-full">
                  <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-700">Nenhum jogo encontrado. Ajuste sua pesquisa.</p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AssociationPage;
