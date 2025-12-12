import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import CertificationsService from '../services/certifications/certificationsService';
import { TrainingProgramDTO } from '../types/api';
import { useAuth } from '../hooks/useAuth';
import { GraduationCap, Clock, Users, BookOpen, ArrowLeft, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const CertificationsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [program, setProgram] = useState<TrainingProgramDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        if (id) {
          const data = await CertificationsService.getProgram(parseInt(id));
          setProgram(data);
          setIsEnrolled(false); // Default to false, will be updated based on enrollment check
        }
      } catch (error: any) {
        toast.error(error.message || 'Erro ao carregar programa');
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [id]);

  const handleEnroll = async () => {
    try {
      if (!user) {
        toast.error('Deve estar autenticado para se inscrever');
        navigate('/login');
        return;
      }

      setEnrolling(true);
      if (id) {
        await CertificationsService.enrollProgram(parseInt(id));
        setIsEnrolled(true);
        toast.success('Inscrição realizada com sucesso!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao se inscrever');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner text="Carregando programa..." />
        </div>
      </Layout>
    );
  }

  if (!program) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Programa não encontrado</h2>
              <button
                onClick={() => navigate('/certifications')}
                className="mt-4 inline-flex items-center gap-2 text-orange-600 hover:text-orange-700"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar para certificações
              </button>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate('/certifications')}
            className="mb-4 inline-flex items-center gap-2 text-orange-100 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-10 w-10" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold">{program.title}</h1>
              <p className="text-orange-100 mt-2">{program.description}</p>
            </div>
            {user && !isEnrolled && (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="ml-auto bg-white text-orange-600 hover:bg-orange-50 disabled:opacity-50 px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {enrolling ? 'Inscrevendo...' : 'Se Inscrever'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {program.duration_hours && (
              <Card className="p-4 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Duração</p>
                    <p className="text-lg font-bold text-gray-900">{program.duration_hours}h</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </Card>
            )}

            {program.enrollment_count !== undefined && (
              <Card className="p-4 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Inscritos</p>
                    <p className="text-lg font-bold text-gray-900">{program.enrollment_count}</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </Card>
            )}

            {program.instructor_name && (
              <Card className="p-4 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Instrutor</p>
                    <p className="text-lg font-bold text-gray-900 truncate">{program.instructor_name}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-orange-600 flex-shrink-0" />
                </div>
              </Card>
            )}

            {program.price && (
              <Card className="p-4 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Preço</p>
                    <p className="text-lg font-bold text-gray-900">${program.price}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-600" />
                </div>
              </Card>
            )}
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Sobre o Programa</h2>
            <p className="text-gray-700 leading-relaxed">{program.description}</p>
          </Card>

          {isEnrolled && (
            <Card className="p-6 bg-green-50 border-l-4 border-green-600">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-green-900">Você está inscrito neste programa</h3>
                  <p className="text-green-800 text-sm mt-1">Acompanhe seu progresso e complete o programa para obter o certificado.</p>
                </div>
              </div>
            </Card>
          )}

          {!user && (
            <Card className="p-6 bg-blue-50 border-l-4 border-blue-600">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900">Faça login para se inscrever</h3>
                  <p className="text-blue-800 text-sm mt-1">Você precisa ter uma conta para participar deste programa de certificação.</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Fazer Login
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CertificationsDetailPage;
