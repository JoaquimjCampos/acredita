import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { Question } from '../types/Question';
import { apiService } from '../services/api';
import QuizLeaderboard from '../components/QuizLeaderboard';
import seasonConfig from '../config/season.json';

const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const seasonNumber = seasonConfig.season_number;
  const api = apiService;

  // Move loadQuiz above useEffect
  useEffect(() => {
    if (id) loadQuiz(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadQuiz = async (quizId: string) => {
    try {
      setLoading(true);
      setError(null);
  // Fetch quizzes for the current season and filter by id
  const quizzesRes = await api.getQuizzesBySeason(seasonNumber);
  const quizzes = Array.isArray(quizzesRes) ? quizzesRes : quizzesRes.results;
  const quiz = Array.isArray(quizzes) ? quizzes.find((q: any) => String(q.id) === String(quizId)) : undefined;
      if (!quiz) throw new Error('Quiz não encontrado para esta temporada.');
  // Fetch questions for the quiz
  // Add a public method to ApiService for fetching quiz questions
  const questionsRes = await apiService.getQuizQuestions(quizId);
  setQuestions(Array.isArray(questionsRes) ? questionsRes : []);
    } catch (err: any) {
      setError('Erro ao carregar quiz: ' + (err.message || '')); 
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIdx: number) => {
    setAnswers([...answers, optionIdx]);
    setCurrent(current + 1);
  };

  useEffect(() => {
    if (current >= questions.length && answers.length > 0) {
      const submitAndFetchLeaderboard = async () => {
        try {
          // Simulate answer submission (replace with actual API call)
          // Here, we just count correct answers by index 0
          const correct = answers.filter(a => a === 0).length;
          setScore(correct);
          // Fetch leaderboard for current season
          const leaderboardRes = await api.getQuizLeaderboard(Number(id), seasonNumber);
          if (Array.isArray(leaderboardRes)) {
            setLeaderboard(leaderboardRes);
          } else if (leaderboardRes.results) {
            setLeaderboard(leaderboardRes.results);
          } else if ('leaderboard' in leaderboardRes && Array.isArray(leaderboardRes.leaderboard)) {
            setLeaderboard(leaderboardRes.leaderboard);
          } else {
            setLeaderboard([]);
          }
        } catch {}
      };
      submitAndFetchLeaderboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, questions.length, answers, id, seasonNumber]);

  if (loading) {
    return <Layout><LoadingSpinner text="Carregando quiz..." /></Layout>;
  }
  if (error) {
    return <Layout><p className="text-red-500">{error}</p></Layout>;
  }
  if (current >= questions.length) {
    return (
      <Layout>
        <Card title={`Quiz finalizado - Temporada ${seasonNumber}`}> 
          <div className="mb-4">Obrigado por participar!</div>
          {score !== null && <div className="mb-2 font-bold">Sua pontuação: {score}</div>}
        </Card>
        <QuizLeaderboard entries={leaderboard} seasonNumber={seasonNumber} />
      </Layout>
    );
  }

  const q = questions[current];
  return (
    <Layout>
      <div className="max-w-xl mx-auto py-8">
        <Card title={`Pergunta ${current + 1}`} subtitle={q.text}>
          <div className="space-y-3">
            {q.options.map((opt, idx) => (
              <Button key={idx} className="w-full" onClick={() => handleAnswer(idx)}>
                {opt}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default QuizPage;
