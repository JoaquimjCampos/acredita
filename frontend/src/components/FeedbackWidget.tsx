import React, { useState } from 'react';
import { Card, Button } from './common';

const FeedbackWidget: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // TODO: Integrate with backend API or service
  };

  return (
    <Card className="p-4 mb-4 bg-white/90 shadow rounded-xl animate-fade-in">
      <h3 className="text-lg font-bold text-acredita-primary mb-2">Feedback</h3>
      {submitted ? (
        <div className="text-green-600 text-center">Obrigado pelo seu feedback!</div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            className="border rounded p-2 text-gray-700"
            rows={3}
            placeholder="Deixe sua sugestão, dúvida ou elogio..."
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            required
          />
          <Button type="submit" size="sm" className="self-end">Enviar</Button>
        </form>
      )}
    </Card>
  );
};

export default FeedbackWidget;
