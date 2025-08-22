import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button } from '../components/common';

const SimulatorOnboarding: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <Card title="Bem-vindo aos Simuladores">
          <h2 className="text-xl font-bold mb-4">Como usar os simuladores?</h2>
          <ol className="list-decimal ml-6 mb-6 text-gray-700">
            <li>Escolha o simulador desejado na lista de simuladores.</li>
            <li>Clique para acessar o simulador e preencha os parâmetros de entrada.</li>
            <li>Execute a simulação para ver os resultados e análises.</li>
            <li>Consulte o dashboard para visualizar estatísticas, rankings e gráficos.</li>
          </ol>
          <div className="mb-4">
            <Button className="w-full bg-blue-600 text-white" onClick={() => navigate('/jogos/simulador')}>Ver lista de simuladores</Button>
          </div>
          <div className="mb-2">
            <Button className="w-full bg-green-600 text-white" onClick={() => navigate('/jogos/simuladores/1/generic')}>Exemplo: Simulador Genérico</Button>
          </div>
          <div className="mb-2">
            <Button className="w-full bg-purple-600 text-white" onClick={() => navigate('/jogos/simuladores/1/dashboard')}>Ver Dashboard de Analytics</Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default SimulatorOnboarding;
