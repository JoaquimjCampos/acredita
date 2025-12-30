import React from 'react';
import { Card } from './common';
import { Trophy, Zap } from 'lucide-react';

interface LeaderboardEntry {
  user?: string;
  username?: string;
  name?: string;
  score: number;
  time_taken?: number;
  correct_answers?: number;
  total_answers?: number;
}

interface QuizLeaderboardProps {
  entries: LeaderboardEntry[];
  seasonNumber: number;
  currentUser?: string;
}

const getMedalIcon = (position: number) => {
  switch (position) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Trophy className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Trophy className="h-5 w-5 text-orange-600" />;
    default:
      return null;
  }
};

const getMedalColor = (position: number) => {
  switch (position) {
    case 1:
      return 'bg-yellow-50 border-l-4 border-yellow-500';
    case 2:
      return 'bg-gray-50 border-l-4 border-gray-400';
    case 3:
      return 'bg-orange-50 border-l-4 border-orange-600';
    default:
      return 'bg-white';
  }
};

const QuizLeaderboard: React.FC<QuizLeaderboardProps> = ({ entries, seasonNumber, currentUser }) => {
  if (!entries || entries.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Zap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">Nenhum resultado no leaderboard ainda. Seja o primeiro a jogar!</p>
      </Card>
    );
  }

  const isCurrentUser = (entry: LeaderboardEntry) => 
    entry.user === currentUser || entry.username === currentUser || entry.name === currentUser;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-900">Top Jogadores</h2>
        <span className="text-sm text-gray-600 ml-auto">Temporada {seasonNumber}</span>
      </div>

      <div className="space-y-2">
        {entries.map((entry, idx) => {
          const position = idx + 1;
          const isUser = isCurrentUser(entry);
          const userName = entry.user || entry.username || entry.name || 'Anônimo';

          return (
            <div
              key={idx}
              className={`p-4 rounded-lg transition-all ${getMedalColor(position)} ${
                isUser ? 'ring-2 ring-cyan-500' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {position}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-gray-900 truncate ${isUser ? 'text-cyan-700' : ''}`}>
                      {userName}
                    </p>
                    {getMedalIcon(position) && (
                      <div className="flex-shrink-0">
                        {getMedalIcon(position)}
                      </div>
                    )}
                    {isUser && (
                      <span className="ml-auto text-xs font-semibold px-2 py-1 bg-cyan-200 text-cyan-900 rounded">
                        Você
                      </span>
                    )}
                  </div>
                  {entry.correct_answers !== undefined && entry.total_answers !== undefined && (
                    <p className="text-xs text-gray-600 mt-1">
                      {entry.correct_answers}/{entry.total_answers} respostas corretas
                    </p>
                  )}
                  {entry.time_taken && (
                    <p className="text-xs text-gray-600">
                      Tempo: {Math.round(entry.time_taken)}s
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className="text-2xl font-bold text-cyan-600">{entry.score}</div>
                  <div className="text-xs text-gray-500">pontos</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          💡 <strong>Dica:</strong> Continue jogando e suba no ranking! Cada resposta correta vale pontos.
        </p>
      </div>
    </Card>
  );
};

export default QuizLeaderboard;
