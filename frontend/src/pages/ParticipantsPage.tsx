import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, Input } from '../components/common';
import { apiService } from '../services/api';
import { ParticipantSimple } from '../types';
import { Search, Heart, Star, MapPin, Calendar, Users, Filter, Grid, List } from 'lucide-react';
import { cn } from '../utils';

const ParticipantsPage: React.FC = () => {
  const [participants, setParticipants] = useState<ParticipantSimple[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<ParticipantSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'votes' | 'age'>('name');

  useEffect(() => {
    loadParticipants();
  }, []);

  useEffect(() => {
    filterParticipants();
  }, [participants, searchTerm, selectedProvince, sortBy]);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      
      // Dados mock dos participantes (substitua pela chamada real da API)
      const mockParticipants: ParticipantSimple[] = [
        {
          id: '1',
          nome: 'Maria Silva',
          idade: 25,
          provincia: 'Luanda',
          historia: 'Empreendedora dedicada à educação infantil',
          foto_perfil: undefined,
          total_votos: 1247,
          data_inscricao: '2025-01-15',
          status: 'ativo',
          redes_sociais: {
            instagram: '@maria_silva_ao',
            facebook: 'Maria Silva'
          }
        },
        {
          id: '2',
          nome: 'João Benedito',
          idade: 32,
          provincia: 'Benguela',
          historia: 'Professor que criou uma escola rural comunitária',
          foto_perfil: null,
          total_votos: 1156,
          data_inscricao: '2025-01-18',
          status: 'ativo',
          redes_sociais: {
            instagram: '@joao_benedito',
            facebook: 'João Benedito'
          }
        },
        {
          id: '3',
          nome: 'Ana Cristina',
          idade: 28,
          provincia: 'Huíla',
          historia: 'Enfermeira que fundou clínica móvel para comunidades rurais',
          foto_perfil: null,
          total_votos: 987,
          data_inscricao: '2025-01-20',
          status: 'ativo',
          redes_sociais: {
            instagram: '@ana_cristina_ao'
          }
        },
        {
          id: '4',
          nome: 'Carlos Manuel',
          idade: 35,
          provincia: 'Malanje',
          historia: 'Agricultor que desenvolveu técnicas sustentáveis',
          foto_perfil: null,
          total_votos: 856,
          data_inscricao: '2025-01-22',
          status: 'ativo'
        },
        {
          id: '5',
          nome: 'Beatriz Santos',
          idade: 24,
          provincia: 'Cabinda',
          historia: 'Artista que promove cultura angolana através da arte',
          foto_perfil: null,
          total_votos: 742,
          data_inscricao: '2025-01-25',
          status: 'ativo',
          redes_sociais: {
            instagram: '@beatriz_arte',
            facebook: 'Beatriz Santos Arte'
          }
        },
        {
          id: '6',
          nome: 'Miguel Ferreira',
          idade: 29,
          provincia: 'Huambo',
          historia: 'Engenheiro que criou soluções de energia solar para aldeias',
          foto_perfil: null,
          total_votos: 693,
          data_inscricao: '2025-01-28',
          status: 'ativo'
        }
      ];

      setParticipants(mockParticipants);
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterParticipants = () => {
    let filtered = [...participants];

    // Filtrar por termo de pesquisa
    if (searchTerm) {
      filtered = filtered.filter(participant =>
        participant.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.historia.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por província
    if (selectedProvince) {
      filtered = filtered.filter(participant => participant.provincia === selectedProvince);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'votes':
          return b.total_votos - a.total_votos;
        case 'age':
          return a.idade - b.idade;
        case 'name':
        default:
          return a.nome.localeCompare(b.nome);
      }
    });

    setFilteredParticipants(filtered);
  };

  const handleVote = async (participantId: string) => {
    try {
      // Implementar votação
      console.log('Votar no participante:', participantId);
    } catch (error) {
      console.error('Erro ao votar:', error);
    }
  };

  const provinces = ['Luanda', 'Benguela', 'Huíla', 'Malanje', 'Cabinda', 'Huambo', 'Bié', 'Cunene'];

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Participantes do Programa
            </h1>
            <p className="text-gray-600">
              Conheça as histórias inspiradoras dos nossos participantes
            </p>
          </div>

          {/* Filtros e Pesquisa */}
          <Card className="p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              
              {/* Pesquisa */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Pesquisar participantes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtro por Província */}
              <div>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Todas as Províncias</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>

              {/* Ordenação */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'votes' | 'age')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="name">Ordenar por Nome</option>
                  <option value="votes">Ordenar por Votos</option>
                  <option value="age">Ordenar por Idade</option>
                </select>
              </div>
            </div>

            {/* Controles de Visualização */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredParticipants.length} participante{filteredParticipants.length !== 1 ? 's' : ''} encontrado{filteredParticipants.length !== 1 ? 's' : ''}
              </p>
              
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Lista de Participantes */}
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-6'
          )}>
            {filteredParticipants.map((participant) => (
              <Card 
                key={participant.id} 
                className={cn(
                  "overflow-hidden hover:shadow-lg transition-shadow",
                  viewMode === 'list' ? 'flex' : ''
                )}
              >
                <div className={cn(
                  viewMode === 'list' ? 'flex w-full' : ''
                )}>
                  
                  {/* Foto do Participante */}
                  <div className={cn(
                    "bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center",
                    viewMode === 'list' ? 'w-32 h-32' : 'h-48 w-full'
                  )}>
                    {participant.foto_perfil ? (
                      <img 
                        src={participant.foto_perfil} 
                        alt={participant.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Users className="w-12 h-12 text-primary-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-primary-700">
                          {participant.nome.split(' ').map(n => n[0]).join('')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className={cn(
                    "p-6",
                    viewMode === 'list' ? 'flex-1' : ''
                  )}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {participant.nome}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {participant.provincia}
                          <span className="mx-2">•</span>
                          <Calendar className="w-4 h-4 mr-1" />
                          {participant.idade} anos
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center text-primary-600">
                          <Heart className="w-4 h-4 mr-1" />
                          <span className="font-semibold">{participant.total_votos}</span>
                        </div>
                        <p className="text-xs text-gray-500">votos</p>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {participant.historia}
                    </p>

                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleVote(participant.id)}
                        className="flex-1"
                        size="sm"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Votar
                      </Button>
                      <Link to={`/participantes/${participant.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Ver Perfil
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Mensagem quando não há resultados */}
          {filteredParticipants.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum participante encontrado
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros de pesquisa para encontrar participantes.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ParticipantsPage;
