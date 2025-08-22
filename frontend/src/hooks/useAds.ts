
import { useEffect, useState } from 'react';
import { Ad } from '../types/Ad';

export function useAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/ads/active/')
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar publicidades');
        return res.json();
      })
      .then(data => {
        setAds(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        setAds([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { ads, loading, error };
}
