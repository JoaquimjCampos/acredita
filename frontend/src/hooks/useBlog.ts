import { useEffect, useState } from 'react';
import { BlogPost } from '../types/BlogPost';

export function useBlog() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/blog/')
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao buscar posts do blog');
        return res.json();
      })
      .then((data) => {
        setBlogPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { blogPosts, loading, error };
}
