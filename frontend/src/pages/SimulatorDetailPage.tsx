import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { useSimulationDetail } from '../hooks/useSimulationDetail';
import { Simulation } from '../types/Simulation';


const SimulatorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { simulation, loading, error } = useSimulationDetail(id);

  if (loading) {
    return <Layout><LoadingSpinner text="Carregando simulador..." /></Layout>;
  }
  if (error || !simulation) {
    return <Layout><p className="text-red-500">{error || 'Simulador não encontrado.'}</p></Layout>;
  }

  // Tipagem explícita
  const sim: Simulation | null = simulation;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-8">
        <Card title={sim.title}>
          <p className="mb-4 text-gray-700">{sim.description}</p>
          {/* Aqui pode ir a lógica do simulador interativo */}
          <Button variant="primary" onClick={() => alert('Simulação iniciada!')}>Iniciar Simulação</Button>
        </Card>
      </div>
    </Layout>
  );
};

export default SimulatorDetailPage;
