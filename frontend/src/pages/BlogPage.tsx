import React, { useMemo, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { useBlog } from '../hooks';
import { BlogPost } from '../types/BlogPost';
import { BookOpen, Calendar, User, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const BlogPage: React.FC = () => {
  const { blogPosts, loading, error } = useBlog();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const categories = useMemo(
    () => Array.from(new Set(blogPosts.map((post: any) => post.category).filter(Boolean))),
    [blogPosts]
  );

  const filteredPosts = blogPosts.filter((post: BlogPost) => {
    const matchesSearch =
      !searchTerm ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || (post as any).category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <Layout>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Blog Acredita</h1>
              <p className="text-blue-100 mt-1">Histórias, insights e novidades do ecossistema de empreendedorismo angolano.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Procurar artigos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {categories.length > 0 && (
                <div className="sm:w-60 relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </Card>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner text="Carregando artigos..." />
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-700">
                {searchTerm || selectedCategory ? 'Nenhum artigo encontrado. Ajuste sua pesquisa.' : 'Nenhum post publicado ainda.'}
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((post: BlogPost) => (
                <Card key={post.id} className="p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="text-2xl font-bold text-gray-900">{post.title}</h2>
                    {(post as any).category && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex-shrink-0">
                        {(post as any).category}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    {post.author && (
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{post.author}</span>
                      </div>
                    )}
                    {post.created_at && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <time dateTime={post.created_at}>
                          {new Date(post.created_at).toLocaleDateString('pt-AO', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </time>
                      </div>
                    )}
                  </div>

                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed line-clamp-4 mb-4" dangerouslySetInnerHTML={{ __html: post.content }} />

                  <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors">
                    Ler mais →
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BlogPage;
