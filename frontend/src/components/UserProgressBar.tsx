import React from 'react';
import { Badge } from './common';

interface UserProgressBarProps {
  totalXP: number;
  completedGames: number;
  completedSimulators: number;
}

export const UserProgressBar: React.FC<UserProgressBarProps> = ({ totalXP, completedGames, completedSimulators }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center gap-4">
        <Badge variant="success" size="md">XP Total: {totalXP}</Badge>
        <Badge variant="info" size="md">Jogos Completos: {completedGames}</Badge>
        <Badge variant="info" size="md">Simuladores Completos: {completedSimulators}</Badge>
      </div>
      <div className="mt-2 sm:mt-0 text-xs text-gray-500">Progresso do utilizador</div>
    </div>
  );
};
