import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
import { useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { mcpFetch } from '../mcpClient';

const AdminQuizAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  useEffect(() => {
    if (id) fetchAnalytics(id);
    // eslint-disable-next-line
  }, [id, dateFrom, dateTo]);

  const fetchAnalytics = async (quizId: string) => {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/games/quiz/quizzes/${quizId}/analytics/`;
      const params = [];
      if (dateFrom) params.push(`from=${dateFrom}`);
      if (dateTo) params.push(`to=${dateTo}`);
      if (params.length) url += `?${params.join("&")}`;
      const { data } = await mcpFetch(url);
      setAnalytics(data);
    } catch (err) {
      setError('Erro ao carregar analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner text="Carregando analytics..." /></Layout>;
  if (error) return <Layout><p className="text-red-500">{error}</p></Layout>;
  if (!analytics) return <Layout><p>Nenhum dado disponível.</p></Layout>;

  // Export analytics to JSON
  const handleExportJSON = () => {
    if (!analytics) return;
    const blob = new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz_analytics.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  // Export analytics to CSV
  const handleExportCSV = () => {
    if (!analytics) return;
    let csv = 'Section,Key,Value\n';
    csv += `Summary,Average Score,${analytics.average_score}\n`;
    csv += `Summary,Average Time (seconds),${analytics.average_time_seconds ?? 'N/A'}\n`;
    csv += `Summary,Completion Rate,${(analytics.completion_rate * 100).toFixed(1)}%\n`;
    analytics.most_missed_questions.forEach((q: any) => {
      csv += `Most Missed,${q.text},Missed: ${q.missed},Correct: ${q.correct},Total: ${q.total}\n`;
    });
    Object.values(analytics.answer_distribution).forEach((q: any) => {
      Object.entries(q.distribution).forEach(([opt, count]: [string, any]) => {
        csv += `Answer Distribution,${q.text},${opt}: ${count}\n`;
      });
    });
    if (analytics.user_progress) {
      analytics.user_progress.forEach((s: any) => {
        csv += `User Progress,Score,${s.score},Started: ${s.started_at},Finished: ${s.finished_at}\n`;
      });
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz_analytics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <Card title="Quiz Analytics">
  <div className="mb-4 flex gap-4 items-center">
          <label>
            From: <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border rounded px-2 py-1 ml-1" />
          </label>
          <label>
            To: <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border rounded px-2 py-1 ml-1" />
          </label>
          <button onClick={() => fetchAnalytics(id!)} className="ml-2 px-3 py-1 bg-blue-600 text-white rounded">Filter</button>
          <button onClick={handleExportCSV} className="ml-2 px-3 py-1 bg-green-600 text-white rounded">Export CSV</button>
          <button onClick={handleExportJSON} className="ml-2 px-3 py-1 bg-yellow-600 text-white rounded">Export JSON</button>
        </div>
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 rounded p-4 shadow">
            <div className="text-xs text-gray-500 mb-1">Average Score</div>
            <div className="text-2xl font-bold text-blue-700">{analytics.average_score}</div>
          </div>
          <div className="bg-blue-50 rounded p-4 shadow">
            <div className="text-xs text-gray-500 mb-1">Average Time (seconds)</div>
            <div className="text-2xl font-bold text-blue-700">{analytics.average_time_seconds ?? 'N/A'}</div>
          </div>
          <div className="bg-green-50 rounded p-4 shadow">
            <div className="text-xs text-gray-500 mb-1">Completion Rate</div>
            <div className="text-2xl font-bold text-green-700">{(analytics.completion_rate * 100).toFixed(1)}%</div>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Most Missed Questions</h3>
          <Bar
            data={{
              labels: analytics.most_missed_questions.map((q: any) => q.text),
              datasets: [
                {
                  label: 'Missed',
                  data: analytics.most_missed_questions.map((q: any) => q.missed),
                  backgroundColor: '#dc2626',
                },
                {
                  label: 'Correct',
                  data: analytics.most_missed_questions.map((q: any) => q.correct),
                  backgroundColor: '#10b981',
                },
              ],
            }}
            options={{ responsive: true, plugins: { legend: { position: 'top' } } }}
            height={220}
          />
          <ul className="mt-4">
            {analytics.most_missed_questions.map((q: any, idx: number) => (
              <li key={idx} style={{color: idx === 0 ? '#dc2626' : '#333', fontWeight: idx === 0 ? 'bold' : 'normal'}}>
                {q.text} <span className="ml-2">Missed: <b>{q.missed}</b></span> <span className="ml-2">Correct: {q.correct}</span> <span className="ml-2">Total: {q.total}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Answer Distribution</h3>
          {Object.values(analytics.answer_distribution).map((q: any, idx: number) => (
            <div key={idx} className="mb-6">
              <span className="font-semibold">{q.text}</span>
              <Pie
                data={{
                  labels: Object.keys(q.distribution),
                  datasets: [
                    {
                      data: Object.values(q.distribution),
                      backgroundColor: [
                        '#3b82f6', '#fbbf24', '#10b981', '#ef4444', '#6366f1', '#f472b6', '#a3e635', '#f59e42', '#38bdf8', '#eab308'
                      ],
                    },
                  ],
                }}
                options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
                height={180}
              />
              <ul className="ml-4 mt-2">
                {Object.entries(q.distribution).map(([opt, count]: [string, any]) => (
                  <li key={opt} className="text-gray-700">{opt}: <b>{count}</b></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {analytics.user_progress && (
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Your Progress</h3>
            <ul className="ml-4">
              {analytics.user_progress.map((s: any, idx: number) => (
                <li key={idx} className="text-gray-700">Score: <b>{s.score}</b>, Started: {s.started_at}, Finished: {s.finished_at}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </Layout>
  );
};

export default AdminQuizAnalytics;
