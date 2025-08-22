import { useEffect, useState } from 'react';

export interface Sponsor {
  id: number;
  name: string;
  logo: string;
  url?: string;
  type?: string; // e.g., 'patrocinador', 'parceiro'
}

export function useSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/sponsors/')
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar patrocinadores');
        return res.json();
      })
      .then(data => {
        setSponsors(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        setSponsors([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { sponsors, loading, error };
}
