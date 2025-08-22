import React from 'react';
import { Card } from '../components/common';

// Simulação de dados
const mockAnalytics = {
  totalUploads: 42,
  totalViews: 1200,
  topMedia: [
    { id: 1, title: 'Pitch João', views: 400 },
    { id: 2, title: 'Aula Empreendedorismo', views: 300 },
  ],
};

const MediaAnalyticsSection: React.FC<{ userRole?: string }> = ({ userRole }) => {
  // Personalização por perfil
  const analytics = userRole === 'admin' ? mockAnalytics : {
    totalUploads: mockAnalytics.totalUploads,
    totalViews: mockAnalytics.totalViews,
    topMedia: mockAnalytics.topMedia.slice(0, 1),
  };

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4">Analytics de Media</h2>
      <Card className="p-4 mb-4">
        <div className="flex gap-8">
          <div>
            <span className="block text-2xl font-bold text-acredita-primary">{analytics.totalUploads}</span>
            <span className="block text-xs text-gray-500">Uploads</span>
          </div>
          <div>
            <span className="block text-2xl font-bold text-acredita-primary">{analytics.totalViews}</span>
            <span className="block text-xs text-gray-500">Visualizações</span>
          </div>
        </div>
      </Card>
      <h3 className="text-lg font-semibold mb-2">Top Media</h3>
      <div className="space-y-2">
        {analytics.topMedia.map(item => (
          <Card key={item.id} className="flex items-center justify-between p-2">
            <span>{item.title}</span>
            <span className="text-xs text-gray-500">{item.views} views</span>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default MediaAnalyticsSection;
