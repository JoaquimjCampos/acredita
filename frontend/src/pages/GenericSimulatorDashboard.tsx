import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { Bar, Pie } from 'react-chartjs-2';
import { mcpFetch } from '../mcpClient';

const GenericSimulatorDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!id) return;
    mcpFetch(`/api/games/simulator/analytics/${id}/`).then(({ data }) => {
      setAnalytics(data);
      setLoading(false);
    });
  }, [id]);

  if (loading || !analytics) return <Layout><LoadingSpinner text="Carregando analytics..." /></Layout>;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        <Card title="Dashboard de Analytics">
          <div className="mb-6">
            <div className="font-semibold mb-2">Taxa de conclusão: <span className="text-green-700">{(analytics.completion_rate * 100).toFixed(1)}%</span></div>
            <div className="font-semibold mb-2">Total de sessões: <span className="text-blue-700">{analytics.total_sessions}</span></div>
          </div>
          {analytics.scenario_chart && (
            <div className="mb-8">
              <h3 className="font-semibold mb-2">Cenários mais escolhidos</h3>
              <Bar
                data={{
                  labels: analytics.scenario_chart.map((sc: any) => sc.title),
                  datasets: [
                    {
                      label: 'Total de escolhas',
                      data: analytics.scenario_chart.map((sc: any) => sc.total),
                      backgroundColor: '#6366f1',
                    },
                  ],
                }}
                options={{ responsive: true, plugins: { legend: { display: false } } }}
                height={180}
              />
            </div>
          )}
          {analytics.scenario_chart && (
            <div className="mb-8">
              <h3 className="font-semibold mb-2">Distribuição de escolhas por cenário</h3>
              {analytics.scenario_chart.map((sc: any, idx: number) => (
                <div key={sc.id} className="mb-6">
                  <span className="font-semibold">{sc.title}</span>
                  <Pie
                    data={{
                      labels: Object.keys(sc.choices),
                      datasets: [
                        {
                          data: Object.values(sc.choices),
                          backgroundColor: [
                            '#3b82f6', '#fbbf24', '#10b981', '#ef4444', '#6366f1', '#f472b6', '#a3e635', '#f59e42', '#38bdf8', '#eab308'
                          ],
                        },
                      ],
                    }}
                    options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
                    height={180}
                  />
                </div>
              ))}
            </div>
          )}
          {analytics.leaderboard && (
            <div className="mb-8">
              <h3 className="font-semibold mb-2">Leaderboard</h3>
              <ul className="divide-y divide-gray-200">
                {analytics.leaderboard.map((entry: any, idx: number) => (
                  <li key={idx} className="flex items-center py-2">
                    <span className="font-semibold mr-2">{entry.user.nome}</span>
                    <span className="ml-auto text-blue-700 font-bold">{entry.score} pts</span>
                    <span className="ml-4 text-xs text-gray-400">{entry.streak ? `🔥 ${entry.streak}d` : ''}</span>
                    <span className="ml-4 text-xs text-purple-600">{entry.week_streak ? `📅 ${entry.week_streak}w` : ''}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default GenericSimulatorDashboard;
