import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { Trophy, Zap, Search, Filter } from 'lucide-react';
import gamesService from '../services/gamesService';
import seasonConfig from '../config/season.json';

const QuizListPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const seasonNumber = seasonConfig.season_number;

  useEffect(() => {
    setLoading(true);
    gamesService.getQuizzesBySeason(seasonNumber)
      .then((list: any[]) => {
        setQuizzes(list);
      })
      .catch((err: Error) => setError(err.message || 'Erro ao carregar quizzes'))
      .finally(() => setLoading(false));
  }, [seasonNumber]);

  const filtered = quizzes.filter((q) =>
    (!search || (q.title || '').toLowerCase().includes(search.toLowerCase())) &&
    (!category || (q.category || '').toLowerCase() === category.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner text="Carregando quizzes..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Quizzes da Temporada</h1>
              <p className="text-cyan-100 mt-1">Participe, ganhe XP e suba no ranking!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          {error ? (
            <Card className="p-6 border-l-4 border-red-500">{error}</Card>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar quizzes..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div className="relative sm:w-48">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none bg-white"
                  >
                    <option value="">Todas categorias</option>
                    <option value="Empreendedorismo">Empreendedorismo</option>
                    <option value="Finanças">Finanças</option>
                    <option value="Cultura">Cultura</option>
                  </select>
                </div>
              </div>

              {filtered.length === 0 ? (
                <Card className="text-center py-12">
                  <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum quiz encontrado</h3>
                  <p className="text-gray-600">Tente ajustar os filtros de pesquisa.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((quiz) => (
                    <Card key={quiz.id} className="p-6 border-l-4 border-cyan-600 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{quiz.title}</h3>
                          <p className="text-sm text-gray-600">{quiz.category}</p>
                        </div>
                        <Zap className="h-6 w-6 text-cyan-600" />
                      </div>
                      <p className="text-gray-700 mb-6">{quiz.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">+50 XP</span>
                      </div>
                      <a
                        href={`/jogos/quiz/${quiz.id}`}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                        style={{ textDecoration: 'none' }}
                      >
                        <Zap className="h-4 w-4" /> Jogar
                      </a>
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

export default QuizListPage;
