import { useEffect, useState } from 'react';
import { mcpFetch } from '../mcpClient';
import { ContentItem } from '../types/Content';

export function useContent() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        setError(null);
        const { data } = await mcpFetch('/api/content/');
        setContent(data.results || data);
      } catch (err: any) {
        setError('Erro ao carregar conteúdos.');
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, []);

  return { content, loading, error };
}
