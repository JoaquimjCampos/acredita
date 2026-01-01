import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, Button } from '../components/common';
import { Award, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '../utils/analytics';

const UpgradePage: React.FC = () => {
  const navigate = useNavigate();

  const handleUpgrade = (role: 'participant' | 'mentor') => {
    trackEvent({
      name: 'upgrade-request',
      page: 'upgrade',
      cta_type: 'upgrade',
      target_role: role,
      variant: 'A',
      timestamp: Date.now(),
    });
    navigate('/perfil');
  };

  return (
    <Layout>
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-4">Desbloqueie funcionalidades avançadas</h1>
          <p className="text-gray-600 mb-8">Escolha o nível que melhor se adequa aos seus objetivos.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingBag className="h-6 w-6 text-cyan-600" />
                <h2 className="text-xl font-semibold">Participante</h2>
              </div>
              <ul className="text-sm text-gray-700 space-y-2 mb-4">
                <li>• Vender no Marketplace</li>
                <li>• Participar em grupos Kixikila</li>
                <li>• Acesso a ranking e desafios</li>
              </ul>
              <Button onClick={() => handleUpgrade('participant')} className="w-full">Tornar-se Participante</Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-semibold">Mentor</h2>
              </div>
              <ul className="text-sm text-gray-700 space-y-2 mb-4">
                <li>• Criar cursos e certificações</li>
                <li>• Publicar conteúdos e artigos</li>
                <li>• Moderar e apoiar a comunidade</li>
              </ul>
              <Button onClick={() => handleUpgrade('mentor')} className="w-full">Tornar-se Mentor</Button>
            </Card>
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              Sem taxas ocultas. Aprovação rápida. Segurança em primeiro lugar.
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default UpgradePage;
