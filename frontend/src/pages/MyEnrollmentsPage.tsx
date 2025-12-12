import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button, Card, LoadingSpinner } from '../components/common';
import CertificationsService from '../services/certifications/certificationsService';
import { TrainingProgramDTO } from '../types/api';
import { BookOpen, ArrowRight, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

const MyEnrollmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<TrainingProgramDTO[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      try {
        const response = await CertificationsService.getPrograms({});
        setPrograms(response.results);
      } catch (error: any) {
        toast.error('Erro ao carregar inscrições.');
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  if (loading) {
    return <Layout><div className="flex justify-center items-center h-96"><LoadingSpinner size="lg" /></div></Layout>;
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <GraduationCap className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Minhas Inscrições</h1>
              <p className="text-orange-100 mt-1">Acompanhe seu progresso nos programas de certificação</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          {programs.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma inscrição encontrada</h3>
              <p className="text-gray-600 mb-6">Você ainda não se inscreveu em nenhum programa de certificação.</p>
              <Button variant="primary" onClick={() => navigate('/certifications')}>
                Explorar Programas
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <Card key={program.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex-1">{program.title}</h3>
                    <GraduationCap className="h-5 w-5 text-orange-600 flex-shrink-0" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{program.category?.name}</p>
                  <div className="flex items-center justify-between mb-4 py-3 border-y border-gray-200">
                    <span className="text-sm text-gray-500">{program.duration_hours} horas</span>
                    <span className="text-sm font-semibold text-orange-600">Inscrição Ativa</span>
                  </div>
                  <Button 
                    size="sm"
                    variant="outline" 
                    onClick={() => navigate(`/certifications/${program.id}`)}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    Ver Programa
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyEnrollmentsPage;
