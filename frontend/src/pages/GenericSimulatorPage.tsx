import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { mcpFetch } from '../mcpClient';
import toast from 'react-hot-toast';
import { Simulator } from '../types/games';

const GenericSimulatorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [simulator, setSimulator] = useState<Simulator | null>(null);
  const [inputData, setInputData] = useState<any>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typeHints = useMemo(() => {
    const st = (simulator?.scenario_type || '').toLowerCase();
    if (st.includes('finance')) return {
      initial_balance: 'Saldo inicial (ex: 10000)',
      interest_rate: 'Taxa de juros (ex: 0.05 para 5%)',
      periods: 'Períodos (ex: 12 meses)'
    };
    if (st.includes('neg') || st.includes('business')) return {
      revenue: 'Receita prevista',
      variable_costs: 'Custos variáveis',
      fixed_costs: 'Custos fixos',
      initial_balance: 'Saldo inicial'
    };
    if (st.includes('invest')) return {
      amount: 'Montante inicial',
      growth_rate: 'Taxa de crescimento (ex: 0.08)',
      volatility: 'Volatilidade (ex: 0.1)',
      periods: 'Períodos (ex: 12)'
    };
    return {
      initial_balance: 'Saldo inicial',
      interest_rate: 'Taxa (ex: 0.05)'
    };
  }, [simulator]);
  useEffect(() => {
    if (!id) return;
    mcpFetch(`/api/games/simulator/simulators/${id}/`).then(({ data }) => {
      setSimulator(data);
      setInputData(data?.parameters || {});
    });
  }, [id]);

  const toNumber = (v: any) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
      const s = v.trim().replace(',', '.');
      const n = parseFloat(s);
      return isNaN(n) ? v : n;
    }
    return v;
  };

  const handleRun = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const prepared: any = {};
      Object.keys(inputData || {}).forEach((k) => {
        prepared[k] = toNumber(inputData[k]);
      });
      const { data } = await mcpFetch(`/api/games/simulator/simulators/${id}/run/`, {
        method: 'POST',
        body: JSON.stringify({ input_data: prepared }),
        headers: { 'Content-Type': 'application/json' },
      });
      setResult(data.result);
    } catch (e: any) {
      const msg = e?.message || 'Erro ao executar simulação';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!simulator) return <Layout><LoadingSpinner text="Carregando simulador..." /></Layout>;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <Card title={simulator.title}>
          <p className="mb-4 text-gray-700">{simulator.description}</p>
          <div className="mb-4">
            <label className="block font-semibold mb-2">Parâmetros de entrada:</label>
            {Object.keys(simulator.parameters || {}).map((key) => (
              <div key={key} className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <label className="font-medium">{key}:</label>
                </div>
                <input
                  className="border rounded px-3 py-2 w-full"
                  type={typeof simulator.parameters[key] === 'number' ? 'number' : 'text'}
                  value={inputData[key] ?? ''}
                  onChange={e => setInputData({ ...inputData, [key]: e.target.value })}
                  placeholder={String(simulator.parameters[key])}
                />
              </div>
            ))}
          </div>
          <Button onClick={handleRun} className="w-full bg-blue-600 text-white" disabled={loading}>
            {loading ? 'Simulando...' : 'Executar Simulação'}
          </Button>
          {result && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Resultado</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default GenericSimulatorPage;
