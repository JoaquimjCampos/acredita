import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { useSimuladores } from '../hooks/useSimuladores';
import { Brain, Zap } from 'lucide-react';

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

  return (
    <Layout>
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Simuladores Interactivos</h1>
              <p className="text-cyan-100 mt-1">Aprimore as suas competências empreendedoras e participe na experiência de Reality TV.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          {error ? (
            <div className="text-center text-red-600 font-semibold py-12">{error}</div>
          ) : simuladores.length === 0 ? (
            <Card className="text-center py-12">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum simulador disponível</h3>
              <p className="text-gray-600">Volte mais tarde para novas experiências!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {simuladores.map((simulador: Simulador) => (
                <Card key={simulador.id} className="p-6 border-l-4 border-cyan-500 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{simulador.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{simulador.type}</p>
                    </div>
                    <Brain className="h-6 w-6 text-cyan-600 flex-shrink-0" />
                  </div>
                  <p className="text-gray-700 mb-6">{simulador.description}</p>
                  <div className="flex items-center gap-2 mb-4 text-cyan-600 font-semibold text-sm">
                    <Zap className="h-4 w-4" />
                    +100 XP
                  </div>
                  <a
                    href={`/jogos/simuladores/${simulador.id}`}
                    className="w-full inline-block text-center bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Aceder ao Simulador
                  </a>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SimuladoresPage;
