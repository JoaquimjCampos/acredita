import { useEffect, useState } from 'react';
import { mcpFetch } from '../mcpClient';
import { Season } from '../types/Season';

export function useSeasons(context?: { user?: string; session?: string }) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mcpFetch('/api/seasons/', {}, context || {})
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setSeasons(data);
        } else if (data && Array.isArray((data as any).results)) {
          setSeasons((data as any).results);
        } else {
          setSeasons([]);
        }
      })
      .catch(() => setError('Erro ao carregar temporadas.'))
      .finally(() => setLoading(false));
  }, [context]);

  return { seasons, loading, error };
}
