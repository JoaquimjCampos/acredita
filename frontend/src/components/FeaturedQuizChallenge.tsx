import React from 'react';
import { Card } from '../components/common';

const FeaturedQuizChallenge: React.FC = () => (
  <Card className="p-8 bg-gradient-to-br from-acredita-primary/10 to-white shadow-xl border-2 border-acredita-primary animate-fade-in mb-12">
    <div className="flex flex-col md:flex-row items-center gap-8">
      <div className="flex-1">
        <h2 className="text-3xl font-extrabold text-acredita-primary mb-2">Quiz Challenge da Temporada</h2>
        <p className="text-lg text-gray-700 mb-4">Participe do quiz, suba no ranking e ganhe badges e prêmios exclusivos!</p>
        <a
          href="/quiz"
          className="bg-acredita-primary text-white px-6 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-acredita-secondary transition-all duration-200 inline-block text-center"
          style={{ textDecoration: 'none' }}
        >
          Participar Agora
        </a>
      </div>
      <div className="flex flex-col items-center">
  <img src="/static/catoca.png" alt="Quiz Challenge patrocinado por Catoca" className="h-24 mb-2" loading="lazy" />
        <span className="text-xs text-gray-500">Patrocinado por Catoca</span>
      </div>
    </div>
  </Card>
);

export default FeaturedQuizChallenge;
