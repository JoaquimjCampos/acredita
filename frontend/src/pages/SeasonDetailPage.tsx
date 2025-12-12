import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { Calendar, Users, Video, Sparkles } from 'lucide-react';
import { useSeasons } from '../hooks/useSeasons';
import { useParticipants } from '../hooks';
import { Season } from '../types/Season';

interface Episode {
  id: number;
  title: string;
  air_date: string;
  video_url?: string;
  voting_enabled: boolean;
  status: string;
}

const SeasonDetailPage: React.FC = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [errorEpisodes, setErrorEpisodes] = useState<string | null>(null);
  const [voteSummary, setVoteSummary] = useState<{[key: string]: number}>({});
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { seasons, loading, error } = useSeasons();
  const { participants } = useParticipants();

  const season: Season | undefined = Array.isArray(seasons) ? seasons.find(s => String(s.id) === String(id)) : undefined;

  useEffect(() => {
    async function fetchEpisodesAndVotes() {
      setLoadingEpisodes(true);
      try {
        const res = await fetch(`/api/seasons/episodes/?season=${season?.id}`);
        const data = await res.json();
        setEpisodes(data.results || data || []);
        const voteCounts: {[key: string]: number} = {};
        const episodeList = data.results || data || [];
        for (const ep of episodeList) {
          try {
            const resVotes = await fetch(`/api/seasons/episodes/${ep.id}/votes/`);
            const voteData = await resVotes.json();
            if (voteData.votes) {
              voteData.votes.forEach((v: {participant_id: string, vote_count: number}) => {
                voteCounts[v.participant_id] = v.vote_count;
              });
            }
          } catch {}
        }
        setVoteSummary(voteCounts);
      } catch {
        setErrorEpisodes('Erro ao carregar episódios.');
      } finally {
        setLoadingEpisodes(false);
      }
    }
    if (season) {
      fetchEpisodesAndVotes();
      if (pollInterval.current) clearInterval(pollInterval.current);
      pollInterval.current = setInterval(fetchEpisodesAndVotes, 10000);
    }
    if (!loading && !season && !error) {
      navigate('/temporadas');
    }
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [loading, season, error, navigate, id]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner text="A carregar detalhes da temporada..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 font-semibold mb-4">{error}</p>
            <button onClick={() => navigate('/temporadas')} className="text-amber-600 hover:text-amber-700 font-medium">
              ← Voltar
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!season) {
    return null;
  }

  const seasonParticipants = Array.isArray(participants) ? participants : [];

  return (
    <Layout>
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <button onClick={() => navigate('/temporadas')} className="mb-6 text-amber-100 hover:text-white text-sm flex items-center gap-1">
            ← Voltar
          </button>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{season.title}</h1>
              <p className="text-amber-100 mt-1">{season.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 border-l-4 border-amber-500">
              <p className="text-sm text-gray-600 mb-2">Início</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-gray-900">{new Date(season.start_date).toLocaleDateString('pt-AO')}</span>
              </div>
            </Card>
            <Card className="p-6 border-l-4 border-amber-500">
              <p className="text-sm text-gray-600 mb-2">Fim</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-600" />
                <span className="font-semibold text-gray-900">{new Date(season.end_date).toLocaleDateString('pt-AO')}</span>
              </div>
            </Card>
            <Card className="p-6 border-l-4 border-amber-500">
              <p className="text-sm text-gray-600 mb-2">Estado</p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700">
                {season.status}
              </span>
            </Card>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Episódios</h2>
          {loadingEpisodes ? (
            <div className="flex justify-center items-center min-h-[100px]">
              <LoadingSpinner text="A carregar episódios..." />
            </div>
          ) : errorEpisodes ? (
            <div className="text-center text-red-600 font-semibold mb-8">{errorEpisodes}</div>
          ) : episodes.length === 0 ? (
            <Card className="text-center py-12">
              <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum episódio encontrado</h3>
              <p className="text-gray-600">Esta temporada ainda não possui episódios registados.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {episodes.map((ep) => (
                <Card key={ep.id} className="p-6 border-l-4 border-amber-500 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{ep.title}</h3>
                      <span className={`inline-block mt-1 text-xs font-semibold px-2 py-1 rounded ${ep.voting_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {ep.voting_enabled ? 'Votação Aberta' : 'Votação Encerrada'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Calendar className="h-4 w-4" />
                    {new Date(ep.air_date).toLocaleDateString('pt-AO')}
                  </div>
                  {ep.video_url && (
                    <a href={ep.video_url} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                      Ver Vídeo →
                    </a>
                  )}
                </Card>
              ))}
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="h-6 w-6" /> Participantes
          </h2>
          {seasonParticipants.length === 0 ? (
            <Card className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum participante encontrado</h3>
              <p className="text-gray-600">Esta temporada ainda não possui participantes registados.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seasonParticipants.map((p) => (
                <Card key={p.id} className="p-6 border-l-4 border-amber-500 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0">
                      {p.foto_perfil ? (
                        <img src={p.foto_perfil} alt={p.nome} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{p.nome}</h3>
                      <p className="text-sm text-gray-600">{p.provincia}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <span className="font-semibold text-gray-900">{p.idade} anos</span>
                  </div>
                  <button
                    onClick={() => navigate(`/participantes/${p.id}`)}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Ver Perfil
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SeasonDetailPage;
