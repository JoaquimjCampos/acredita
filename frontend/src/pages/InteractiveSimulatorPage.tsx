import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { Badge } from '../components/common/Badge';
import Confetti from '../components/common/Confetti';
import SimulatorLeaderboard from '../components/SimulatorLeaderboard';
import { mcpFetch } from '../mcpClient';

interface Scenario {
  id: number;
  title: string;
  description: string;
  order: number;
  choices: Array<{ text: string; outcome: string; next_scenario_id?: number }>;
}

interface Simulator {
  id: number;
  title: string;
  description: string;
}

interface Session {
  id?: number;
  simulator: number;
  user?: number;
  started_at?: string;
  finished_at?: string;
  choices: Array<{ scenario_id: number; choice: string }>;
  feedback?: string;
}

const InteractiveSimulatorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [simulator, setSimulator] = useState<Simulator | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [theme, setTheme] = useState<'blue'|'green'|'purple'>('blue');
  const [showConfetti, setShowConfetti] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    const fetchSimulator = async () => {
      setLoading(true);
      try {
        const { data: simData } = await mcpFetch(`/api/games/simulator/${id}/`);
        setSimulator(simData);
        const { data: scenData } = await mcpFetch(`/api/games/scenario/?simulator=${id}`);
        setScenarios(scenData.results || scenData);
        setCurrentScenario((scenData.results || scenData)[0]);
        setSession({ simulator: simData.id, choices: [] });
      } catch (err) {
        setError('Erro ao carregar simulador.');
      } finally {
        setLoading(false);
      }
    };
    fetchSimulator();
  }, [id]);

  // Progress indicator
  const currentStep = currentScenario ? scenarios.findIndex(s => s.id === currentScenario.id) + 1 : scenarios.length;
  const totalSteps = scenarios.length;
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  const handleChoice = (choice: { text: string; outcome: string; next_scenario_id?: number }) => {
    if (!currentScenario || !session) return;
    const updatedChoices = [...session.choices, { scenario_id: currentScenario.id, choice: choice.text }];
    setSession({ ...session, choices: updatedChoices });
    if (choice.next_scenario_id) {
      const next = scenarios.find(s => s.id === choice.next_scenario_id);
      setCurrentScenario(next || null);
    } else {
  setCompleted(true);
  setCurrentScenario(null);
    }
  };

  const handleSubmitSession = async () => {
    if (!session) return;
    setLoading(true);
    try {
      await mcpFetch(`/api/games/simulator-session/`, {
        method: 'POST',
        body: JSON.stringify({ ...session, feedback }),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      setError('Erro ao salvar sessão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (completed) {
      handleSubmitSession();
      setShowConfetti(true);
      // Play sound effect
      const audio = new Audio('https://cdn.pixabay.com/audio/2022/10/16/audio_12b6b1b2b7.mp3');
      audio.play();
      setTimeout(() => setShowConfetti(false), 2500);
    }
    // eslint-disable-next-line
  }, [completed]);

  if (loading) return <Layout><LoadingSpinner text="Carregando simulador..." /></Layout>;
  if (error || !simulator) return <Layout><p className="text-red-500">{error || 'Simulador não encontrado.'}</p></Layout>;

  // Color theme classes
  const themeColor = theme === 'blue' ? 'bg-blue-500' : theme === 'green' ? 'bg-green-500' : 'bg-purple-500';
  const themeText = theme === 'blue' ? 'text-blue-700' : theme === 'green' ? 'text-green-700' : 'text-purple-700';
  const bgClass = theme === 'blue' ? 'bg-gradient-to-br from-blue-50 to-blue-200' : theme === 'green' ? 'bg-gradient-to-br from-green-50 to-green-200' : 'bg-gradient-to-br from-purple-50 to-purple-200';

  return (
    <Layout>
      <Confetti show={showConfetti} />
      <div className={`max-w-2xl mx-auto py-8 ${bgClass} min-h-screen transition-all duration-700`}>
        <Card title={simulator.title}>
          <div className="flex items-center mb-4">
            {auth?.user?.foto_perfil ? (
              <img src={auth.user.foto_perfil} alt="avatar" className="h-10 w-10 rounded-full mr-2 border-2 border-gray-300" />
            ) : (
              <UserCircleIcon className={`h-10 w-10 ${themeColor} mr-2`} />
            )}
            <span className={`font-semibold text-lg ${themeText}`}>Simulador Interativo</span>
            <div className="ml-auto flex gap-2">
              <button type="button" className={`px-2 py-1 rounded ${theme === 'blue' ? 'bg-blue-100' : 'bg-gray-100'}`} onClick={() => setTheme('blue')}>Azul</button>
              <button type="button" className={`px-2 py-1 rounded ${theme === 'green' ? 'bg-green-100' : 'bg-gray-100'}`} onClick={() => setTheme('green')}>Verde</button>
              <button type="button" className={`px-2 py-1 rounded ${theme === 'purple' ? 'bg-purple-100' : 'bg-gray-100'}`} onClick={() => setTheme('purple')}>Roxo</button>
            </div>
          </div>
          <p className="mb-4 text-gray-700">{simulator.description}</p>
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
              <div className={`${themeColor} h-3 rounded-full transition-all duration-700`} style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="text-xs text-gray-500 flex justify-between">
              <span>Etapa {currentStep} de {totalSteps}</span>
              <span>{progressPercent}% concluído</span>
            </div>
            {completed && (
              <div className="mt-4 flex justify-center">
                <Badge variant={theme === 'blue' ? 'info' : theme === 'green' ? 'success' : 'default'}>
                  <span role="img" aria-label="medal">🏅</span> Concluído!
                </Badge>
              </div>
            )}
          </div>
          {currentScenario && !completed ? (
            <div>
              <h2 className={`text-xl font-semibold mb-2 ${themeText}`}>{currentScenario.title}</h2>
              <p className="mb-4">{currentScenario.description}</p>
              <div className="space-y-2">
                {currentScenario.choices.map((choice, idx) => (
                  <Button key={idx} className={`w-full ${themeColor} text-white`} onClick={() => handleChoice(choice)}>
                    {choice.text}
                  </Button>
                ))}
              </div>
            </div>
          ) : completed ? (
            <div className={`${themeText} font-bold text-lg mb-4`}>Simulação concluída! Obrigado por participar.</div>
          ) : null}
          {completed && (
            <>
              <form className="mt-6" onSubmit={e => { e.preventDefault(); handleSubmitSession(); }}>
                <label className="block mb-2 font-semibold">Deixe seu feedback:</label>
                <textarea
                  className="w-full border rounded p-2 mb-2"
                  rows={3}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Como foi sua experiência?"
                />
                <Button type="submit" className={`w-full ${themeColor} text-white`}>Enviar Feedback</Button>
              </form>
              <div className="mt-8">
                <SimulatorLeaderboard simulatorId={id!} />
              </div>
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default InteractiveSimulatorPage;
