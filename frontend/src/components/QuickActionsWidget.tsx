import React from 'react';
import { Button } from './common';

const QuickActionsWidget: React.FC = () => (
  <div className="bg-white/90 rounded-xl shadow p-4 flex flex-col gap-3 animate-fade-in" aria-label="Ações rápidas">
    <h3 className="text-lg font-bold text-acredita-primary mb-2">Ações Rápidas</h3>
    <Button className="w-full bg-acredita-primary text-white font-semibold hover:bg-acredita-secondary transition-all duration-200" onClick={() => window.location.href='/voting'} aria-label="Votar agora">Votar Agora</Button>
    <Button className="w-full bg-acredita-secondary text-white font-semibold hover:bg-acredita-primary transition-all duration-200" onClick={() => navigator.share ? navigator.share({ title: 'Acredita', url: window.location.href }) : navigator.clipboard.writeText(window.location.href)} aria-label="Partilhar">Partilhar</Button>
    <Button className="w-full bg-yellow-400 text-acredita-primary font-semibold hover:bg-yellow-500 transition-all duration-200" onClick={() => window.location.href='/registo'} aria-label="Convidar Amigos">Convidar Amigos</Button>
  </div>
);

export default QuickActionsWidget;
