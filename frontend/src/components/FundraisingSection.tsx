import React from 'react';
import { Card, Button, LoadingSpinner } from '../components/common';
import { useDonationCampaigns } from '../hooks/useDonationCampaigns';

const FundraisingSection: React.FC = () => {
  const { campaigns, loading, error } = useDonationCampaigns();

  if (loading) {
    return <LoadingSpinner size="lg" text="A carregar campanhas de doação..." />;
  }

  if (error) {
    return <div className="text-red-600 font-semibold text-center" role="alert">{error}</div>;
  }

  if (!campaigns.length) {
    return (
      <Card className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma campanha activa</h3>
        <p className="text-gray-600 mb-6">Não há campanhas de doação no momento. Fique atento às novidades!</p>
      </Card>
    );
  }

  return (
    <section className="py-16 bg-white animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Campanhas de Doação &amp; Fundraising</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Apoie os nossos participantes e negócios sociais através das campanhas activas.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map(campaign => (
            <Card key={campaign.id} className="flex flex-col">
              {campaign.image && (
                <img src={campaign.image} alt={campaign.title} className="h-40 w-full object-cover rounded-t" />
              )}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{campaign.title}</h3>
                <p className="text-gray-700 mb-4">{campaign.description}</p>
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-acredita-primary h-3 rounded-full"
                      style={{ width: `${campaign.progress_percentage || 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span>Arrecadado: {campaign.raised_amount} AOA</span>
                    <span>Meta: {campaign.goal_amount} AOA</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="mt-auto"
                  onClick={() => window.open(`/doar/${campaign.id}`, '_blank')}
                  aria-label={`Doar para ${campaign.title}`}
                >
                  Doar Agora
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FundraisingSection;
