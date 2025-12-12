import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { useContent } from '../hooks';
import { ContentItem } from '../types/Content';
import { FileText, Sparkles } from 'lucide-react';

const ContentPage: React.FC = () => {
  const { content, loading, error } = useContent();

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner text="Carregando conteúdos..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Conteúdos Educativos</h1>
              <p className="text-indigo-100 mt-1">Artigos, guias e recursos para empreendedores angolanos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          {error ? (
            <div className="text-center text-red-600 font-semibold py-12">{error}</div>
          ) : !content || content.length === 0 ? (
            <Card className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum conteúdo disponível</h3>
              <p className="text-gray-600">Ainda não há conteúdos publicados. Volte em breve para novidades!</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {content.map((item: ContentItem) => (
                <Card
                  key={item.id}
                  className="p-6 border-l-4 border-indigo-500 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-xl font-bold text-gray-900">{item.title}</h2>
                        {item.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <div 
                        className="prose prose-sm max-w-none text-gray-700"
                        dangerouslySetInnerHTML={{ __html: item.body || item.text || '' }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ContentPage;
