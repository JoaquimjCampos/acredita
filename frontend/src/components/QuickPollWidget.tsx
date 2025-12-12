import React, { useState } from 'react';
import { Card, Button } from './common';

const pollOptions = [
  'Sim, estou a gostar muito!',
  'Está bom, mas pode melhorar',
  'Não estou a gostar',
];

const QuickPollWidget: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // TODO: Integrate with backend API or service
  };

  return (
    <Card className="p-4 mb-4 bg-white/90 shadow rounded-xl animate-fade-in">
      <h3 className="text-lg font-bold text-acredita-primary mb-2">Rápida Enquete</h3>
      {submitted ? (
        <div className="text-green-600 text-center">Obrigado por votar!</div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {pollOptions.map(opt => (
            <label key={opt} className="flex items-center gap-2">
              <input
                type="radio"
                name="poll"
                value={opt}
                checked={selected === opt}
                onChange={() => setSelected(opt)}
                required
              />
              <span>{opt}</span>
            </label>
          ))}
          <Button type="submit" size="sm" className="self-end" disabled={!selected}>Votar</Button>
        </form>
      )}
    </Card>
  );
};

export default QuickPollWidget;
