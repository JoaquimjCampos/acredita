import React from 'react';
import { Layout } from '../components/layout/Layout';
import MediaUploadSection from '../components/MediaUploadSection';
import MediaHistorySection from '../components/MediaHistorySection';
import MediaAnalyticsSection from '../components/MediaAnalyticsSection';

import { useAuth } from '../contexts/AuthContext';

const MediaManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = React.useState<'upload'|'history'|'analytics'>('upload');
  // Exemplo de perfil: 'admin', 'participant', 'viewer'
  const userRole = user?.user_type || 'viewer';
  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Gestão de Media</h1>
        <nav className="flex gap-4 border-b pb-2 mb-8">
          <button
            className={`font-semibold pb-1 ${tab==='upload' ? 'text-acredita-primary border-b-2 border-acredita-primary' : 'text-gray-400'}`}
            onClick={() => setTab('upload')}
          >Upload</button>
          <button
            className={`font-semibold pb-1 ${tab==='history' ? 'text-acredita-primary border-b-2 border-acredita-primary' : 'text-gray-400'}`}
            onClick={() => setTab('history')}
          >Histórico</button>
          <button
            className={`font-semibold pb-1 ${tab==='analytics' ? 'text-acredita-primary border-b-2 border-acredita-primary' : 'text-gray-400'}`}
            onClick={() => setTab('analytics')}
          >Analytics</button>
        </nav>
        {tab === 'upload' && <MediaUploadSection />}
        {tab === 'history' && <MediaHistorySection userRole={userRole} />}
        {tab === 'analytics' && <MediaAnalyticsSection userRole={userRole} />}
      </div>
    </Layout>
  );
};

export default MediaManagementPage;
