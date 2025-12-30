import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { gamesService } from '../services/gamesService';
import { Crossword, CrosswordClue } from '../types/games';
import { BookOpen, CheckCircle, XCircle, ArrowLeft, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';

const CrosswordsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [crossword, setCrossword] = useState<Crossword | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (id) loadCrossword(id);
  }, [id]);

  const loadCrossword = async (crosswordId: string) => {
    try {
      setLoading(true);
      const data = await gamesService.getCrossword(parseInt(crosswordId));
      setCrossword(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Não foi possível carregar este jogo de palavras cruzadas.');
      toast.error('Erro ao carregar jogo');
    } finally {
      setLoading(false);
    }
  };

  const clues: CrosswordClue[] = useMemo(() => {
    // Get clues from API
    const fromApi = crossword?.clues;
    if (Array.isArray(fromApi) && fromApi.length > 0) {
      return fromApi.map((c: any) => ({
        id: c.id,
        number: c.number || c.id,
        clue: c.clue_text || c.clue || `Pista ${c.number || c.id}`,
        answer: c.answer,
        length: c.answer?.length || c.length || 0,
        direction: c.direction,
        row: c.row,
        col: c.col,
        crossword: c.crossword,
      }));
    }
    // Fallback sample clues
    return [
      { id: 1, number: 1, clue: 'Capital de Angola', answer: 'LUANDA', length: 6 },
      { id: 2, number: 2, clue: 'Continente onde fica Angola', answer: 'AFRICA', length: 6 },
      { id: 3, number: 3, clue: 'Idioma oficial de Angola', answer: 'PORTUGUES', length: 9 },
    ];
  }, [crossword]);

  const handleChange = (clueId: string | number, value: string) => {
    setAnswers((prev) => ({ ...prev, [String(clueId)]: value }));
  };

  const handleCheck = async () => {
    if (!id || !crossword || isFinished) return;
    
    setChecked(true);
    const total = clues.length;
    const correct = clues.filter((c) => {
      if (!c.answer) return false;
      const val = (answers[String(c.id)] || '').trim().toUpperCase();
      return val === c.answer.toUpperCase();
    }).length;
    
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      const result = await gamesService.submitCrosswordAnswers(
        parseInt(id),
        answers,
        timeTaken
      );
      
      setScore(result.score || 0);
      setIsFinished(true);
      toast.success(`Você acertou ${correct} de ${total} pistas!`);
      
      // Load leaderboard
      const leaderboardData = await gamesService.getCrosswordLeaderboard(parseInt(id));
      setLeaderboard(leaderboardData);
    } catch (err: any) {
      console.error(err);
      toast.error('Erro ao submeter respostas');
    }
  };

  if (loading) return <Layout><LoadingSpinner text="Carregando palavras cruzadas..." /></Layout>;
  if (error || !crossword) return <Layout><div className="p-6 text-red-600">{error || 'Jogo não encontrado.'}</div></Layout>;

  const correctCount = clues.filter((c) => {
    if (!c.answer) return false;
    const val = (answers[String(c.id)] || '').trim().toUpperCase();
    return val === c.answer.toUpperCase();
  }).length;

  return (
    <Layout>
      <div className="bg-gradient-to-r from-orange-600 to-amber-700 text-white py-10">
        <div className="max-w-5xl mx-auto px-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/jogos/palavras-cruzadas')}
            className="hover:bg-white/20 p-2 rounded transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
            <BookOpen className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{crossword.title}</h1>
            <p className="text-orange-100 mt-1">{crossword.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {!isFinished ? (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Responda às pistas</h3>
            <div className="space-y-4">
              {clues.map((clue) => {
                const val = answers[String(clue.id)] || '';
                const isCorrect = clue.answer && val.trim().toUpperCase() === clue.answer.toUpperCase();
                return (
                  <div key={clue.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-900 font-semibold">
                        <span className="text-sm text-gray-500">#{clue.number || clue.id}</span>
                        <span>{clue.clue}</span>
                      </div>
                      {checked && clue.answer && (
                        isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-sm font-semibold"><CheckCircle className="h-4 w-4" /> Correto</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 text-sm font-semibold"><XCircle className="h-4 w-4" /> Rever</span>
                        )
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <input
                        value={val}
                        onChange={(e) => handleChange(clue.id, e.target.value)}
                        placeholder={clue.length ? `${clue.length} letras` : 'Sua resposta'}
                        disabled={checked}
                        className={`flex-1 px-3 py-2 rounded border focus:ring-2 focus:ring-orange-500 ${
                          checked && clue.answer
                            ? isCorrect
                              ? 'border-emerald-400 bg-emerald-50'
                              : 'border-rose-300 bg-rose-50'
                            : 'border-gray-300'
                        }`}
                      />
                      {clue.length && (
                        <span className="text-xs text-gray-500 bg-white border border-gray-200 rounded px-2 py-1">{clue.length} letras</span>
                      )}
                    </div>
                    {checked && clue.answer && !isCorrect && (
                      <p className="mt-2 text-xs text-gray-600">Resposta correta: {clue.answer}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button onClick={handleCheck} disabled={checked}>Verificar respostas</Button>
              {checked && (
                <span className="text-sm text-gray-700">Acertos: {correctCount} / {clues.length}</span>
              )}
            </div>
          </Card>
        ) : (
          <Card className="text-center p-6">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Palavras Cruzadas Concluídas!</h2>
              <p className="text-gray-700 mb-4">Você completou todas as pistas!</p>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-orange-700">{score}%</div>
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

            <Button onClick={() => navigate('/jogos/palavras-cruzadas')}>
              Voltar às Palavras Cruzadas
            </Button>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CrosswordsDetailPage;
