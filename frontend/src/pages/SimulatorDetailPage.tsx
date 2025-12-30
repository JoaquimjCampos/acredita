import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner, ErrorMessage } from '../components/common';
import { useSimulationDetail } from '../hooks/useSimulationDetail';
import { Simulation } from '../types/Simulation';
import { gamesService } from '../services/gamesService';


const SimulatorDetailPage: React.FC = () => {
  const [initialBalance, setInitialBalance] = useState<number>(0);
  const [revenue, setRevenue] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [result, setResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);

  const { id } = useParams<{ id: string }>();
  const { simulation, loading, error } = useSimulationDetail(id);

  // Tipagem explícita
  const sim: Simulation | null = simulation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimLoading(true);
    setSimError(null);
    setResult(null);
    try {
      const inputData = {
        initial_balance: initialBalance,
        revenue,
        cost,
      };
      if (!sim) throw new Error('Simulador não encontrado.');
      const response = await gamesService.runSimulator(sim.id, inputData);
      setResult(response.result);
    } catch (err: any) {
      setSimError(err.message || 'Erro ao executar simulação');
    } finally {
      setSimLoading(false);
    }
  };

  if (loading) {
    return <Layout><LoadingSpinner text="Carregando simulador..." /></Layout>;
  }
  if (error || !simulation) {
    return <Layout><p className="text-red-500">{error || 'Simulador não encontrado.'}</p></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <Card title={sim ? sim.title : ''}>
          <p className="mb-4 text-gray-700">{sim ? sim.description : ''}</p>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Saldo Inicial</label>
              <input
                type="number"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                value={initialBalance}
                onChange={e => setInitialBalance(Number(e.target.value))}
                min={0}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Receita</label>
              <input
                type="number"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                value={revenue}
                onChange={e => setRevenue(Number(e.target.value))}
                min={0}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Custo</label>
              <input
                type="number"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                value={cost}
                onChange={e => setCost(Number(e.target.value))}
                min={0}
                required
              />
            </div>
            <Button type="submit" variant="primary" disabled={simLoading}>
              {simLoading ? 'Simulando...' : 'Executar Simulação'}
            </Button>
          </form>
          {simError && <ErrorMessage message={simError} />}
          {result && (
            <div className="mt-6 p-4 bg-gray-100 rounded">
              <h4 className="font-semibold mb-2">Resultado da Simulação</h4>
              <ul className="space-y-1">
                {result.profit !== undefined && (
                  <li><strong>Lucro:</strong> {result.profit}</li>
                )}
                {result.final_balance !== undefined && (
                  <li><strong>Saldo Final:</strong> {result.final_balance}</li>
                )}
                {result.kpi_met !== undefined && (
                  <li><strong>KPI Atingido:</strong> {result.kpi_met ? 'Sim' : 'Não'}</li>
                )}
                {/* Exibir outros campos se existirem */}
                {Object.keys(result).filter(k => !['profit','final_balance','kpi_met'].includes(k)).map(k => (
                  <li key={k}><strong>{k}:</strong> {String(result[k])}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default SimulatorDetailPage;
