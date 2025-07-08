import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Participant, Season, Episode } from '../types';
import toast from 'react-hot-toast';

// Hook para carregar participantes
export function useParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadParticipants = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getParticipants();
      
      if (response.sucesso) {
        setParticipants(response.dados);
      } else {
        setError(response.mensagem || 'Erro ao carregar participantes');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar participantes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadParticipants();
  }, []);

  return {
    participants,
    isLoading,
    error,
    refetch: loadParticipants,
  };
}

// Hook para carregar leaderboard
export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getLeaderboard();
      
      if (response.sucesso) {
        setLeaderboard(response.dados);
      } else {
        setError(response.mensagem || 'Erro ao carregar classificação');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar classificação');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  return {
    leaderboard,
    isLoading,
    error,
    refetch: loadLeaderboard,
  };
}

// Hook para carregar temporadas
export function useSeasons() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSeasons = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [seasonsResponse, currentSeasonResponse] = await Promise.all([
        apiService.getSeasons(),
        apiService.getCurrentSeason(),
      ]);
      
      if (seasonsResponse.sucesso) {
        setSeasons(seasonsResponse.dados);
      }
      
      if (currentSeasonResponse.sucesso) {
        setCurrentSeason(currentSeasonResponse.dados);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar temporadas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSeasons();
  }, []);

  return {
    seasons,
    currentSeason,
    isLoading,
    error,
    refetch: loadSeasons,
  };
}

// Hook para carregar episódios de uma temporada
export function useSeasonEpisodes(seasonId: number | null) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEpisodes = async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getSeasonEpisodes(id);
      
      if (response.sucesso) {
        setEpisodes(response.dados);
      } else {
        setError(response.mensagem || 'Erro ao carregar episódios');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar episódios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (seasonId) {
      loadEpisodes(seasonId);
    }
  }, [seasonId]);

  return {
    episodes,
    isLoading,
    error,
    refetch: seasonId ? () => loadEpisodes(seasonId) : () => {},
  };
}

// Hook para votação
export function useVoting() {
  const [isVoting, setIsVoting] = useState(false);

  const vote = async (participantId: number, episodeId?: number, comment?: string) => {
    try {
      setIsVoting(true);
      const response = await apiService.vote({
        participante: participantId,
        episodio: episodeId,
        comentario: comment,
      });
      
      if (response.sucesso) {
        toast.success(response.mensagem || 'Voto registado com sucesso!');
        return true;
      } else {
        toast.error(response.mensagem || 'Erro ao registar voto');
        return false;
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao registar voto');
      return false;
    } finally {
      setIsVoting(false);
    }
  };

  return {
    vote,
    isVoting,
  };
}

// Hook para detectar dispositivo móvel
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

// Hook para scroll infinito
export function useInfiniteScroll(callback: () => void, hasMore: boolean = true) {
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      
      if (scrollTop + clientHeight >= scrollHeight - 5 && hasMore) {
        callback();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback, hasMore]);
}

// Hook para debounce
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook para controlo de estado local
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao ler localStorage para key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Erro ao escrever no localStorage para key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
