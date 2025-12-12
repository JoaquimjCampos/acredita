import React from 'react';
import { Card } from './common';

const InviteFriendsWidget: React.FC = () => (
  <Card className="mb-6 animate-fade-in">
    <h3 className="text-lg font-bold text-acredita-primary mb-2">Convide Amigos</h3>
    <p className="text-gray-700 text-sm mb-2">Convide amigos para participar e ganhe badges e recompensas exclusivas!</p>
    <button className="bg-acredita-primary text-white px-4 py-2 rounded font-bold shadow hover:bg-acredita-secondary transition-all duration-200">
      Gerar Link de Convite
    </button>
  </Card>
);

export default InviteFriendsWidget;
