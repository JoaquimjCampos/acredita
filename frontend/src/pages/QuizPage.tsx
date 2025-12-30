import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, LoadingSpinner } from '../components/common';
import { Quiz, Question, QuizSubmission } from '../types/games';
import { gamesService } from '../services/gamesService';
import QuizLeaderboard from '../components/QuizLeaderboard';
import QuizAchievements from '../components/QuizAchievements';
import seasonConfig from '../config/season.json';
import { CheckCircle, XCircle, Clock, Award, Share2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const seasonNumber = seasonConfig.season_number;

  useEffect(() => {
    if (id) loadQuiz(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadQuiz = async (quizId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[QuizPage] Loading quiz:', quizId, 'for season:', seasonNumber);
      
      // Try to fetch quiz directly first
      try {
        const directQuiz = await gamesService.getQuiz(Number(quizId));
        console.log('[QuizPage] Direct quiz fetch successful:', directQuiz);
        setQuiz(directQuiz);
      } catch (directError) {
        console.log('[QuizPage] Direct fetch failed, trying season list:', directError);
        // Fallback to fetching from season list
        const quizzes = await gamesService.getQuizzesBySeason(seasonNumber);
        console.log('[QuizPage] Quizzes response:', quizzes);
        const foundQuiz = quizzes.find((q: Quiz) => String(q.id) === String(quizId));
        
        if (!foundQuiz) throw new Error('Quiz não encontrado para esta temporada.');
        console.log('[QuizPage] Found quiz:', foundQuiz);
        setQuiz(foundQuiz);
      }
      
      // Fetch questions for the quiz
      const questionsData = await gamesService.getQuizQuestions(quizId);
      console.log('[QuizPage] Questions response:', questionsData);
      setQuestions(questionsData);
      
      if (questionsData.length === 0) {
        console.warn('[QuizPage] No questions found for quiz');
        toast.error('Quiz sem perguntas');
      }
    } catch (err: any) {
      console.error('[QuizPage] Error loading quiz:', err);
      setError('Erro ao carregar quiz: ' + (err.message || '')); 
      toast.error('Erro ao carregar o quiz: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (answerIdx: number) => {
    setSelectedAnswerIdx(answerIdx);
  };

  const finishQuiz = async (finalAnswers: number[]) => {
    try {
      console.log('[QuizPage] Finishing quiz with answers:', finalAnswers);
      
      // Calculate score based on correct answers
      let correctCount = 0;
      questions.forEach((q, idx) => {
        const userAnswerIdx = finalAnswers[idx];
        if (userAnswerIdx !== undefined && q.answers && q.answers[userAnswerIdx]) {
          if (q.answers[userAnswerIdx].is_correct) {
            correctCount++;
          }
        }
      });

      console.log('[QuizPage] Correct answers:', correctCount, 'Total:', questions.length);
      setScore(correctCount);

      // Submit quiz answers to backend
      try {
        const submitData: QuizSubmission[] = finalAnswers
          .map((answerIdx, questionIdx) => ({
            question_id: questions[questionIdx].id,
            answer_id: questions[questionIdx].answers?.[answerIdx]?.id || 0,
          }))
          .filter(item => item.answer_id > 0);
          
        console.log('[QuizPage] Submitting answers to backend:', submitData);
        if (submitData.length > 0) {
          await gamesService.submitQuizAnswers(Number(id), submitData);
          console.log('[QuizPage] Answers submitted successfully');
        }
      } catch (submitErr) {
        console.error('Erro ao submeter respostas:', submitErr);
        // Don't fail - continue to show results
      }

      // Fetch leaderboard
      try {
        const leaderboardData = await gamesService.getQuizLeaderboard(Number(id), seasonNumber);
        console.log('[QuizPage] Leaderboard response:', leaderboardData);
        setLeaderboard(leaderboardData);
      } catch (e) {
        console.error('Erro ao carregar leaderboard:', e);
      }

      // Mark quiz as finished - this triggers the results screen
      setIsFinished(true);
      
      toast.success('Quiz finalizado! Confira sua pontuação.');
    } catch (err) {
      console.error('Erro ao finalizar quiz:', err);
      toast.error('Erro ao finalizar o quiz');
    }
  };

  const percentComplete = questions.length > 0 ? ((current) / questions.length) * 100 : 0;
  const totalPoints = questions.length * 10;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner text="Carregando quiz..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4">
            <Card className="p-8 text-center border-l-4 border-red-500">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Erro ao Carregar Quiz</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/jogos')}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar aos Jogos
              </button>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // Quiz completed - show results
  if (isFinished && score !== null) {
    const percentage = questions.length > 0 ? (score / questions.length) * 100 : 0;
    const earnedPoints = score * 10;
    
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            {/* Results Header */}
            <Card className="p-8 text-center border-t-4 border-cyan-600 mb-8">
              <div className="mb-6">
                {percentage >= 70 ? (
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                ) : (
                  <Award className="h-16 w-16 text-yellow-500 mx-auto" />
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {percentage >= 90 ? 'Excelente!' : percentage >= 70 ? 'Muito Bem!' : 'Bom Esforço!'}
              </h1>
              <p className="text-gray-600 mb-6">Você concluiu o quiz "{quiz?.title}"</p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{score}</div>
                  <div className="text-sm text-gray-600">Respostas Corretas</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{questions.length - score!}</div>
                  <div className="text-sm text-gray-600">Respostas Erradas</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">+{earnedPoints}</div>
                  <div className="text-sm text-gray-600">Pontos XP</div>
                </div>
              </div>

              {/* Score Percentage */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold text-gray-900">Pontuação Final</span>
                  <span className="text-lg font-bold text-cyan-600">{percentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => navigate('/jogos')}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Voltar aos Jogos
                </button>
                <button
                  onClick={() => {
                    navigator.share?.({
                      title: `Quiz ${quiz?.title}`,
                      text: `Marquei ${percentage.toFixed(0)}% no quiz "${quiz?.title}" na plataforma Acredita!`,
                    }).catch(() => {
                      toast.success('Resultado copiado para compartilhar!');
                    });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" /> Compartilhar
                </button>
              </div>
            </Card>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <QuizLeaderboard entries={leaderboard} seasonNumber={seasonNumber} />
            )}

            {/* Achievements */}
            <QuizAchievements 
              score={score!}
              totalQuestions={questions.length}
              correctAnswers={score!}
            />
          </div>
        </div>
      </Layout>
    );
  }

  // Quiz in progress - show current question
  const q = questions[current];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header with quiz title and progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{quiz?.title}</h1>
                <p className="text-sm text-gray-600">{quiz?.category}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-cyan-600">{current + 1}/{questions.length}</div>
                <div className="text-sm text-gray-600">Pergunta</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <Card className="p-8 mb-6 shadow-lg">
            <div className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {current + 1}
                </div>
                <h2 className="text-xl font-bold text-gray-900 flex-1">{q?.text}</h2>
              </div>

              {q?.difficulty && (
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      q.difficulty === 'Fácil'
                        ? 'bg-green-100 text-green-800'
                        : q.difficulty === 'Médio'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>
              )}
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {q?.answers && q.answers.map((answer: any, idx: number) => {
                const isSelected = selectedAnswerIdx === idx;
                const isCorrect = answer?.is_correct;
                const shouldShowFeedback = showFeedback && isSelected;
                
                return (
                <button
                  key={idx}
                  onClick={() => !showFeedback && handleSelectAnswer(idx)}
                  disabled={showFeedback}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    shouldShowFeedback
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : isSelected
                      ? 'border-cyan-600 bg-cyan-50'
                      : 'border-gray-200 bg-white hover:border-cyan-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-all ${
                        shouldShowFeedback
                          ? isCorrect
                            ? 'border-green-500 bg-green-500'
                            : 'border-red-500 bg-red-500'
                          : isSelected
                          ? 'border-cyan-600 bg-cyan-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {shouldShowFeedback ? (
                        isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <XCircle className="w-4 h-4 text-white" />
                        )
                      ) : isSelected ? (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      ) : null}
                    </div>
                    <span
                      className={`text-lg ${
                        shouldShowFeedback
                          ? isCorrect
                            ? 'font-semibold text-green-900'
                            : 'font-semibold text-red-900'
                          : isSelected ? 'font-semibold text-cyan-900' : 'text-gray-700'
                      }`}
                    >
                      {answer?.text}
                    </span>
                  </div>
                </button>
                );
              })}
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-3">
            {current > 0 && (
              <button
                onClick={() => {
                  setCurrent(current - 1);
                  setSelectedAnswerIdx(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors"
              >
                ← Anterior
              </button>
            )}
            <button
              onClick={() => {
                if (selectedAnswerIdx === null) {
                  toast.error('Selecione uma resposta');
                  return;
                }
                
                // If showing feedback, move to next question or finish
                if (showFeedback) {
                  const newAnswers = [...userAnswers, selectedAnswerIdx];
                  setShowFeedback(false);
                  if (current === questions.length - 1) {
                    finishQuiz(newAnswers);
                  } else {
                    setUserAnswers(newAnswers);
                    setSelectedAnswerIdx(null);
                    setCurrent(current + 1);
                  }
                  return;
                }
                
                // First time - show feedback
                setShowFeedback(true);
              }}
              disabled={selectedAnswerIdx === null}
              className={`flex-1 py-3 px-4 rounded-lg font-bold transition-colors text-white ${
                selectedAnswerIdx === null
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-700'
              }`}
            >
              {showFeedback 
                ? (current === questions.length - 1 ? 'Finalizar Quiz' : 'Próxima →')
                : 'Verificar Resposta'}
            </button>
          </div>

          {/* Quick Info */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <Clock className="h-5 w-5 text-gray-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Pergunta</div>
              <div className="text-lg font-bold text-gray-900">{current + 1} de {questions.length}</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Respondidas</div>
              <div className="text-lg font-bold text-gray-900">{userAnswers.length}</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow-sm">
              <Award className="h-5 w-5 text-yellow-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Pontos Possíveis</div>
              <div className="text-lg font-bold text-gray-900">+{totalPoints}</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default QuizPage;
