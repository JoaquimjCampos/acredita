import React, { useEffect, useState } from 'react';
import { Card, LoadingSpinner } from '../components/common';
import { apiService } from '../services/api';
import seasonConfig from '../config/season.json';

const GamesSection: React.FC = () => {
  const [simResult, setSimResult] = useState<{id: number, result: any} | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);

  const handleRunSimulation = async (simulatorId: number) => {
    setSimLoading(true);
    setSimError(null);
    setSimResult(null);
    try {
      // Example inputData, replace with real form if needed
      const inputData = { initial_balance: 1000, interest_rate: 0.05 };
      const data = await apiService.runSimulator(simulatorId, inputData);
      setSimResult({ id: simulatorId, result: data.result });
    } catch (err: any) {
      setSimError(err.message);
    } finally {
      setSimLoading(false);
    }
  };
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [order, setOrder] = useState<'title'|'type'>('title');
  const seasonNumber = seasonConfig.season_number;

  useEffect(() => {
    setLoading(true);
    apiService.getGames()
      .then((res: any) => {
        setGames(res.results || res.data?.results || res.data || []);
        setError(null);
      })
      .catch((err: any) => {
        setError('Erro ao carregar jogos: ' + (err.message || ''));
        setGames([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter games by type and search
  let filteredGames = games.filter(game =>
    (type === 'all' || game.type === type) &&
    game.title.toLowerCase().includes(search.toLowerCase())
  );
  filteredGames = [...filteredGames].sort((a, b) => {
    if (order === 'title') return a.title.localeCompare(b.title);
    if (order === 'type') return (a.type || '').localeCompare(b.type || '');
    return 0;
  });

  // Simulators-only view (example usage)
  const simulators = games.filter(game => game.type === 'simulador');

  if (loading) {
  return <LoadingSpinner size="lg" text={`A carregar jogos...`} />;
  }

  if (error) {
    return <div className="text-red-600 font-semibold text-center" role="alert">{error}</div>;
  }

  if (!games.length) {
    return (
      <Card className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum jogo disponível</h3>
        <p className="text-gray-600 mb-6">Não há jogos no momento.</p>
      </Card>
    );
  }

  return (
    <section className="py-8 bg-gray-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Pesquisar jogo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-4 py-2 w-full md:w-1/4"
          />
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="border rounded px-4 py-2 w-full md:w-1/4"
          >
            <option value="all">Todos os tipos</option>
            <option value="quiz">Quiz</option>
            <option value="simulador">Simulador</option>
            <option value="associacao">Associação</option>
            <option value="outro">Outro</option>
          </select>
          <select
            value={order}
            onChange={e => setOrder(e.target.value as 'title'|'type')}
            className="border rounded px-4 py-2 w-full md:w-1/4"
          >
            <option value="title">Ordenar por Título</option>
            <option value="type">Ordenar por Tipo</option>
          </select>
        </div>
        {/* Carrossel visual para destaque */}
        {filteredGames.length > 0 ? (
          <div className="overflow-x-auto pb-4" aria-live="polite">
            <div className="flex gap-8 min-w-full" role="list">
              {filteredGames.map(game => (
                <Card key={game.id} className="flex flex-col min-w-[320px] max-w-xs shadow-lg hover:scale-105 transition-transform duration-300 border-2 border-transparent focus-within:border-acredita-primary">
                  {game.image && (
                    <img src={game.image} alt={`Imagem do jogo ${game.title}`} className="h-40 w-full object-cover rounded-t" />
                  )}
                  <div role="listitem" className="p-4 flex-1 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-extrabold text-gray-900">{game.title}</h3>
                      <span className="px-2 py-1 rounded bg-acredita-primary text-white text-xs font-bold ml-2">Temporada {seasonNumber}</span>
                    </div>
                    <p className="text-gray-700 mb-4 text-base">{game.description}</p>
                    <span className="text-xs text-acredita-primary font-semibold mb-2">Tipo: {game.type}</span>
                    <button
                      className="mt-4 w-full py-3 rounded-lg bg-acredita-primary text-white text-lg font-bold shadow-lg hover:bg-acredita-secondary focus:outline-none focus:ring-4 focus:ring-acredita-primary focus:ring-opacity-50 transition-all duration-200"
                      aria-label={`Jogar ${game.title}`}
                      tabIndex={0}
                      onClick={() => {
                        // Navegação para o jogo
                        if (game.type === 'quiz') {
                          window.location.href = `/quiz/${game.id}`;
                        } else if (game.type === 'simulador') {
                          window.location.href = `/simuladores`;
                        } else if (game.type === 'associacao') {
                          window.location.href = `/associacao`;
                        } else {
                          alert('Tipo de jogo não suportado: ' + game.type);
                        }
                      }}
                    >
                      Jogar
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum jogo encontrado</h3>
            <p className="text-gray-600 mb-6">Ajuste os filtros ou tente outra busca.</p>
          </Card>
        )}

        {/* Dedicated Simulators Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-acredita-primary mb-6">Simuladores</h2>
          {simLoading && <LoadingSpinner text="Executando simulação..." />}
          {simError && <div className="text-red-600 font-semibold mb-4">{simError}</div>}
          {simResult && (
            <Card className="mb-6 p-4 bg-green-50 border-green-200">
              <h4 className="text-lg font-bold text-acredita-secondary mb-2">Resultado da Simulação</h4>
              <pre className="text-sm text-gray-800 bg-gray-100 rounded p-2 overflow-x-auto">{JSON.stringify(simResult.result, null, 2)}</pre>
            </Card>
          )}
          {simulators.length > 0 ? (
            <div className="flex gap-8 min-w-full" role="list">
              {simulators.map(sim => (
                <Card key={sim.id} className="flex flex-col min-w-[320px] max-w-xs shadow-lg border-2 border-acredita-secondary focus-within:border-acredita-secondary">
                  {sim.image && (
                    <img src={sim.image} alt={`Imagem do simulador ${sim.title}`} className="h-40 w-full object-cover rounded-t" />
                  )}
                  <div role="listitem" className="p-4 flex-1 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-extrabold text-acredita-secondary">{sim.title}</h3>
                    </div>
                    <p className="text-gray-700 mb-2 text-base">{sim.description}</p>
                    {sim.instructions && (
                      <div className="mb-2 text-sm text-gray-500"><strong>Instruções:</strong> {sim.instructions}</div>
                    )}
                    {sim.assets && Array.isArray(sim.assets) && sim.assets.length > 0 && (
                      <div className="mb-2 text-sm text-gray-500">
                        <strong>Assets:</strong>
                        <ul className="list-disc ml-4">
                          {sim.assets.map((asset: any, idx: number) => (
                            <li key={idx}>{typeof asset === 'string' ? asset : JSON.stringify(asset)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex flex-col gap-2 mt-4">
                      <button
                        className="w-full py-2 rounded-lg bg-acredita-secondary text-white text-base font-bold shadow hover:bg-acredita-primary focus:outline-none focus:ring-4 focus:ring-acredita-secondary focus:ring-opacity-50 transition-all duration-200"
                        aria-label={`Abrir simulador ${sim.title}`}
                        tabIndex={0}
                        onClick={() => window.location.href = `/jogos/simuladores/${sim.id}`}
                      >
                        Abrir Simulador
                      </button>
                      <button
                        className="w-full py-2 rounded-lg bg-acredita-primary text-white text-base font-bold shadow hover:bg-acredita-secondary focus:outline-none focus:ring-4 focus:ring-acredita-primary focus:ring-opacity-50 transition-all duration-200"
                        aria-label={`Ver analytics do simulador ${sim.title}`}
                        tabIndex={0}
                        onClick={() => window.location.href = `/jogos/simuladores/${sim.id}/analytics`}
                      >
                        Ver Analytics
                      </button>
                      <button
                        className="w-full py-2 rounded-lg bg-gray-100 text-acredita-secondary font-bold border border-acredita-secondary shadow hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-acredita-secondary focus:ring-opacity-50 transition-all duration-200"
                        aria-label={`Executar simulação em ${sim.title}`}
                        tabIndex={0}
                        onClick={() => handleRunSimulation(sim.id)}
                        disabled={simLoading}
                      >
                        Executar Simulação
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum simulador disponível</h3>
              <p className="text-gray-600 mb-6">Nenhum simulador foi encontrado.</p>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default GamesSection;
