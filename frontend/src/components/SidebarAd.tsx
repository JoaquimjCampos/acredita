import React from 'react';
import { Card } from './common';

const SidebarAd: React.FC = () => (
  <Card className="mb-6">
    <div className="flex flex-col items-center">
      <img src="/static/catoca.png" alt="Patrocinador Catoca" className="h-16 mb-2" />
      <span className="text-xs text-gray-600">Patrocinado por Catoca</span>
      <a href="https://catoca.com" target="_blank" rel="noopener noreferrer" className="text-acredita-primary text-xs mt-2 underline">Saiba mais</a>
    </div>
  </Card>
);

export default SidebarAd;
