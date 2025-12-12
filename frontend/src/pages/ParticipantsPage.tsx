import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { useParticipants } from '../hooks';
import { Users, MapPin, Star, Sparkles } from 'lucide-react';

const ParticipantsPage: React.FC = () => {
  const { participants, loading, error } = useParticipants();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  const filteredParticipants = participants?.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.provincia.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Users className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Participantes</h1>
              <p className="text-red-100 mt-1">Conheça os empreendedores que estão a competir</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Search Bar */}
          <Card className="p-6 mb-8">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-red-600" />
              <input
                type="text"
                placeholder="Pesquisar participante ou província..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </Card>

          {filteredParticipants.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum participante encontrado</h3>
              <p className="text-gray-600 mb-6">Não há participantes no momento. Volte mais tarde!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredParticipants.map((p) => (
                <Card key={p.id} className="p-6 hover:shadow-lg transition-shadow border-l-4 border-red-500">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex-1">{p.nome}</h3>
                    <Star className="h-5 w-5 text-red-600 flex-shrink-0" />
                  </div>
                  <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                    <MapPin size={16} className="text-red-600" />
                    {p.provincia}
                  </p>
                  <div className="flex items-center justify-between mb-4 py-3 border-y border-gray-200">
                    <span className="text-sm text-gray-500">{p.idade} anos</span>
                    <span className="text-sm font-semibold text-red-600">{p.total_votos || 0} votos</span>
                  </div>
                  <Button 
                    size="sm"
                    variant="outline" 
                    onClick={() => navigate(`/participantes/${p.id}`)}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    Ver Perfil
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

export default ParticipantsPage;
