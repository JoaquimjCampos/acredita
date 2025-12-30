import React, { useState, useEffect } from 'react';
import { Card, LoadingSpinner } from '../../components/common';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react';

interface AnalyticsData {
  members: {
    total: number;
    active: number;
    inactive: number;
  };
  contributions: {
    total_count: number;
    confirmed: number;
    pending: number;
    late: number;
    total_amount: number;
    average_amount: number;
  };
  payouts: {
    total_count: number;
    completed: number;
    total_disbursed: number;
    average_disbursed: number;
  };
  rounds: Array<{
    round: number;
    participation_rate: number;
    contributions_count: number;
    total_contributed: number;
  }>;
}

interface Props {
  data: AnalyticsData | null;
  loading: boolean;
}

const KixikilaAnalyticsDashboard: React.FC<Props> = ({ data, loading }) => {
  const [chartData, setChartData] = useState<any>([]);
  const [memberDistribution, setMemberDistribution] = useState<any>([]);

  useEffect(() => {
    if (data) {
      // Prepare rounds chart
      const roundsChartData = data.rounds.map(r => ({
        round: `Round ${r.round}`,
        participation: Math.round(r.participation_rate * 10) / 10,
        contributions: r.contributions_count,
        amount: Math.round(r.total_contributed * 100) / 100,
      }));
      setChartData(roundsChartData);

      // Prepare member distribution
      setMemberDistribution([
        { name: 'Ativos', value: data.members.active, color: '#10b981' },
        { name: 'Suspensos', value: data.members.inactive, color: '#ef4444' },
      ]);
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

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-violet-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total de Membros</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.members.total}</p>
              <p className="text-xs text-gray-500 mt-2">
                {data.members.active} ativos • {data.members.inactive} suspensos
              </p>
            </div>
            <Users className="h-8 w-8 text-violet-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total de Contribuições</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.contributions.total_count}</p>
              <p className="text-xs text-gray-500 mt-2">
                {data.contributions.confirmed} confirmadas • {data.contributions.pending} pendentes
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Valor Total de Contribuições</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${Math.round(data.contributions.total_amount * 100) / 100}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Média: ${Math.round(data.contributions.average_amount * 100) / 100}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Valor Total Desembolsado</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${Math.round(data.payouts.total_disbursed * 100) / 100}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {data.payouts.completed} pagamentos completos
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Participation Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Taxa de Participação por Round</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="round" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: any) => value.toFixed(1) + '%'}
                />
                <Line
                  type="monotone"
                  dataKey="participation"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={{ fill: '#7c3aed', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Sem dados de participação</p>
          )}
        </Card>

        {/* Member Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Distribuição de Membros</h3>
          {memberDistribution.length > 0 && (memberDistribution[0].value > 0 || memberDistribution[1].value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={memberDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }: any) => `${name}: ${value} (${(percent ? percent * 100 : 0).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {memberDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => value.toString()} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Sem dados de distribuição</p>
          )}
        </Card>

        {/* Contributions Status */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Status de Contribuições</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Confirmadas</span>
              <span className="text-lg font-bold text-green-600">{data.contributions.confirmed}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Pendentes</span>
              <span className="text-lg font-bold text-yellow-600">{data.contributions.pending}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Atrasadas</span>
              <span className="text-lg font-bold text-red-600">{data.contributions.late}</span>
            </div>
          </div>
        </Card>

        {/* Contribution Amount Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Valor Contribuído por Round</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="round" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(value: any) => '$' + value.toFixed(2)}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">Sem dados de contribuição</p>
          )}
        </Card>
      </div>

      {/* Rounds Summary Table */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Resumo por Round</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 font-medium text-gray-700">Round</th>
                <th className="text-right py-3 font-medium text-gray-700">Taxa de Participação</th>
                <th className="text-right py-3 font-medium text-gray-700">Contribuições</th>
                <th className="text-right py-3 font-medium text-gray-700">Valor Total</th>
              </tr>
            </thead>
            <tbody>
              {data.rounds.map((round, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 font-medium text-gray-900">Round {round.round}</td>
                  <td className="py-3 text-right">
                    <span className={`text-sm font-medium ${round.participation_rate >= 80 ? 'text-green-600' : round.participation_rate >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {Math.round(round.participation_rate * 10) / 10}%
                    </span>
                  </td>
                  <td className="py-3 text-right text-gray-600">{round.contributions_count}</td>
                  <td className="py-3 text-right font-medium text-gray-900">
                    ${Math.round(round.total_contributed * 100) / 100}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default KixikilaAnalyticsDashboard;
