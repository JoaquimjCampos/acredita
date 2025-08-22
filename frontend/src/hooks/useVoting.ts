import { useEffect, useState } from 'react';
import { Participant } from '../types/Participant';
import { mcpFetch } from '../mcpClient';

export function useVoting(context?: { user?: string; session?: string }) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    mcpFetch('/api/participants/', {}, context || {})
      .then(({ data }) => {
        setParticipants(data.results || data);
        setError(null);
      })
      .catch(err => {
        setError(err.message || 'Erro ao carregar participantes.');
        setParticipants([]);
      })
      .finally(() => setLoading(false));
  }, [context]);

  return { participants, loading, error };
}
