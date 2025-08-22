import { useEffect, useState } from 'react';
import { Simulation } from '../types/Simulation';
import { mcpFetch } from '../mcpClient';

export function useSimulationDetail(simId?: string) {
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!simId) return;
    setLoading(true);
    setError(null);
    mcpFetch('/api/games/simulator/')
      .then(({ data }) => {
        const found = (data.results || data).find((s: Simulation) => String(s.id) === String(simId));
        setSimulation(found || null);
      })
      .catch(() => {
        setError('Erro ao carregar simulador.');
        setSimulation(null);
      })
      .finally(() => setLoading(false));
  }, [simId]);

  return { simulation, loading, error };
}
