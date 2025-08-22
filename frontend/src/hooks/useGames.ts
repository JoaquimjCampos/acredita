
import { useEffect, useState } from 'react';

export interface Game {
  id: number;
  title: string;
  description: string;
  image?: string;
  type: string;
  featured?: boolean;
}

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    fetch('/api/games/', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar jogos');
        return res.json();
      })
      .then(data => {
        setGames(data.results || data);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        setGames([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { games, loading, error };
}
