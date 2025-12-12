import React from 'react';
import { Card } from './common';

const LiveLeaderboardWidget: React.FC = () => (
  <Card className="mb-6 animate-fade-in">
    <h3 className="text-lg font-bold text-acredita-primary mb-2">Leaderboard ao Vivo</h3>
    <p className="text-gray-700 text-sm mb-2">Veja os melhores participantes da temporada em tempo real!</p>
    {/* Placeholder for live leaderboard, can be replaced with actual data */}
    <ul className="divide-y divide-gray-200">
      <li className="py-2 flex justify-between"><span className="font-bold">Maria</span><span className="text-blue-700 font-bold">120 pts</span></li>
      <li className="py-2 flex justify-between"><span className="font-bold">João</span><span className="text-blue-700 font-bold">110 pts</span></li>
      <li className="py-2 flex justify-between"><span className="font-bold">Ana</span><span className="text-blue-700 font-bold">105 pts</span></li>
    </ul>
  </Card>
);

export default LiveLeaderboardWidget;
