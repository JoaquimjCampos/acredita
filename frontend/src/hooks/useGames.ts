
import { useEffect, useState } from 'react';
import { mcpFetch } from '../mcpClient';

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
    async function fetchGames() {
      try {
        setLoading(true);
        setError(null);
        const { data } = await mcpFetch('/api/games/games/');
        if (Array.isArray(data)) {
          setGames(data);
        } else if (data && Array.isArray(data.results)) {
          setGames(data.results);
        } else {
          setGames([]);
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar jogos');
        setGames([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchGames();
  }, []);

  return { games, loading, error };
}
