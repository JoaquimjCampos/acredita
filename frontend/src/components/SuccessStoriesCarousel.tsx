import React from 'react';
import { Card } from '../components/common';

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

const SuccessStoriesCarousel: React.FC = () => (
  <Card className="p-8 bg-white/90 shadow-xl rounded-xl animate-fade-in mb-12">
    <h2 className="text-2xl font-bold text-acredita-primary mb-6 text-center">Histórias de Sucesso</h2>
    <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
      {stories.map((s, idx) => (
        <div key={idx} className="flex flex-col items-center gap-3 max-w-xs">
          <img src={s.image} alt={`Foto de ${s.name}, história de sucesso`} className="h-16 w-16 rounded-full border mb-2" loading="lazy" />
          <span className="font-bold text-acredita-primary text-lg">{s.name}</span>
          <p className="text-gray-700 text-base text-center">{s.story}</p>
        </div>
      ))}
    </div>
  </Card>
);

export default SuccessStoriesCarousel;
