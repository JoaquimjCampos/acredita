import React, { useEffect, useState } from 'react';
import { Card } from '../components/common';
import { Trophy, Star, Zap } from 'lucide-react';
import gamesService from '../services/gamesService';
import seasonConfig from '../config/season.json';

const FeaturedQuizChallenge: React.FC = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const seasonNumber = seasonConfig.season_number;

  useEffect(() => {
    gamesService.getQuizzesBySeason(seasonNumber)
      .then((res: any[]) => {
        const quizData = Array.isArray(res) ? res : [];
        setQuizzes(quizData.slice(0, 3)); // Show top 3 quizzes
      })
      .catch((err: Error) => console.error('Erro ao carregar quizzes:', err))
      .finally(() => setLoading(false));
  }, [seasonNumber]);

  return (
    <Card className="p-8 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 shadow-xl border-2 border-cyan-500 animate-fade-in mb-12">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Trophy className="h-10 w-10 text-yellow-500" />
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">🎯 Quiz Challenge da Temporada</h2>
            <p className="text-lg text-gray-700">Teste seus conhecimentos e suba no ranking!</p>
          </div>
        </div>

        {!loading && quizzes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quizzes.map((quiz, idx) => (
              <a
                key={quiz.id}
                href={`/jogos/quiz/${quiz.id}`}
                className="block p-4 bg-white rounded-lg border-2 border-cyan-200 hover:border-cyan-500 hover:shadow-lg transition-all duration-200 group"
                style={{ textDecoration: 'none' }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {idx === 0 && <Star className="h-6 w-6 text-yellow-500" />}
                    {idx === 1 && <Zap className="h-6 w-6 text-blue-500" />}
                    {idx === 2 && <Trophy className="h-6 w-6 text-purple-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 group-hover:text-cyan-600 transition-colors mb-1">
                      {quiz.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{quiz.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-1 bg-cyan-100 text-cyan-700 rounded font-semibold">
                        {quiz.category}
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">
                        +50 XP
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <a
            href="/jogos"
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 inline-flex items-center gap-2"
            style={{ textDecoration: 'none' }}
          >
            <Zap className="h-5 w-5" />
            Ver Todos os Jogos
          </a>
          <a
            href="/jogos?type=quiz"
            className="bg-white text-cyan-700 px-6 py-3 rounded-lg font-bold text-lg border-2 border-cyan-600 hover:bg-cyan-50 transition-all duration-200 inline-flex items-center gap-2"
            style={{ textDecoration: 'none' }}
          >
            <Trophy className="h-5 w-5" />
            Ver Todos os Quizzes
          </a>
        </div>
      </div>
    </Card>
  );
};

export default FeaturedQuizChallenge;
