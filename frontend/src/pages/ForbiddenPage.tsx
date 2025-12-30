import React from 'react';
import { Link } from 'react-router-dom';

const ForbiddenPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow rounded p-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Acesso Negado</h1>
        <p className="text-gray-600 mb-6">Não tem permissões para aceder a esta página.</p>
        <Link to="/" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Voltar ao início</Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;
