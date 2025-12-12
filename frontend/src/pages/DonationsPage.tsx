import React from 'react';
import { Layout } from '../components/layout/Layout';
import DonationSection from '../components/DonationSection';
import { Heart, Sparkles, Users } from 'lucide-react';

const DonationsPage: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-600 to-pink-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center mb-4">
            <Heart className="h-12 w-12 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Apoie o Acredita
            </h1>
          </div>
          <p className="text-xl opacity-95 max-w-3xl">
            A sua contribuição ajuda a transformar vidas e impulsionar o empreendedorismo em Angola
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-pink-50 to-white p-6 rounded-lg border border-pink-200">
            <Sparkles className="h-8 w-8 text-pink-600 mb-3" />
            <h3 className="font-bold text-lg text-gray-900 mb-2">Impacto Direto</h3>
            <p className="text-gray-600 text-sm">
              100% das doações são aplicadas em programas de capacitação e apoio aos empreendedores
            </p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-white p-6 rounded-lg border border-pink-200">
            <Heart className="h-8 w-8 text-pink-600 mb-3" />
            <h3 className="font-bold text-lg text-gray-900 mb-2">Transparência</h3>
            <p className="text-gray-600 text-sm">
              Acompanhe como os fundos são utilizados através dos nossos relatórios trimestrais
            </p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-white p-6 rounded-lg border border-pink-200">
            <Users className="h-8 w-8 text-pink-600 mb-3" />
            <h3 className="font-bold text-lg text-gray-900 mb-2">Comunidade</h3>
            <p className="text-gray-600 text-sm">
              Junte-se a centenas de apoiadores que acreditam no potencial angolano
            </p>
          </div>
        </div>

        <DonationSection />
      </div>
    </Layout>
  );
};

export default DonationsPage;
