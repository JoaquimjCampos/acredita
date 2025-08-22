import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { Calendar, Users, Star, ArrowLeft, Video } from 'lucide-react';
import { useSeasons } from '../hooks/useSeasons';
import { useParticipants } from '../hooks';
import { Season } from '../types/Season';
import { Participant } from '../types/Participant';
import { Modal } from '../components/common/Modal';

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
  const [voteLoading, setVoteLoading] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedVote, setSelectedVote] = useState<{episodeId: number, participantId: string | null} | null>(null);
  const [userVotes, setUserVotes] = useState<{[key: number]: string}>({}); // episodeId -> participantId
  const [voteSummary, setVoteSummary] = useState<{[key: string]: number}>({}); // participantId -> count
  const [voteHistory, setVoteHistory] = useState<{episodeId: number, participantId: string, timestamp: string}[]>([]);
  const [isAdmin] = useState(false); // Replace with real auth logic
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [errorEpisodes, setErrorEpisodes] = useState<string | null>(null);
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { seasons, loading, error } = useSeasons();
  const { participants, loading: loadingParticipants } = useParticipants();

  // Encontrar temporada selecionada
  const season: Season | undefined = seasons.find(s => String(s.id) === String(id));

  // Fetch episodes and vote counts, and set up polling for live updates
  useEffect(() => {
    async function fetchEpisodesAndVotes() {
      setLoadingEpisodes(true);
      try {
        const res = await fetch(`/api/episodes/?season=${season?.id}`);
        const data = await res.json();
        setEpisodes(data.results || data);
        // Fetch vote counts for each episode
        const voteCounts: {[key: string]: number} = {};
        for (const ep of data.results || data) {
          try {
            const resVotes = await fetch(`/api/episodes/${ep.id}/votes/`);
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
      // Poll for live updates every 10 seconds
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
          <p className="text-red-500 font-semibold" role="alert">{error}</p>
        </div>
      </Layout>
    );
  }

  if (!season) {
    return null;
  }

  // Participantes da temporada (exemplo: todos, pois não há season_id no tipo)
  const seasonParticipants = participants;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="outline" onClick={() => navigate('/temporadas')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar às Temporadas
          </Button>
          <Card className="mb-8 p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {season.poster_image && (
                <img src={season.poster_image} alt={season.title} className="w-48 h-48 object-cover rounded-lg border-2 border-acredita-primary" />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-acredita-primary mb-2">{season.title}</h1>
                <p className="text-gray-700 mb-2">{season.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(season.start_date).toLocaleDateString('pt-AO')} - {new Date(season.end_date).toLocaleDateString('pt-AO')}
                </div>
                <div className="text-xs text-gray-500 mb-2">Estado: <span className="font-semibold text-acredita-primary">{season.status}</span></div>
              </div>
            </div>
          </Card>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Video className="h-7 w-7 text-acredita-primary" /> Episódios da Temporada
          </h2>
          {loadingEpisodes ? (
            <div className="flex justify-center items-center min-h-[100px]">
              <LoadingSpinner text="A carregar episódios..." />
            </div>
          ) : errorEpisodes ? (
            <div className="text-center text-red-600 font-semibold mb-8">{errorEpisodes}</div>
          ) : episodes.length === 0 ? (
            <Card className="text-center py-8">Nenhum episódio encontrado para esta temporada.</Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {episodes.map((ep) => (
                <Card key={ep.id} className="p-4 flex flex-col gap-2 border-2 border-transparent hover:border-acredita-primary transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{ep.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <Calendar className="w-4 h-4" /> {new Date(ep.air_date).toLocaleDateString('pt-AO')}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">Estado: <span className="font-semibold text-acredita-primary">{ep.status}</span></div>
                  {ep.video_url && (
                    <a href={ep.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver Vídeo</a>
                  )}
                  <div className="mt-2">
                    {ep.voting_enabled ? (
                      <>
                        <span className="text-green-600 font-semibold">Votação aberta</span>
                        <form
                          onSubmit={e => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const participantId = formData.get('participant_id') as string;
                            setSelectedVote({ episodeId: ep.id, participantId });
                            setShowConfirm(true);
                          }}
                        >
                          <label htmlFor={`participant-select-${ep.id}`} className="block text-sm font-medium text-gray-700 mb-1">Participante:</label>
                          <select
                            id={`participant-select-${ep.id}`}
                            name="participant_id"
                            className="border rounded px-2 py-1 mb-2 w-full"
                            required
                            disabled={!!userVotes[ep.id]}
                          >
                            <option value="">Selecione...</option>
                            {seasonParticipants.map((p: Participant) => (
                              <option key={p.id} value={p.id} aria-label={`Votar em ${p.nome}`}>
                                {p.nome}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center gap-2 mb-2 overflow-x-auto">
                            {seasonParticipants.map((p: Participant) => {
                              const voted = userVotes[ep.id] === p.id;
                              return (
                                <div key={p.id} className={`flex flex-col items-center mr-2 transition-all duration-500 ${voted ? 'bg-yellow-100 border-yellow-400 border-2' : ''}`} tabIndex={0} aria-label={`Participante ${p.nome}`}> 
                                  {p.foto_perfil ? (
                                    <img src={p.foto_perfil} alt={p.nome} className="w-8 h-8 rounded-full border" />
                                  ) : (
                                    <Users className="w-8 h-8 text-gray-400" />
                                  )}
                                  <span className="text-xs mt-1 font-semibold">{p.nome}</span>
                                  <span className={`text-xs text-blue-600 transition-all duration-500 animate-pulse`}>Votos: {voteSummary[p.id] ?? 0}</span>
                                  {voted && <span className="text-xs text-yellow-700 font-bold">Seu voto</span>}
                                </div>
                              );
                            })}
                          </div>
                          <Button type="submit" size="sm" disabled={voteLoading || !!userVotes[ep.id]} aria-label="Votar" className="focus:outline-acredita-primary">
                            {voteLoading ? <LoadingSpinner size="sm" /> : (!!userVotes[ep.id] ? 'Voto registrado' : 'Votar')}
                          </Button>
                        </form>
                        {voteError && <div className="text-red-600 text-xs mt-2" role="alert">{voteError}</div>}
                        {voteSuccess && <div className="text-green-600 text-xs mt-2" role="status">{voteSuccess}</div>}
                        {showConfirm && selectedVote && (
                          <Modal
                            isOpen={showConfirm}
                            onClose={() => setShowConfirm(false)}
                            title="Confirmar voto"
                            size="sm"
                          >
                            <div className="mb-4">
                              Tem certeza que deseja votar em <b>{seasonParticipants.find(p => p.id === selectedVote.participantId)?.nome}</b>?
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                                Cancelar
                              </Button>
                              <Button
                                variant="primary"
                                onClick={async () => {
                                  setVoteLoading(true);
                                  setVoteError(null);
                                  setVoteSuccess(null);
                                  try {
                                    // Rate limiting: prevent voting too quickly
                                    if (voteHistory.length > 0) {
                                      const lastVote = voteHistory[voteHistory.length - 1];
                                      const now = Date.now();
                                      if (now - new Date(lastVote.timestamp).getTime() < 5000) {
                                        setVoteError('Aguarde alguns segundos antes de votar novamente.');
                                        setVoteLoading(false);
                                        return;
                                      }
                                    }
                                    const res = await fetch('/api/seasons/global-vote/', {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        // Add Authorization header if needed
                                      },
                                      body: JSON.stringify({
                                        episode_id: selectedVote.episodeId,
                                        participant_id: selectedVote.participantId,
                                      }),
                                    });
                                    const data = await res.json();
                                    if (res.ok) {
                                      setVoteSuccess(data.detail || 'Voto registrado com sucesso.');
                                      setUserVotes(v => ({ ...v, [selectedVote.episodeId]: selectedVote.participantId! }));
                                      setVoteHistory(h => ([...h, { episodeId: selectedVote.episodeId, participantId: selectedVote.participantId!, timestamp: new Date().toISOString() }]));
                                      setShowConfirm(false);
                                    } else {
                                      setVoteError(data.detail || 'Erro ao registrar voto.');
                                    }
                                  } catch {
                                    setVoteError('Erro ao registrar voto.');
                                  } finally {
                                    setVoteLoading(false);
                                  }
                                }}
                                disabled={voteLoading}
                              >
                                Confirmar
                              </Button>
                            </div>
                          </Modal>
                        )}
                        {voteHistory.length > 0 && (
                          <div className="mt-4 p-2 bg-blue-50 rounded">
                            <h4 className="font-semibold text-blue-700 mb-2">Histórico dos seus votos:</h4>
                            {voteHistory.map((v, idx) => (
                              <div key={idx} className="text-xs text-gray-700">
                                Episódio {v.episodeId}: {seasonParticipants.find(p => p.id === v.participantId)?.nome} <span className="text-gray-400">({new Date(v.timestamp).toLocaleTimeString()})</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-red-600 font-semibold">Votação encerrada</span>
                    )}
                  {/* Admin view: show full vote breakdown */}
                  {isAdmin && (
                    <div className="mt-4 p-2 bg-red-50 rounded">
                      <h4 className="font-semibold text-red-700 mb-2">Admin: Votos por participante</h4>
                      {seasonParticipants.map((p: Participant) => (
                        <div key={p.id} className="text-xs text-red-700">
                          {p.nome}: {voteSummary[p.id] ?? 0}
                        </div>
                      ))}
                    </div>
                  )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-7 w-7 text-acredita-primary" /> Participantes da Temporada
          </h2>
          {loadingParticipants ? (
            <div className="flex justify-center items-center min-h-[100px]">
              <LoadingSpinner text="A carregar participantes..." />
            </div>
          ) : seasonParticipants.length === 0 ? (
            <Card className="text-center py-8">Nenhum participante encontrado para esta temporada.</Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              {seasonParticipants.map((p) => (
                <Card key={p.id} className="p-4 flex flex-col items-center border-2 border-transparent hover:border-acredita-primary transition-shadow">
                  <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mb-4 overflow-hidden">
                    {p.foto_perfil ? (
                      <img src={p.foto_perfil} alt={p.nome} className="w-full h-full object-cover" />
                    ) : (
                      <Star className="w-10 h-10 text-primary-500" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{p.nome}</h3>
                  <p className="text-sm text-gray-500 mb-1">{p.idade} anos</p>
                  <p className="text-sm text-gray-500 flex items-center mb-2">
                    <span className="mr-1">{p.provincia}</span>
                  </p>
                  <Button className="w-full mt-auto" size="sm" onClick={() => navigate(`/participantes/${p.id}`)}>
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

export default SeasonDetailPage;