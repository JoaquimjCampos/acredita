import { useEffect, useState } from 'react';
import { mcpFetch } from '../mcpClient';

export interface Sponsor {
  id: number;
  name: string;
  logo: string;
  url?: string;
  type?: string; // e.g., 'sponsor', 'partner', 'supporter'
  description?: string;
}

export function useSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSponsors() {
      try {
        setLoading(true);
        setError(null);
        const { data } = await mcpFetch('/api/sponsors/');
        if (Array.isArray(data)) {
          setSponsors(data);
        } else if (data && Array.isArray(data.results)) {
          setSponsors(data.results);
        } else {
          setSponsors([]);
        }
      } catch (err: any) {
        setError('Erro ao carregar patrocinadores');
        setSponsors([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSponsors();
  }, []);

  return { sponsors, loading, error };
}
