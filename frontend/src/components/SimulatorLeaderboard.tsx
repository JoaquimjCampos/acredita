import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, LoadingSpinner } from './common';
import { Bar } from 'react-chartjs-2';
import { mcpFetch } from '../mcpClient';

interface LeaderboardEntry {
  user: { id: string; nome: string; foto_perfil?: string };
  score: number;
  finished_at: string;
  streak?: number;
  week_streak?: number;
  scenario_streaks?: { [scenarioId: string]: number };
}

const PAGE_SIZE = 10;
const SimulatorLeaderboard: React.FC<{ simulatorId: string }> = ({ simulatorId }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'score'|'time'|'streak'|'week_streak'>('score');
  const [scenarioSort, setScenarioSort] = useState<string>('');
  const [filter, setFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const auth = useAuth();

  const [scenarioMap, setScenarioMap] = useState<{ [id: string]: string }>({});
  const [scenarioChart, setScenarioChart] = useState<any[]>([]);
  const [completionRate, setCompletionRate] = useState<number>(0);
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await mcpFetch(`/api/games/simulator/${simulatorId}/analytics/`);
  setEntries(data.leaderboard || []);
  setScenarioMap(data.scenario_map || {});
  setScenarioChart(data.scenario_chart || []);
  setCompletionRate(data.completion_rate || 0);
      } catch (err) {
        setError('Erro ao carregar leaderboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [simulatorId]);

  if (loading) return <LoadingSpinner text="Carregando leaderboard..." />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!entries.length) return <div className="text-gray-500">Nenhum resultado ainda.</div>;

  // Sorting logic
  let sorted = [...entries];
  if (sortBy === 'score') sorted.sort((a, b) => b.score - a.score);
  if (sortBy === 'time') sorted.sort((a, b) => new Date(a.finished_at).getTime() - new Date(b.finished_at).getTime());
  if (sortBy === 'streak') sorted.sort((a, b) => (b.streak || 0) - (a.streak || 0));
  if (sortBy === 'week_streak') sorted.sort((a, b) => (b.week_streak || 0) - (a.week_streak || 0));
  if (scenarioSort) sorted.sort((a, b) => ((b.scenario_streaks?.[scenarioSort] || 0) - (a.scenario_streaks?.[scenarioSort] || 0)));

  // Filter logic
  if (filter) sorted = sorted.filter(e => e.user.nome.toLowerCase().includes(filter.toLowerCase()));

  // Pagination logic
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Personal best highlight
  const myId = auth?.user?.id;

  return (
    <Card title="Leaderboard">
      <div className="mb-6">
        <div className="font-semibold mb-2">Taxa de conclusão: <span className="text-green-700">{(completionRate * 100).toFixed(1)}%</span></div>
        {scenarioChart.length > 0 && (
          <Bar
            data={{
              labels: scenarioChart.map(sc => sc.title),
              datasets: [
                {
                  label: 'Total de escolhas',
                  data: scenarioChart.map(sc => sc.total),
                  backgroundColor: '#3b82f6',
                },
              ],
            }}
            options={{ responsive: true, plugins: { legend: { display: false } } }}
            height={180}
          />
        )}
      </div>
      <div className="mb-4 flex gap-2 items-center flex-wrap">
        <label className="text-xs">Ordenar por:</label>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="border rounded px-2 py-1">
          <option value="score">Pontuação</option>
          <option value="time">Tempo</option>
          <option value="streak">Sequência (dias)</option>
          <option value="week_streak">Sequência (semanas)</option>
        </select>
        <input type="text" placeholder="Filtrar por nome" value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="border rounded px-2 py-1 ml-2" />
        {/* Scenario streaks dropdown */}
        {sorted.length > 0 && (
          <select value={scenarioSort} onChange={e => setScenarioSort(e.target.value)} className="border rounded px-2 py-1 ml-2">
            <option value="">Sequência por cenário</option>
            {Object.keys(sorted[0].scenario_streaks || {}).map(scId => (
              <option key={scId} value={scId}>{scenarioMap[scId] ? scenarioMap[scId] : `Cenário ${scId}`}</option>
            ))}
          </select>
        )}
      </div>
      <ul className="divide-y divide-gray-200">
        {paged.map((entry, idx) => (
          <li key={idx} className={`flex items-center py-2 ${entry.user.id === myId ? 'bg-yellow-50 font-bold' : ''}`}>
            {entry.user.foto_perfil ? (
              <img src={entry.user.foto_perfil} alt="avatar" className="h-8 w-8 rounded-full mr-2 border" />
            ) : (
              <span className="inline-block h-8 w-8 rounded-full bg-gray-300 mr-2" />
            )}
            <span className="font-semibold mr-2">{entry.user.nome}</span>
            <span className="ml-auto text-blue-700 font-bold">{entry.score} pts</span>
            <span className="ml-4 text-xs text-gray-400">{new Date(entry.finished_at).toLocaleString()}</span>
            {entry.streak && <span className="ml-4 text-xs text-green-600">🔥 {entry.streak}d</span>}
            {entry.week_streak && <span className="ml-4 text-xs text-purple-600">📅 {entry.week_streak}w</span>}
            {scenarioSort && entry.scenario_streaks?.[scenarioSort] && (
              <span className="ml-4 text-xs text-blue-600">🎯 {scenarioMap[scenarioSort] || `Cenário ${scenarioSort}`}: {entry.scenario_streaks[scenarioSort]}x</span>
            )}
            {entry.user.id === myId && <span className="ml-2 text-yellow-600">(Você)</span>}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-center gap-2">
        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-2 py-1 border rounded bg-gray-100">Anterior</button>
        <span className="text-xs">Página {page} de {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-2 py-1 border rounded bg-gray-100">Próxima</button>
      </div>
    </Card>
  );
};

export default SimulatorLeaderboard;
