import { useEffect, useState } from 'react';
import { fetchMeDashboard, MeDashboardResponse } from '../services/core';

export function useCoreDashboard(enabled: boolean) {
  const [data, setData] = useState<MeDashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function run() {
      if (!enabled) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetchMeDashboard();
        if (active) setData(res);
      } catch (e: any) {
        if (active) setError('Falha a carregar resumo do utilizador');
      } finally {
        if (active) setLoading(false);
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [enabled]);

  return { data, loading, error };
}
