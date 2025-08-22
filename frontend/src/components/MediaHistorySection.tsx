import React from 'react';
import { Card, LoadingSpinner } from '../components/common';

// Simulação de dados
const mockHistory = [
  { id: 1, title: 'Pitch João', type: 'video', status: 'Publicado', date: '2025-08-01', url: '#' },
  { id: 2, title: 'Imagem Evento', type: 'imagem', status: 'Processando', date: '2025-08-02', url: '#' },
  { id: 3, title: 'Aula Empreendedorismo', type: 'video', status: 'Erro', date: '2025-08-03', url: '#' },
];

const MediaHistorySection: React.FC<{ userRole?: string, loading?: boolean }> = ({ userRole, loading }) => {
  // Filtrar por perfil
  const history = userRole === 'admin' ? mockHistory : mockHistory.filter(h => h.status === 'Publicado');

  if (loading) {
    return <LoadingSpinner size="md" text="A carregar histórico de media..." />;
  }

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold mb-4">Histórico de Media</h2>
      {history.length === 0 ? (
        <Card className="text-center py-8">Nenhum histórico disponível.</Card>
      ) : (
        <div className="space-y-4">
          {history.map(item => (
            <Card key={item.id} className="flex flex-col md:flex-row items-center justify-between p-4">
              <div>
                <span className="font-semibold text-acredita-primary mr-2">{item.type.toUpperCase()}</span>
                <span className="font-bold">{item.title}</span>
                <span className="ml-4 text-xs text-gray-500">{item.date}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded text-xs ${item.status === 'Publicado' ? 'bg-green-100 text-green-700' : item.status === 'Processando' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{item.status}</span>
                <a href={item.url} className="text-acredita-primary underline text-xs">Ver</a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default MediaHistorySection;
