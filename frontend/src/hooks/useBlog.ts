import { useEffect, useState } from 'react';
import { BlogPost } from '../types/BlogPost';
import { mcpFetch } from '../mcpClient';

export function useBlog() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlog() {
      try {
        setLoading(true);
        setError(null);
        const { data } = await mcpFetch('/api/blog/');
        if (Array.isArray(data)) {
          setBlogPosts(data);
        } else if (data && Array.isArray(data.results)) {
          setBlogPosts(data.results);
        } else {
          setBlogPosts([]);
        }
      } catch (err: any) {
        setError('Erro ao buscar posts do blog');
      } finally {
        setLoading(false);
      }
    }
    fetchBlog();
  }, []);

  return { blogPosts, loading, error };
}
