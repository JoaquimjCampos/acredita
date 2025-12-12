import { useState, useEffect } from 'react';
import { mcpFetch } from '../mcpClient';

export interface Simulador {
  id: string;
  title: string;
  description: string;
  type: string;
}

export function useSimuladores() {
  const [simuladores, setSimuladores] = useState<Simulador[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSimuladores() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await mcpFetch('/api/games/simulator/simulators/');
        setSimuladores(Array.isArray(data) ? data : data?.results || []);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar simuladores');
        setSimuladores([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSimuladores();
  }, []);

  return { simuladores, loading, error };
}
