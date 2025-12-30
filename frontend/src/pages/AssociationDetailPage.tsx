import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { Association, AssociationPair } from '../types/games';
import { gamesService } from '../services/gamesService';
import { CheckCircle, ArrowLeft, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

const AssociationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Association | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (id) loadGame(id);
  }, [id]);

  const loadGame = async (gameId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await gamesService.getAssociation(parseInt(gameId));
      setGame(data);
    } catch (err) {
      setError('Erro ao carregar jogo de associação.');
      toast.error('Não foi possível carregar o jogo.');
    } finally {
      setLoading(false);
    }
  };

  // Get pairs from API or use sample fallback
  const pairs = useMemo(() => {
    if (game?.pairs && Array.isArray(game.pairs) && game.pairs.length > 0) {
      return game.pairs.map((p: AssociationPair) => ({
        left: p.left_item,
        right: p.right_item,
      }));
    }
    // Fallback sample pairs
    return [
      { left: 'Inovação', right: 'Criar algo novo' },
      { left: 'Colaboração', right: 'Trabalhar em equipa' },
      { left: 'Resiliência', right: 'Persistir perante desafios' },
      { left: 'Empatia', right: 'Compreender o outro' },
    ];
  }, [game]);

  const handleSelect = (side: 'left' | 'right', value: string) => {
    if (isChecking) return;
    if (side === 'left') setSelectedLeft(value === selectedLeft ? null : value);
    else setSelectedRight(value === selectedRight ? null : value);
  };

  const checkMatch = () => {
    if (!selectedLeft || !selectedRight) return;
    setIsChecking(true);
    const isCorrect = pairs.some((p: any) => p.left === selectedLeft && p.right === selectedRight);
    if (isCorrect) {
      const newMatched = { ...matched, [selectedLeft]: selectedRight };
      setMatched(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
      
      // Check if all pairs matched
      if (Object.keys(newMatched).length === pairs.length) {
        finishGame(newMatched);
      }
    } else {
      // Brief feedback state toggle
      setTimeout(() => {
        setSelectedRight(null);
      }, 400);
    }
    setTimeout(() => setIsChecking(false), 200);
  };

  const finishGame = async (finalMatched: Record<string, string>) => {
    if (!id || !game) return;
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      const result = await gamesService.submitAssociationAnswers(
        parseInt(id),
        finalMatched,
        timeTaken
      );
      
      setScore(result.score || 0);
      setIsFinished(true);
      
      toast.success(`Jogo concluído! Pontuação: ${result.score || 0}`);
      
      // Load leaderboard
      const leaderboardData = await gamesService.getAssociationLeaderboard(parseInt(id));
      setLeaderboard(leaderboardData);
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao submeter respostas');
    }
  };

  if (loading) return <Layout><LoadingSpinner text="Carregando associação..." /></Layout>;
  if (error || !game) return <Layout><p className="text-red-500">{error || 'Jogo de associação não encontrado.'}</p></Layout>;

  return (
    <Layout>
      <div className="bg-gradient-to-r from-pink-600 to-purple-700 text-white py-10">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/jogos/associacao')}
            className="hover:bg-white/20 p-2 rounded transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">{game?.title || 'Associação'}</h1>
            <p className="text-pink-100 mt-1">{game?.description || ''}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-8 px-4">
        {!isFinished ? (
          <Card title="Associe os conceitos às definições">
            <p className="mb-4 text-gray-700">Clique em um conceito e depois na definição correspondente.</p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <h4 className="font-semibold mb-2 text-gray-800">Conceitos</h4>
                <div className="space-y-2">
                  {pairs.map((p: any) => (
                    <button
                      key={p.left}
                      onClick={() => handleSelect('left', p.left)}
                      disabled={Boolean(matched[p.left])}
                      className={`w-full text-left px-3 py-2 rounded border transition ${
                        matched[p.left]
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : selectedLeft === p.left
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 bg-white hover:border-emerald-300'
                      }`}
                    >
                      {p.left}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-gray-800">Definições</h4>
                <div className="space-y-2">
                  {pairs.map((p: any) => (
                    <button
                      key={p.right}
                      onClick={() => handleSelect('right', p.right)}
                      disabled={Object.values(matched).includes(p.right)}
                      className={`w-full text-left px-3 py-2 rounded border transition ${
                        Object.values(matched).includes(p.right)
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : selectedRight === p.right
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 bg-white hover:border-emerald-300'
                      }`}
                    >
                      {p.right}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button disabled={isChecking || !selectedLeft || !selectedRight} onClick={checkMatch}>
                Verificar par
              </Button>
              <span className="text-sm text-gray-600">
                Acertos: {Object.keys(matched).length} / {pairs.length}
              </span>
            </div>
          </Card>
        ) : (
          <Card className="text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Parabéns!</h2>
              <p className="text-gray-700 mb-4">Você completou o jogo de associação!</p>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-purple-700">{score}%</div>
                  <div className="text-sm text-gray-600">Pontuação</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-green-700">+{score}</div>
                  <div className="text-sm text-gray-600">XP Ganho</div>
                </div>
              </div>

              {leaderboard.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center justify-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" /> Leaderboard
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {leaderboard.slice(0, 5).map((entry) => (
                      <div key={entry.rank} className="flex justify-between py-2 border-b last:border-0">
                        <span className="font-medium">#{entry.rank} {entry.username}</span>
                        <span className="text-gray-600">{entry.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button onClick={() => navigate('/jogos/associacao')}>
              Voltar às Associações
            </Button>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AssociationDetailPage;
