import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { mcpFetch } from '../mcpClient';
import { Question } from '../types/Question';

const QuizPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    if (id) loadQuiz(id);
  }, [id]);

  const loadQuiz = async (quizId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await mcpFetch(`/api/games/quiz/${quizId}/questions/`);
      setQuestions(data.results || data);
    } catch (err) {
      setError('Erro ao carregar quiz.');
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
          // Fetch leaderboard
          const { data } = await mcpFetch(`/api/games/quiz/quizzes/${id}/leaderboard/`);
          setLeaderboard(data.leaderboard || []);
        } catch {}
      };
      submitAndFetchLeaderboard();
    }
  }, [current, questions.length, answers, id]);

  if (loading) {
    return <Layout><LoadingSpinner text="Carregando quiz..." /></Layout>;
  }
  if (error) {
    return <Layout><p className="text-red-500">{error}</p></Layout>;
  }
  if (current >= questions.length) {
    return (
      <Layout>
        <Card title="Quiz finalizado">
          <div className="mb-4">Obrigado por participar!</div>
          {score !== null && <div className="mb-2 font-bold">Sua pontuação: {score}</div>}
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Leaderboard</h4>
            <ul className="pl-4">
              {leaderboard.length === 0 && <li>Nenhum resultado ainda.</li>}
              {leaderboard.map((entry, idx) => (
                <li key={idx} className="mb-1">
                  <span className="font-bold">{entry.user}</span>: {entry.score} pontos
                </li>
              ))}
            </ul>
          </div>
        </Card>
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
