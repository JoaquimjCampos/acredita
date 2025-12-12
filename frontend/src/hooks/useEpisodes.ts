import { useState, useEffect } from 'react';
import { Episode } from '../types';
import { mcpFetch } from '../mcpClient';

export function useEpisodes(seasonId?: string) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seasonId) return;
    
    async function fetchEpisodes() {
      try {
        setLoading(true);
        setError(null);
        const { data } = await mcpFetch(`/api/seasons/episodes/?season=${seasonId}`);
        if (Array.isArray(data)) {
          setEpisodes(data);
        } else if (data && Array.isArray(data.results)) {
          setEpisodes(data.results);
        } else {
          setEpisodes([]);
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar episódios');
        setEpisodes([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEpisodes();
  }, [seasonId]);

  return { episodes, loading, error };
}
