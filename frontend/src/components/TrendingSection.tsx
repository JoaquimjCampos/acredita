import React from 'react';
import { Card } from './common';

const trendingItems = [
  {
    title: 'Quiz da Semana',
    description: 'Participe do quiz mais popular e suba no ranking!',
    link: '/quiz',
  },
  {
    title: 'História de Sucesso: Maria',
    description: 'Veja como Maria transformou sua ideia em realidade.',
    link: '/participantes/1',
  },
  {
    title: 'Campanha de Doação',
    description: 'Ajude a apoiar projetos sociais em Angola.',
    link: '/donations',
  },
];

const TrendingSection: React.FC = () => (
  <section aria-label="Tendências" className="mb-12 animate-fade-in">
    <Card className="p-8 bg-white/90 shadow-xl rounded-xl">
      <h2 className="text-2xl font-bold text-acredita-primary mb-6">Tendências</h2>
      <ul className="flex flex-col gap-6">
        {trendingItems.map((item, idx) => (
          <li key={idx} className="flex flex-col md:flex-row md:items-center gap-2">
            <a href={item.link} className="font-semibold text-acredita-primary hover:underline text-lg" aria-label={item.title}>{item.title}</a>
            <span className="text-gray-700 text-base">{item.description}</span>
          </li>
        ))}
      </ul>
    </Card>
  </section>
);

export default TrendingSection;
