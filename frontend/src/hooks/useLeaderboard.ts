import { useEffect, useState } from 'react';
import { mcpFetch } from '../mcpClient';

export function useLeaderboard(context?: { user?: string; session?: string }) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mcpFetch('/api/participants/dashboard/', {}, context || {})
      .then(({ data }) => {
        const lb = data.leaderboard;
        if (Array.isArray(lb)) {
          setLeaderboard(lb);
        } else {
          setLeaderboard([]);
        }
      })
      .catch(() => setError('Erro ao carregar ranking.'))
      .finally(() => setLoading(false));
  }, [context]);

  return { leaderboard, loading, error };
}
