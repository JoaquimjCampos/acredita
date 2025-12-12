
import { useEffect, useState } from 'react';
import { Ad } from '../types/Ad';
import { mcpFetch } from '../mcpClient';

export function useAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAds() {
      try {
        setLoading(true);
        setError(null);
        // Tenta primeiro /api/ads/active/
        try {
          const { data } = await mcpFetch('/api/ads/active/');
          if (Array.isArray(data)) {
            setAds(data);
          } else if (data && Array.isArray(data.results)) {
            setAds(data.results);
          } else {
            setAds([]);
          }
        } catch (e) {
          // Fallback para /api/ads/ se active não existir
          const { data } = await mcpFetch('/api/ads/');
          if (Array.isArray(data)) {
            setAds(data.filter((ad: Ad) => ad.active !== false));
          } else if (data && Array.isArray(data.results)) {
            setAds(data.results.filter((ad: Ad) => ad.active !== false));
          } else {
            setAds([]);
          }
        }
      } catch (err: any) {
        setError('Erro ao carregar publicidades');
        setAds([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAds();
  }, []);

  return { ads, loading, error };
}
