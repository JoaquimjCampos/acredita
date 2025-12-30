import React, { useState, useEffect } from 'react';
import { Card, LoadingSpinner } from '../common';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Clock, Target, AlertCircle, CheckCircle } from 'lucide-react';

interface QuizAnalyticsData {
  most_missed_questions: Array<{
    text: string;
    missed: number;
    total: number;
    correct: number;
  }>;
  average_score: number;
  average_time_seconds: number | null;
  user_progress: Array<{
    score: number;
    started_at: string;
    finished_at: string;
  }> | null;
  answer_distribution: Record<string, {
    text: string;
    distribution: Record<string, number>;
  }>;
  completion_rate: number;
}

interface Props {
  data: QuizAnalyticsData | null;
  loading: boolean;
  quizTitle?: string;
}

const QuizAnalyticsDashboard: React.FC<Props> = ({ data, loading, quizTitle }) => {
  const [chartData, setChartData] = useState<any>([]);
  const [missedChartData, setMissedChartData] = useState<any>([]);
  const [progressChartData, setProgressChartData] = useState<any>([]);

  useEffect(() => {
    if (data) {
      // Most missed questions chart
      const missedData = data.most_missed_questions.map((q, idx) => ({
        question: `Q${idx + 1}`,
        fullText: q.text.substring(0, 30) + (q.text.length > 30 ? '...' : ''),
        missed: q.missed,
        correct: q.correct,
        total: q.total,
        accuracy: q.total > 0 ? ((q.correct / q.total) * 100).toFixed(1) : 0,
      }));
      setMissedChartData(missedData);

      // User progress chart (if available)
      if (data.user_progress && data.user_progress.length > 0) {
        const progressData = data.user_progress.slice(0, 10).reverse().map((p, idx) => ({
          attempt: `Attempt ${idx + 1}`,
          score: p.score,
          date: new Date(p.started_at).toLocaleDateString(),
        }));
        setProgressChartData(progressData);
      }
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner text="Carregando análises..." />
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="p-6 text-center text-gray-600">
        Dados de análise não disponíveis
      </Card>
    );
  }

  const avgTimeMinutes = data.average_time_seconds ? (data.average_time_seconds / 60).toFixed(1) : null;
  const completionPercentage = (data.completion_rate * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {quizTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{quizTitle} - Análises</h2>
          <p className="text-gray-600 mt-1">Estatísticas e desempenho detalhado</p>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pontuação Média</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data.average_score.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-2">De 10 perguntas</p>
            </div>
            <Award className="h-8 w-8 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Taxa de Conclusão</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{completionPercentage}%</p>
              <p className="text-xs text-gray-500 mt-2">
                Quizzes completados
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tempo Médio</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {avgTimeMinutes ? `${avgTimeMinutes}m` : 'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-2">Por tentativa</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Questões Difíceis</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data.most_missed_questions.length}
              </p>
              <p className="text-xs text-gray-500 mt-2">Mais erradas</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Missed Questions */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Questões Mais Erradas</h3>
          {missedChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={missedChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="question" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: any, name: string | undefined) => {
                    if (name === 'missed') return [`${value} erradas`, 'Erradas'];
                    if (name === 'correct') return [`${value} correctas`, 'Correctas'];
                    return [value, name || ''];
                  }}
                />
                <Legend />
                <Bar dataKey="missed" fill="#ef4444" name="Erradas" radius={[8, 8, 0, 0]} />
                <Bar dataKey="correct" fill="#10b981" name="Correctas" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Sem dados de questões erradas</p>
          )}
        </Card>

        {/* User Progress (if authenticated) */}
        {data.user_progress && progressChartData.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Seu Progresso</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="attempt" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: any) => [`${value} pontos`, 'Pontuação']}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={{ fill: '#7c3aed', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Completion Rate Visual */}
        {!data.user_progress && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Taxa de Conclusão</h3>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="relative inline-flex">
                  <svg className="w-32 h-32">
                    <circle
                      className="text-gray-300"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="56"
                      cx="64"
                      cy="64"
                    />
                    <circle
                      className="text-green-600"
                      strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - data.completion_rate)}`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="56"
                      cx="64"
                      cy="64"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-900">
                    {completionPercentage}%
                  </span>
                </div>
                <p className="text-gray-600 mt-4">Utilizadores completaram o quiz</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Detailed Question Analysis */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Análise Detalhada das Questões</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-medium text-gray-700">Questão</th>
                <th className="text-right py-3 font-medium text-gray-700">Total Respostas</th>
                <th className="text-right py-3 font-medium text-gray-700">Correctas</th>
                <th className="text-right py-3 font-medium text-gray-700">Erradas</th>
                <th className="text-right py-3 font-medium text-gray-700">Taxa Acerto</th>
              </tr>
            </thead>
            <tbody>
              {missedChartData.map((q: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3">
                    <span className="font-medium text-gray-900">{q.fullText}</span>
                  </td>
                  <td className="py-3 text-right text-gray-600">{q.total}</td>
                  <td className="py-3 text-right">
                    <span className="text-green-600 font-medium">{q.correct}</span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-red-600 font-medium">{q.missed}</span>
                  </td>
                  <td className="py-3 text-right">
                    <span className={`font-medium ${
                      parseFloat(q.accuracy) >= 70 ? 'text-green-600' :
                      parseFloat(q.accuracy) >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {q.accuracy}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tips Based on Analytics */}
      <Card className="p-6 bg-blue-50 border-l-4 border-blue-500">
        <div className="flex items-start gap-3">
          <TrendingUp className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-blue-900 mb-2">Dicas de Melhoria</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {data.average_score < 5 && (
                <li>• Reveja o material antes de tentar novamente</li>
              )}
              {data.completion_rate < 0.5 && (
                <li>• Muitos utilizadores não completam - considere reduzir a dificuldade</li>
              )}
              {data.most_missed_questions.length > 3 && (
                <li>• Foque nas questões mais erradas para melhorar o desempenho</li>
              )}
              {avgTimeMinutes && parseFloat(avgTimeMinutes) < 2 && (
                <li>• Tempo muito curto - pode indicar respostas aleatórias</li>
              )}
              <li>• Pratique regularmente para melhorar a retenção</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuizAnalyticsDashboard;
