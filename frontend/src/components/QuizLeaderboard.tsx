import React from 'react';
import { Card } from './common';

interface LeaderboardEntry {
  user?: string;
  username?: string;
  name?: string;
  score: number;
}

interface QuizLeaderboardProps {
  entries: LeaderboardEntry[];
  seasonNumber: number;
  currentUser?: string;
}

const QuizLeaderboard: React.FC<QuizLeaderboardProps> = ({ entries, seasonNumber, currentUser }) => {
  if (!entries.length) {
    return <Card className="mb-4"><div>Nenhum resultado ainda.</div></Card>;
  }
  return (
    <Card title={`Leaderboard (Temporada ${seasonNumber})`}>
      <ul className="pl-4 divide-y divide-gray-200">
        {entries.map((entry, idx) => (
          <li key={idx} className={`py-2 flex items-center ${entry.user === currentUser || entry.username === currentUser || entry.name === currentUser ? 'bg-yellow-50 font-bold' : ''}`}>
            <span className="font-bold mr-2">{entry.user || entry.username || entry.name}</span>
            <span className="ml-auto text-blue-700 font-bold">{entry.score} pontos</span>
            {(entry.user === currentUser || entry.username === currentUser || entry.name === currentUser) && <span className="ml-2 text-yellow-600">(Você)</span>}
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default QuizLeaderboard;
