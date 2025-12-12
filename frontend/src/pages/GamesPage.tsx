import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { useGames } from '../hooks';
import { Gamepad2, HelpCircle, Puzzle, Brain, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const GamesPage: React.FC = () => {
  const { games, loading, error } = useGames();
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner text="Carregando jogos..." />
        </div>
      </Layout>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <HelpCircle className="h-8 w-8 text-purple-600" />;
      case 'simulator': return <Brain className="h-8 w-8 text-purple-600" />;
      case 'association': return <Puzzle className="h-8 w-8 text-purple-600" />;
      default: return <Gamepad2 className="h-8 w-8 text-purple-600" />;
    }
  };

  const getUrl = (type: string, id: number) => {
    switch (type) {
      case 'quiz': return `/quiz/${id}`;
      case 'simulator': return `/simuladores`;
      case 'association': return `/associacao`;
      default: return '#';
    }
  };

  const getXP = (type: string) => {
    switch (type) {
      case 'quiz': return '+50 XP';
      case 'simulator': return '+100 XP';
      case 'association': return '+75 XP';
      default: return '+50 XP';
    }
  };

  const filteredGames = games.filter(game =>
    (!typeFilter || game.type === typeFilter) &&
    (!search || game.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Layout>
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Gamepad2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Jogos Interativos</h1>
              <p className="text-purple-100 mt-1">Descubra jogos e simuladores para desenvolver competências e ganhar XP!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          {error ? (
            <div className="text-center text-red-600 font-semibold py-12">{error}</div>
          ) : (
            <>
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar jogos..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="relative sm:w-48">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white"
                  >
                    <option value="">Todos os tipos</option>
                    <option value="quiz">Quiz</option>
                    <option value="simulator">Simulador</option>
                    <option value="association">Associação</option>
                  </select>
                </div>
              </div>

              {filteredGames.length === 0 ? (
                <Card className="text-center py-12">
                  <Gamepad2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum jogo encontrado</h3>
                  <p className="text-gray-600">Tente ajustar os filtros de pesquisa.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGames.map((game) => (
                    <Card key={game.id} className="p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{game.title}</h3>
                          <p className="text-sm text-gray-600 capitalize">{game.type}</p>
                        </div>
                        {getIcon(game.type)}
                      </div>
                      <p className="text-gray-700 mb-6">{game.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                          {getXP(game.type)}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          window.location.href = getUrl(game.type, game.id);
                          toast.success(`Parabéns! Ganhou ${getXP(game.type)}!`);
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Gamepad2 className="h-4 w-4" />
                        Jogar
                      </button>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GamesPage;
