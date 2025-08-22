import { useState, useEffect } from 'react';

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
        const response = await fetch('/api/simuladores');
        if (!response.ok) throw new Error('Erro ao carregar simuladores');
        const data = await response.json();
        setSimuladores(data);
      } catch (err: any) {
        setError(err.message || 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }
    fetchSimuladores();
  }, []);

  return { simuladores, loading, error };
}
