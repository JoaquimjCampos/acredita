
import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { useBlog } from '../hooks';
import { BlogPost } from '../types/BlogPost';

const BlogPage: React.FC = () => {
  const { blogPosts, loading, error } = useBlog();

  if (loading) return <Layout><LoadingSpinner text="Carregando posts do blog..." /></Layout>;
  if (error) return <Layout><ErrorMessage message={error} /></Layout>;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Blog</h1>
        {blogPosts.length === 0 ? (
          <Card>Nenhum post encontrado.</Card>
        ) : (
          blogPosts.map((post: BlogPost) => (
            <Card key={post.id} title={post.title} subtitle={post.author}>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
              {post.created_at && (
                <div className="text-xs text-gray-400 mt-2">Publicado em {new Date(post.created_at).toLocaleDateString('pt-AO')}</div>
              )}
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
};

export default BlogPage;
