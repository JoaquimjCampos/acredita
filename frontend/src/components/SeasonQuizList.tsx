import React, { useEffect, useState } from 'react';
import { Card, LoadingSpinner, Button } from './common';
import apiService from '../services/api.original';

const SeasonQuizList: React.FC<{ seasonNumber: number }> = ({ seasonNumber }) => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService.getQuizzesBySeason(seasonNumber)
      .then(res => {
        if (Array.isArray(res)) {
          setQuizzes(res);
        } else if (Array.isArray(res.results)) {
          setQuizzes(res.results);
        } else {
          setQuizzes([]);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [seasonNumber]);

  if (loading) return <LoadingSpinner text="A carregar quizzes..." />;
  if (error) return <Card className="bg-red-50 text-red-700 p-4">{error}</Card>;

  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-bold text-acredita-primary mb-4">Quizzes da Temporada</h2>
      <div aria-live="polite">
        <ul className="space-y-4">
          {quizzes.map((quiz: any) => (
            <li key={quiz.id} className="border-b pb-2 focus:outline-none focus:ring-2 focus:ring-acredita-primary transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-lg">{quiz.title}</span>
                  <div className="text-sm text-gray-600">{quiz.description}</div>
                </div>
                <Button size="sm" onClick={() => window.location.href = `/quizzes/${quiz.id}`}>Ver Quiz</Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default SeasonQuizList;
