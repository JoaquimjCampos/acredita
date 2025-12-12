import React, { useEffect, useState } from 'react';
import { Card } from './common';
import seasonConfig from '../config/season.json';

function getCountdown(endDate: string) {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = end - now;
  if (diff <= 0) return 'Finalizada';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return `${days}d ${hours}h ${minutes}m`;
}

const SeasonCountdownWidget: React.FC = () => {
  const [countdown, setCountdown] = useState(getCountdown(seasonConfig.end_date));
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(seasonConfig.end_date));
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  return (
    <Card className="mb-6 animate-fade-in">
      <h3 className="text-lg font-bold text-acredita-primary mb-2">Contagem Regressiva da Temporada</h3>
      <p className="text-gray-700 text-sm mb-2">Termina em:</p>
      <div className="text-2xl font-extrabold text-acredita-primary mb-2">{countdown}</div>
      <span className="text-xs text-gray-500">{seasonConfig.title}</span>
    </Card>
  );
};

export default SeasonCountdownWidget;
