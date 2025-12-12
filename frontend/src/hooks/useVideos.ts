import { useEffect, useState } from 'react';
import { mcpFetch } from '../mcpClient';

export interface Video {
  id: number;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  video_type?: string; // entrevista, pitch, aula, tutorial, outro
  duration?: number;
  views_count?: number;
  created_at?: string;
}

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true);
        setError(null);
        const { data } = await mcpFetch('/api/content/videos/');
        if (Array.isArray(data)) {
          setVideos(data);
        } else if (data && Array.isArray(data.results)) {
          setVideos(data.results);
        } else {
          setVideos([]);
        }
      } catch (err: any) {
        setError('Erro ao carregar vídeos');
        setVideos([]);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  return { videos, loading, error };
}
