import React, { useEffect, useState } from 'react';
import { Card, LoadingSpinner } from './common';
import apiService from '../services/api.original';

const SeasonLeaderboard: React.FC<{ quizId: number, seasonNumber: number }> = ({ quizId, seasonNumber }) => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService.getQuizLeaderboard(quizId, seasonNumber)
      .then(res => {
        if (Array.isArray(res)) {
          setLeaderboard(res);
        } else if ('results' in res && Array.isArray(res.results)) {
          setLeaderboard(res.results);
        } else if ('leaderboard' in res && Array.isArray(res.leaderboard)) {
          setLeaderboard(res.leaderboard);
        } else {
          setLeaderboard([]);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [quizId, seasonNumber]);

  if (loading) return <LoadingSpinner text="A carregar classificação..." />;
  if (error) return <Card className="bg-red-50 text-red-700 p-4">{error}</Card>;

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-bold text-acredita-primary mb-4">Classificação do Quiz</h2>
      <div aria-live="polite">
        <ul className="space-y-4">
          {leaderboard.map((item: any, idx: number) => (
            <li key={item.id || idx} className="border-b pb-2 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-acredita-primary transition-all duration-200">
              <span className="font-semibold">{item.nome || item.name}</span>
              <span className="text-xs text-gray-500">{item.total_votos || item.score} votos</span>
              <span className="text-xs text-acredita-primary font-bold">#{item.posicao || idx + 1}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default SeasonLeaderboard;
