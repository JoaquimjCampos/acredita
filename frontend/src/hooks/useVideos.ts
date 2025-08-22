import { useEffect, useState } from 'react';

export interface Video {
  id: number;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  type?: string; // entrevista, pitch, aula, outro
}

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/videos/')
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar vídeos');
        return res.json();
      })
      .then(data => {
        setVideos(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        setVideos([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { videos, loading, error };
}
