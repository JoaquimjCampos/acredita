import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { useGames } from '../hooks';
import { Gamepad2, HelpCircle, Puzzle, Brain, Search, Filter, Trophy, Zap, BookOpen } from 'lucide-react';
import gamesService from '../services/gamesService';
import seasonConfig from '../config/season.json';
import toast from 'react-hot-toast';

const GamesPage: React.FC = () => {
  const navigate = useNavigate();
  const { games, loading, error } = useGames();
  const [search, setSearch] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('');
  const [featuredQuiz, setFeaturedQuiz] = React.useState<any | null>(null);
  const seasonNumber = seasonConfig.season_number;

  React.useEffect(() => {
    // Load top quiz for CTA
    gamesService.getQuizzesBySeason(seasonNumber)
      .then((list: any[]) => {
        setFeaturedQuiz(list[0] || null);
      })
      .catch(() => {})
  }, [seasonNumber]);

  // Read type from URL query (?type=quiz)
  React.useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const type = params.get('type') || '';
      if (type) setTypeFilter(type);
    } catch {}
  }, []);

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
      case 'crosswords': return <BookOpen className="h-8 w-8 text-purple-600" />;
      default: return <Gamepad2 className="h-8 w-8 text-purple-600" />;
    }
  };

  const getUrl = (type: string, id: number) => {
    switch (type) {
      case 'quiz': return `/jogos/quiz/${id}`;
      case 'simulator': return `/jogos/simuladores`;
      case 'association': return `/jogos/associacao`;
      case 'crosswords': return `/jogos/palavras-cruzadas`;
      default: return '#';
    }
  };

  const getXP = (type: string) => {
    switch (type) {
      case 'quiz': return '+50 XP';
      case 'simulator': return '+100 XP';
      case 'association': return '+75 XP';
      case 'crosswords': return '+60 XP';
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
          {/* Quiz Challenge CTA */}
          {featuredQuiz && (
            <Card className="mb-8 p-6 border-l-4 border-cyan-600 bg-gradient-to-br from-cyan-50 to-blue-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm font-semibold text-cyan-700">Quiz Challenge</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{featuredQuiz.title}</h3>
                  <p className="text-gray-700 mt-1 line-clamp-2">{featuredQuiz.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-cyan-100 text-cyan-700 rounded font-semibold">
                      {featuredQuiz.category}
                    </span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">+50 XP</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={() => { window.location.href = `/jogos/quiz/${featuredQuiz.id}`; }}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold px-4 py-2 rounded-lg inline-flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" /> Jogar Agora
                  </button>
                </div>
              </div>
            </Card>
          )}
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
                    <option value="crosswords">Palavras Cruzadas</option>
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
                          navigate(getUrl(game.type, game.id));
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
