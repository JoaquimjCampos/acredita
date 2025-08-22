import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { useContent } from '../hooks';
import { ContentItem } from '../types/Content';

const ContentPage: React.FC = () => {
  const { content, loading, error } = useContent();

  if (loading) return <Layout><LoadingSpinner text="Carregando conteúdos..." /></Layout>;
  if (error) return <Layout><p className="text-red-500">{error}</p></Layout>;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Conteúdos</h1>
        {content.length === 0 ? (
          <Card>Nenhum conteúdo encontrado.</Card>
        ) : (
          content.map((item: ContentItem) => (
            <Card key={item.id} title={item.title} subtitle={item.category}>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: item.body || item.text || '' }} />
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
};

export default ContentPage;
