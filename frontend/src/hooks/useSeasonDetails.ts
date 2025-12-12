import { useState, useEffect } from 'react';
import { Season } from '../types/Season';
import { apiService } from '../services/api.original';

export function useSeasonDetails(id?: string) {
  const [season, setSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiService.getSeasons()
      .then((res: any) => {
        // Response from apiService is the axios response.data, which could be:
        // 1. Direct array: [...]
        // 2. Paginated: {count, next, previous, results: [...]}
        // 3. Wrapped: {data: [...]}
        let seasons: any[] = [];
        
        if (Array.isArray(res.data)) {
          seasons = res.data;
        } else if (res.data?.results && Array.isArray(res.data.results)) {
          seasons = res.data.results;
        } else if (Array.isArray(res)) {
          seasons = res;
        } else if (res?.results && Array.isArray(res.results)) {
          seasons = res.results;
        } else {
          setError('Formato de resposta inválido');
          setLoading(false);
          return;
        }
        
        const found = seasons.find((s: any) => String(s.id) === String(id));
        setSeason(found || null);
      })
      .catch((err: any) => setError(err.message || 'Erro ao carregar temporada'))
      .finally(() => setLoading(false));
  }, [id]);

  return { season, loading, error };
}
