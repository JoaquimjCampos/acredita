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
        // Normalize response: accept array or paginated shape
        if (Array.isArray(data)) {
          setParticipants(data);
        } else if (data && Array.isArray((data as any).results)) {
          setParticipants((data as any).results);
        } else {
          setParticipants([]);
        }
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
