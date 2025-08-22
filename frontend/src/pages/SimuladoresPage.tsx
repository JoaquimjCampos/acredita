import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { useSimuladores } from '../hooks/useSimuladores';
import { Brain } from 'lucide-react';

// Adiciona interface manualmente para garantir tipagem correta
interface Simulador {
  id: string;
  title: string;
  description: string;
  type: string;
}

const SimuladoresPage: React.FC = () => {
  const { simuladores, loading, error } = useSimuladores();

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner text="Carregando simuladores..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Brain className="h-8 w-8 text-acredita-primary animate-pulse" aria-hidden="true" />
            Simuladores
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {simuladores.map((simulador: Simulador) => (
              <Card
                key={simulador.id}
                title={simulador.title}
                subtitle={simulador.type}
                className="flex flex-col h-full transition-transform duration-200 hover:scale-105 hover:shadow-lg focus-within:scale-105 focus-within:shadow-lg border-2 border-transparent hover:border-acredita-primary"
              >
                <div className="flex flex-col items-center outline-none" tabIndex={0} aria-label={`Simulador: ${simulador.title}`}>
                  <Brain className="h-8 w-8 text-acredita-primary mb-2 animate-pulse" aria-hidden="true" />
                  <p className="mb-4 text-gray-700 flex-1 text-center">{simulador.description}</p>
                  <span className="inline-block mt-2 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold animate-fade-in">+100 XP</span>
                </div>
                <button
                  className="w-full mt-auto bg-acredita-primary text-white hover:bg-acredita-secondary transition-colors duration-200 focus:ring-2 focus:ring-acredita-primary py-2 rounded"
                  onClick={() => window.location.href = `/simuladores/${simulador.id}`}
                  aria-label={`Aceder ao simulador ${simulador.title}`}
                >
                  Aceder
                </button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SimuladoresPage;
