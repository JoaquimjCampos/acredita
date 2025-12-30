import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { Users, Heart, TrendingUp, Vote } from 'lucide-react';
import DonationSection from '../components/DonationSection';
import ActivityTimeline from '../components/ActivityTimeline';
import { useAuth } from '../contexts/AuthContext';
import { useCoreDashboard } from '../hooks/useCoreDashboard';
import { useActivityNotification } from '../hooks/useActivityNotification';
import { fetchMeActivity, ActivityResponse } from '../services/core';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: me, loading } = useCoreDashboard(!!isAuthenticated);
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const activityCount = activity?.total_events || 0;
  const { markAsRead } = useActivityNotification(activityCount);

  // Fetch activity when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    const run = async () => {
      try {
        const res = await fetchMeActivity();
        setActivity(res);
      } catch (err) {
        console.error('Failed to fetch activity', err);
      }
    };
    run();
  }, [isAuthenticated]);

  // Mark activity as read when dashboard loads and activity is available
  useEffect(() => {
    if (!loading && activity) {
      markAsRead();
    }
  }, [loading, activity?.total_events]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <LoadingSpinner text="A carregar o seu painel..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">O seu Painel</h1>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="p-6 hover:scale-105 transition-transform duration-200 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 animate-bounce">
                <Users className="h-8 w-8 text-acredita-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Trust Score</p>
                <p className="text-2xl font-bold text-gray-900">{me?.trust.score ?? 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:scale-105 transition-transform duration-200 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 animate-pulse">
                <Vote className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Certificações</p>
                <p className="text-2xl font-bold text-gray-900">{me?.certifications.total ?? 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:scale-105 transition-transform duration-200 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 animate-fade-in">
                <Heart className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Vendas Marketplace</p>
                <p className="text-2xl font-bold text-gray-900">{me?.marketplace.total_sales ?? 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 hover:scale-105 transition-transform duration-200 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0 animate-bounce">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Kixikila (Ciclos)</p>
                <p className="text-lg font-bold text-gray-900">{me?.kixikila.cycles_completed ?? 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Oportunidades primeiro, seguidas do breakdown de confiança */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Activity Timeline - New component */}
            <ActivityTimeline />
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-acredita-primary mb-4">Oportunidades</h2>
              <ul className="space-y-2 text-gray-700">
                <li>Certificações concluídas: <strong>{me?.certifications.total ?? 0}</strong></li>
                <li>Vendas concluídas: <strong>{me?.marketplace.total_sales ?? 0}</strong></li>
                <li>Ciclos Kixikila: <strong>{me?.kixikila.cycles_completed ?? 0}</strong></li>
                <li>Participações em Temporadas: <strong>{me?.reality.seasons_participated ?? 0}</strong></li>
              </ul>
            </Card>
          </div>
          <div>
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-acredita-primary mb-4">Quebra de Confiança</h2>
              {me?.trust.breakdown?.length ? (
                <div className="space-y-2">
                  {me!.trust.breakdown.map((b) => (
                    <div key={b.event_type} className="flex items-center justify-between">
                      <span className="text-gray-700">{b.event_type}</span>
                      <span className="font-semibold text-gray-900">{b.points} pts ({b.count} eventos)</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">Sem eventos ainda — experimente concluir um simulador ou publicar um serviço.</div>
              )}
            </Card>
          </div>
        </div>

        {/* Secção de Doações */}
        <div className="mt-10">
          <DonationSection />
        </div>

        {/* Ações rápidas */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Button onClick={() => navigate('/certifications')} className="w-full">Explorar Certificações</Button>
          <Button onClick={() => navigate('/marketplace')} className="w-full">Marketplace</Button>
          <Button onClick={() => navigate('/kixikila')} className="w-full">Kixikila</Button>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
