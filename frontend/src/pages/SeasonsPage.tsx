import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button } from '../components/common';
import { 
  Calendar, 
  Play, 
  Clock, 
  Users, 
  Eye,
  Star,
  Download,
  Share2,
  ChevronRight,
  PlayCircle,
  Radio
} from 'lucide-react';
import { cn } from '../utils';
import toast from 'react-hot-toast';

interface Episode {
  id: string;
  numero: number;
  titulo: string;
  descricao: string;
  data_exibicao: string;
  duracao: number; // em minutos
  visualizacoes: number;
  thumbnail?: string;
  video_url?: string;
  status: 'publicado' | 'agendado' | 'rascunho';
  participantes_destaque: string[];
  momentos_especiais: string[];
}

interface Season {
  id: string;
  nome: string;
  ano: number;
  descricao: string;
  data_inicio: string;
  data_fim?: string;
  total_episodios: number;
  episodios_publicados: number;
  status: 'ativa' | 'concluida' | 'em_breve';
  episodios: Episode[];
}

const SeasonsPage: React.FC = () => {
  const navigate = useNavigate();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    loadSeasonsData();
  }, []);

  const loadSeasonsData = async () => {
    try {
      setLoading(true);
      
      // Dados mock das temporadas
      const mockSeasons: Season[] = [
        {
          id: '2025',
          nome: 'Temporada 2025',
          ano: 2025,
          descricao: 'A temporada mais inspiradora de "Acredita em Ti, Acredita em Angola" com histórias que transformam vidas.',
          data_inicio: '2025-01-15',
          total_episodios: 12,
          episodios_publicados: 8,
          status: 'ativa',
          episodios: [
            {
              id: 'ep1',
              numero: 1,
              titulo: 'Novos Sonhos, Novas Esperanças',
              descricao: 'Conheça os participantes desta temporada e suas histórias inspiradoras de superação e determinação.',
              data_exibicao: '2025-01-15T20:00:00',
              duracao: 45,
              visualizacoes: 12547,
              status: 'publicado',
              participantes_destaque: ['Maria Silva', 'João Benedito'],
              momentos_especiais: ['Apresentações dos participantes', 'Primeira dinâmica']
            },
            {
              id: 'ep2',
              numero: 2,
              titulo: 'Empreendedorismo Social',
              descricao: 'Os participantes apresentam seus projetos sociais e como pretendem impactar suas comunidades.',
              data_exibicao: '2025-01-22T20:00:00',
              duracao: 50,
              visualizacoes: 11832,
              status: 'publicado',
              participantes_destaque: ['Ana Cristina', 'Carlos Manuel'],
              momentos_especiais: ['Pitch dos projetos', 'Avaliação dos mentores']
            },
            {
              id: 'ep3',
              numero: 3,
              titulo: 'Desafio da Inovação',
              descricao: 'Um desafio que testa a capacidade de inovação e criatividade dos participantes.',
              data_exibicao: '2025-01-29T20:00:00',
              duracao: 48,
              visualizacoes: 13204,
              status: 'publicado',
              participantes_destaque: ['Beatriz Santos', 'Miguel Ferreira'],
              momentos_especiais: ['Desafio de 24 horas', 'Apresentação das soluções']
            },
            {
              id: 'ep4',
              numero: 4,
              titulo: 'Mentoria e Crescimento',
              descricao: 'Os participantes recebem mentoria de empreendedores angolanos de sucesso.',
              data_exibicao: '2025-02-05T20:00:00',
              duracao: 52,
              visualizacoes: 14567,
              status: 'publicado',
              participantes_destaque: ['Maria Silva', 'Ana Cristina'],
              momentos_especiais: ['Sessões de mentoria', 'Planos de ação']
            },
            {
              id: 'ep5',
              numero: 5,
              titulo: 'Superando Obstáculos',
              descricao: 'Os participantes enfrentam desafios pessoais e profissionais, mostrando sua resiliência.',
              data_exibicao: '2025-02-12T20:00:00',
              duracao: 47,
              visualizacoes: 15234,
              status: 'publicado',
              participantes_destaque: ['João Benedito', 'Carlos Manuel'],
              momentos_especiais: ['Histórias de superação', 'Apoio da comunidade']
            },
            {
              id: 'ep6',
              numero: 6,
              titulo: 'Impacto na Comunidade',
              descricao: 'Veja como os projetos dos participantes já estão transformando suas comunidades.',
              data_exibicao: '2025-02-19T20:00:00',
              duracao: 55,
              visualizacoes: 16789,
              status: 'publicado',
              participantes_destaque: ['Beatriz Santos', 'Miguel Ferreira'],
              momentos_especiais: ['Visitas às comunidades', 'Depoimentos de beneficiários']
            },
            {
              id: 'ep7',
              numero: 7,
              titulo: 'Semifinal: A Decisão',
              descricao: 'Os participantes finalistas apresentam seus projetos finais numa semifinal emocionante.',
              data_exibicao: '2025-02-26T20:00:00',
              duracao: 60,
              visualizacoes: 18543,
              status: 'publicado',
              participantes_destaque: ['Maria Silva', 'João Benedito', 'Ana Cristina'],
              momentos_especiais: ['Apresentações finais', 'Votação do público']
            },
            {
              id: 'ep8',
              numero: 8,
              titulo: 'Episódio Especial: Bastidores',
              descricao: 'Um olhar exclusivo por trás das câmaras e momentos não vistos da temporada.',
              data_exibicao: '2025-03-05T20:00:00',
              duracao: 42,
              visualizacoes: 12876,
              status: 'publicado',
              participantes_destaque: ['Todos os participantes'],
              momentos_especiais: ['Bastidores', 'Entrevistas exclusivas']
            },
            {
              id: 'ep9',
              numero: 9,
              titulo: 'Grande Final - Parte 1',
              descricao: 'A primeira parte da grande final com os três finalistas.',
              data_exibicao: '2025-03-12T20:00:00',
              duracao: 70,
              visualizacoes: 0,
              status: 'agendado',
              participantes_destaque: ['Maria Silva', 'João Benedito', 'Ana Cristina'],
              momentos_especiais: ['Apresentações finais', 'Prova de liderança']
            },
            {
              id: 'ep10',
              numero: 10,
              titulo: 'Grande Final - Parte 2',
              descricao: 'A emocionante conclusão com a escolha do vencedor da temporada.',
              data_exibicao: '2025-03-19T20:00:00',
              duracao: 90,
              visualizacoes: 0,
              status: 'agendado',
              participantes_destaque: ['Maria Silva', 'João Benedito', 'Ana Cristina'],
              momentos_especiais: ['Resultado final', 'Celebração']
            }
          ]
        }
      ];

      setSeasons(mockSeasons);
      setCurrentSeason(mockSeasons[0]);
    } catch (error) {
      console.error('Erro ao carregar temporadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchEpisode = (episode: Episode) => {
    if (episode.status === 'agendado') {
      toast.error(`Este episódio será exibido em ${new Date(episode.data_exibicao).toLocaleDateString('pt-AO')}`);
      return;
    }
    
    setSelectedEpisode(episode);
    toast.success(`Reproduzindo: ${episode.titulo}`);
  };

  const handleShareEpisode = async (episode: Episode) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${episode.titulo} - Acredita em Ti, Acredita em Angola`,
          text: episode.descricao,
          url: `${window.location.origin}/temporadas/episodio/${episode.id}`,
        });
      } catch (error) {
        console.log('Erro ao partilhar:', error);
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/temporadas/episodio/${episode.id}`);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEpisodeStatusBadge = (episode: Episode) => {
    switch (episode.status) {
      case 'publicado':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <PlayCircle className="w-3 h-3 mr-1" />
            Disponível
          </span>
        );
      case 'agendado':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Calendar className="w-3 h-3 mr-1" />
            Agendado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Em breve
          </span>
        );
    }
  };

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
          
          {/* Header da Temporada */}
          {currentSeason && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white">
                <div className="flex items-center mb-4">
                  <Radio className="w-8 h-8 mr-3" />
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    AO VIVO
                  </span>
                </div>
                
                <h1 className="text-4xl font-bold mb-4">{currentSeason.nome}</h1>
                <p className="text-xl text-primary-100 mb-6 max-w-3xl">
                  {currentSeason.descricao}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center md:text-left">
                    <div className="text-3xl font-bold text-white">
                      {currentSeason.episodios_publicados}
                    </div>
                    <div className="text-primary-200">Episódios Disponíveis</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-3xl font-bold text-white">
                      {currentSeason.total_episodios}
                    </div>
                    <div className="text-primary-200">Total de Episódios</div>
                  </div>
                  <div className="text-center md:text-left">
                    <div className="text-3xl font-bold text-white">
                      {currentSeason.episodios.reduce((total, ep) => total + ep.visualizacoes, 0).toLocaleString()}
                    </div>
                    <div className="text-primary-200">Total de Visualizações</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Episódios */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Todos os Episódios
            </h2>
            
            {currentSeason?.episodios.map((episode) => (
              <Card 
                key={episode.id}
                className={cn(
                  "overflow-hidden hover:shadow-lg transition-shadow",
                  selectedEpisode?.id === episode.id ? "ring-2 ring-primary-500" : ""
                )}
              >
                <div className="md:flex">
                  
                  {/* Thumbnail */}
                  <div className="md:w-80 h-48 md:h-auto bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                    {episode.thumbnail ? (
                      <img 
                        src={episode.thumbnail} 
                        alt={episode.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Play className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">Episódio {episode.numero}</p>
                      </div>
                    )}
                    
                    {/* Play Button Overlay */}
                    {episode.status === 'publicado' && (
                      <button
                        onClick={() => handleWatchEpisode(episode)}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-60 transition-all group"
                      >
                        <Play className="w-16 h-16 text-white group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                    
                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                      {formatDuration(episode.duracao)}
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center mb-2">
                          <h3 className="text-xl font-bold text-gray-900 mr-3">
                            {episode.titulo}
                          </h3>
                          {getEpisodeStatusBadge(episode)}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          Episódio {episode.numero} • {formatDate(episode.data_exibicao)}
                        </p>
                      </div>
                      
                      {episode.status === 'publicado' && (
                        <div className="flex items-center text-gray-500">
                          <Eye className="w-4 h-4 mr-1" />
                          <span className="text-sm">{episode.visualizacoes.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {episode.descricao}
                    </p>

                    {/* Participantes em Destaque */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Participantes em destaque:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {episode.participantes_destaque.map((participante, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            <Users className="w-3 h-3 mr-1" />
                            {participante}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Momentos Especiais */}
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Momentos especiais:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {episode.momentos_especiais.map((momento, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                          >
                            <Star className="w-3 h-3 mr-1" />
                            {momento}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => handleWatchEpisode(episode)}
                        disabled={episode.status !== 'publicado'}
                        className="flex-1 min-w-0"
                      >
                        {episode.status === 'publicado' ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Assistir
                          </>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4 mr-2" />
                            Em breve
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShareEpisode(episode)}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Partilhar
                      </Button>
                      
                      {episode.status === 'publicado' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast('Funcionalidade de download em breve!')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <Card className="mt-12 p-8 text-center bg-gradient-to-r from-primary-50 to-primary-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Não Perca Nenhum Episódio!
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Acompanhe todas as histórias inspiradoras e vote nos seus participantes favoritos. 
              Juntos, vamos acreditar em Angola!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/participantes')}
                size="lg"
              >
                <Users className="w-5 h-5 mr-2" />
                Ver Participantes
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => navigate('/votar')}
              >
                <Star className="w-5 h-5 mr-2" />
                Votar Agora
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SeasonsPage;
