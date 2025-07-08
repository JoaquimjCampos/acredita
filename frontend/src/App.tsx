import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Páginas
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ParticipantsPage from './pages/ParticipantsPage';
import ParticipantProfilePage from './pages/ParticipantProfilePage';
import RankingPage from './pages/RankingPage';
import VotingPage from './pages/VotingPage';
import SeasonsPage from './pages/SeasonsPage';

// Componente de rota protegida
// import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                borderRadius: '0.5rem',
                border: '1px solid #e5e7eb',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          {/* Rotas */}
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registo" element={<RegisterPage />} />
            
            {/* Rotas públicas */}
            <Route path="/participantes" element={<ParticipantsPage />} />
            <Route path="/participantes/:id" element={<ParticipantProfilePage />} />
            <Route path="/classificacao" element={<RankingPage />} />
            <Route path="/temporadas" element={<SeasonsPage />} />
            <Route path="/votar" element={<VotingPage />} />
            
            {/* Rotas protegidas */}
            <Route 
              path="/dashboard" 
              element={
                <DashboardPage />
              } 
            />
            <Route 
              path="/perfil" 
              element={
                <div>Perfil - Em desenvolvimento</div>
              } 
            />
            
            {/* Rota 404 */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-6">Página não encontrada</p>
                    <a href="/" className="text-acredita-primary hover:text-orange-600">
                      Voltar ao início
                    </a>
                  </div>
                </div>
              } 
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
