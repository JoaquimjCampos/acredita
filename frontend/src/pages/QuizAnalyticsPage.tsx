import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import QuizAnalyticsDashboard from '../components/games/QuizAnalyticsDashboard';
import { ArrowLeft, BarChart2, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

interface QuizData {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
}

const QuizAnalyticsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchQuiz = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/games/quiz/quizzes/${id}/`);
      if (!response.ok) {
        throw new Error('Quiz não encontrado');
      }
      const data = await response.json();
      setQuiz(data);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar quiz');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!id) return;
    setAnalyticsLoading(true);
    try {
      const response = await fetch(`/api/games/quiz/quizzes/${id}/analytics/`);
      if (!response.ok) {
        throw new Error('Falha ao carregar análises');
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar análises');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
    fetchAnalytics();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <LoadingSpinner text="Carregando quiz..." />
        </div>
      </Layout>
    );
  }

  if (!quiz) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="p-8">
            <p className="text-gray-600">Quiz não encontrado</p>
            <button
              onClick={() => navigate('/quizzes')}
              className="mt-4 bg-violet-600 text-white px-4 py-2 rounded"
            >
              Voltar aos Quizzes
            </button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <button
            onClick={() => navigate(`/quiz/${id}`)}
            className="flex items-center gap-2 text-indigo-100 hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Quiz
          </button>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <BarChart2 className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold">{quiz.title}</h1>
              <p className="text-indigo-100 mt-1">{quiz.description || 'Análises de Desempenho'}</p>
              <div className="flex gap-4 mt-3">
                {quiz.category && (
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full">{quiz.category}</span>
                )}
                {quiz.difficulty && (
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Dificuldade: {quiz.difficulty}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Análises do Quiz</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Visualize o desempenho e identifique áreas de melhoria
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/quiz/${id}/leaderboard`)}
                  className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
                >
                  <Trophy className="h-4 w-4" />
                  Ver Leaderboard
                </button>
                <button
                  onClick={fetchAnalytics}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg"
                >
                  <BarChart2 className="h-4 w-4" />
                  Atualizar Dados
                </button>
              </div>
            </div>
          </Card>

          {/* Analytics Dashboard */}
          <QuizAnalyticsDashboard 
            data={analytics} 
            loading={analyticsLoading} 
            quizTitle={quiz.title}
          />
        </div>
      </div>
    </Layout>
  );
};

export default QuizAnalyticsPage;
