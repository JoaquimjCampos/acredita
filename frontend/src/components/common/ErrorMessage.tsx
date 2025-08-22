import React from 'react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className }) => (
  <div
    role="alert"
    aria-live="assertive"
    className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative ${className || ''}`}
  >
    <span className="block sm:inline font-semibold">Erro:</span> {message}
  </div>
);
