import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import CertificationsService from '../services/certifications/certificationsService';
import { TrainingProgramDTO, ProfessionalCategoryDTO } from '../types/api';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap, Search, BookOpen, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const CertificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<TrainingProgramDTO[]>([]);
  const [categories, setCategories] = useState<ProfessionalCategoryDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [view, setView] = useState<'programs' | 'categories'>('programs');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await CertificationsService.getCategories();
        setCategories(data);
      } catch (error: any) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (view !== 'programs') return;
    
    const fetchPrograms = async () => {
      setLoading(true);
      try {
        const filters: any = {
          search: searchTerm || undefined,
          category_id: selectedCategory ? parseInt(selectedCategory) : undefined,
        };
        const response = await CertificationsService.getPrograms(filters);
        setPrograms(response.results || response);
      } catch (error: any) {
        toast.error(error.message || 'Erro ao carregar programas');
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchPrograms();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedCategory, view]);

  const categoryOptions = useMemo(() => categories, [categories]);

  return (
    <Layout>
      <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold">Certificações & Treinamentos</h1>
              <p className="text-orange-100 mt-1">Desenvolva suas competências profissionais com nossos programas certificados.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <div className="flex gap-2">
            <button
              onClick={() => setView('programs')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'programs'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Programas
            </button>
            <button
              onClick={() => setView('categories')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === 'categories'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Categorias
            </button>
          </div>

          {view === 'categories' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryOptions.map((category) => (
                <div
                  key={category.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedCategory(category.id.toString());
                    setView('programs');
                  }}
                >
                  <Card className="p-6 border-l-4 border-orange-500 hover:shadow-md transition-shadow h-full">
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="text-lg font-semibold text-gray-900">{category.name}</h2>
                      <BookOpen className="h-5 w-5 text-orange-600" />
                    </div>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">{category.description || 'Categoria de treinamento profissional'}</p>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Programas disponíveis</span>
                      <span className="text-orange-600 font-semibold">→</span>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <>
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar programas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  {categoryOptions.length > 0 && (
                    <div className="sm:w-60 relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 appearance-none"
                      >
                        <option value="">Todas as categorias</option>
                        {categoryOptions.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </Card>

              {loading ? (
                <div className="flex justify-center py-12"><LoadingSpinner text="Carregando programas..." /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {programs.map((program) => (
                    <Card key={program.id} className="p-6 border-l-4 border-orange-500 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-900 flex-1">{program.title}</h2>
                        <GraduationCap className="h-5 w-5 text-orange-600 flex-shrink-0" />
                      </div>
                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{program.description}</p>
                      <div className="space-y-2 text-xs text-gray-600 mb-4 py-3 border-t border-b border-gray-200">
                        {program.duration_hours && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" /> {program.duration_hours}h
                          </div>
                        )}
                        {program.enrollment_count && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" /> {program.enrollment_count} participantes
                          </div>
                        )}
                      </div>
                      <button
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition-colors"
                        onClick={() => navigate(`/certifications/${program.id}`)}
                      >
                        Ver Detalhes
                      </button>
                    </Card>
                  ))}
                  {programs.length === 0 && (
                    <Card className="p-8 text-center col-span-full">
                      <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-700">Nenhum programa encontrado. Ajuste sua pesquisa.</p>
                    </Card>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CertificationsPage;
