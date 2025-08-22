import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ParticipantsPage from './pages/ParticipantsPage';
import RankingPage from './pages/RankingPage';
import VotingPage from './pages/VotingPage';
import GamesPage from './pages/GamesPage';
import GameList from './pages/GameList';
import QuizPage from './pages/QuizPage';
import SimulatorPage from './pages/SimulatorPage';
import SimulatorDetailPage from './pages/SimulatorDetailPage';
import InteractiveSimulatorPage from './pages/InteractiveSimulatorPage';
import GenericSimulatorPage from './pages/GenericSimulatorPage';
import GenericSimulatorDashboard from './pages/GenericSimulatorDashboard';
import SimulatorOnboarding from './pages/SimulatorOnboarding';
import AssociationPage from './pages/AssociationPage';
import AssociationDetailPage from './pages/AssociationDetailPage';
import SeasonsPage from './pages/SeasonsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import SeasonDetailPage from './pages/SeasonDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import ParticipantProfilePage from './pages/ParticipantProfilePage';
import MediaManagementPage from './pages/MediaManagementPage';
import ContentPage from './pages/ContentPage';
import BlogPage from './pages/BlogPage';
import SimuladoresPage from './pages/SimuladoresPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registo" element={<RegisterPage />} />
          <Route path="/blog" element={<BlogPage />} />
          {/* Rotas protegidas */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/participants" element={<ProtectedRoute><ParticipantsPage /></ProtectedRoute>} />
          <Route path="/participantes" element={<ProtectedRoute><ParticipantsPage /></ProtectedRoute>} />
          <Route path="/ranking" element={<ProtectedRoute><RankingPage /></ProtectedRoute>} />
          <Route path="/classificacao" element={<ProtectedRoute><RankingPage /></ProtectedRoute>} />
          <Route path="/voting" element={<ProtectedRoute><VotingPage /></ProtectedRoute>} />
          <Route path="/votar" element={<ProtectedRoute><VotingPage /></ProtectedRoute>} />
          <Route path="/jogos" element={<ProtectedRoute><GamesPage /></ProtectedRoute>} />
          <Route path="/games" element={<ProtectedRoute><GameList /></ProtectedRoute>} />
          <Route path="/jogos/quiz/:id" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/jogos/simulador" element={<ProtectedRoute><SimulatorPage /></ProtectedRoute>} />
          <Route path="/jogos/simuladores/:id" element={<ProtectedRoute><SimulatorDetailPage /></ProtectedRoute>} />
          <Route path="/jogos/simuladores/:id/interactive" element={<ProtectedRoute><InteractiveSimulatorPage /></ProtectedRoute>} />
          <Route path="/jogos/simuladores/:id/generic" element={<ProtectedRoute><GenericSimulatorPage simulatorId={":id"} /></ProtectedRoute>} />
          <Route path="/jogos/simuladores/:id/dashboard" element={<ProtectedRoute><GenericSimulatorDashboard simulatorId={":id"} /></ProtectedRoute>} />
          <Route path="/jogos/simulador/onboarding" element={<ProtectedRoute><SimulatorOnboarding /></ProtectedRoute>} />
          <Route path="/jogos/associacao" element={<ProtectedRoute><AssociationPage /></ProtectedRoute>} />
          <Route path="/jogos/associacao/:id" element={<ProtectedRoute><AssociationDetailPage /></ProtectedRoute>} />
          <Route path="/temporadas" element={<ProtectedRoute><SeasonsPage /></ProtectedRoute>} />
          <Route path="/temporadas/:id" element={<ProtectedRoute><SeasonDetailPage /></ProtectedRoute>} />
          <Route path="/media" element={<ProtectedRoute><MediaManagementPage /></ProtectedRoute>} />
          <Route path="/conteudos" element={<ProtectedRoute><ContentPage /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
          <Route path="/participante/:id" element={<ProtectedRoute><ParticipantProfilePage /></ProtectedRoute>} />
          <Route path="/simuladores" element={<ProtectedRoute><SimuladoresPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
