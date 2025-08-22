import { useEffect, useState } from 'react';
import { mcpFetch } from '../mcpClient';
import { Season } from '../types/Season';

export function useSeasons(context?: { user?: string; session?: string }) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mcpFetch('/api/seasons/', {}, context || {})
      .then(({ data }) => setSeasons(data.results || data))
      .catch(() => setError('Erro ao carregar temporadas.'))
      .finally(() => setLoading(false));
  }, [context]);

  return { seasons, loading, error };
}
