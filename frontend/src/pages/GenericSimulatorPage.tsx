import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { mcpFetch } from '../mcpClient';

const GenericSimulatorPage: React.FC<{ simulatorId: string }> = ({ simulatorId }) => {
  const [simulator, setSimulator] = useState<any>(null);
  const [inputData, setInputData] = useState<any>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    mcpFetch(`/api/games/simulator/${simulatorId}/`).then(({ data }) => setSimulator(data));
  }, [simulatorId]);

  const handleRun = async () => {
    setLoading(true);
    const { data } = await mcpFetch(`/api/games/simulator/run-generic/${simulatorId}/`, {
      method: 'POST',
      body: JSON.stringify({ input_data: inputData }),
      headers: { 'Content-Type': 'application/json' },
    });
    setResult(data.result);
    setLoading(false);
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
              <div key={key} className="mb-2">
                <label className="mr-2">{key}:</label>
                <input
                  className="border rounded px-2 py-1"
                  type="text"
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
