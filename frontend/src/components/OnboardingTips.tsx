import React from 'react';

const OnboardingTips: React.FC = () => (
  <aside className="bg-acredita-primary/10 border-l-4 border-acredita-primary p-6 rounded-lg mb-8 animate-fade-in" aria-label="Dicas de Onboarding">
    <h2 className="text-xl font-bold text-acredita-primary mb-2">Dicas para Começar</h2>
    <ul className="list-disc pl-5 text-gray-700 space-y-1">
      <li>Explore todos os jogos para maximizar sua pontuação e aprendizado.</li>
      <li>Complete seu perfil para desbloquear conquistas especiais.</li>
      <li>Participe dos rankings semanais para ganhar prêmios.</li>
      <li>Convide amigos para jogar e ganhe pontos extras!</li>
      <li>Fique atento às notificações para eventos e desafios exclusivos.</li>
    </ul>
  </aside>
);

export default OnboardingTips;
