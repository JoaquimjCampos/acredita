import React from 'react';
import { Card } from './common';

const stories = [
  {
    name: 'Maria',
    story: 'Ganhei o quiz e fui reconhecida na comunidade! Recomendo a todos participarem.',
    image: '/static/avatar1.png',
  },
  {
    name: 'João',
    story: 'Consegui badges e prêmios incríveis. A plataforma mudou minha vida!',
    image: '/static/avatar2.png',
  },
  {
    name: 'Ana',
    story: 'Apoiei causas sociais e fiz novos amigos. Experiência única!',
    image: '/static/avatar3.png',
  },
];

const SuccessStoriesWidget: React.FC = () => (
  <Card className="mb-6 animate-fade-in">
    <h3 className="text-lg font-bold text-acredita-primary mb-2">Histórias de Sucesso</h3>
    <div className="space-y-4">
      {stories.map((s, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <img src={s.image} alt={s.name} className="h-10 w-10 rounded-full border" />
          <div>
            <span className="font-bold text-acredita-primary">{s.name}</span>
            <p className="text-gray-700 text-sm">{s.story}</p>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

export default SuccessStoriesWidget;
