import React, { useEffect } from 'react';
import './i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { analyticsService } from './services/analytics';
import HomePage from './pages/HomePage';
import UpgradePage from './pages/UpgradePage';
import SeasonDetailsPage from './pages/SeasonDetailsPage';
import DashboardPage from './pages/DashboardPage';
import ParticipantsPage from './pages/ParticipantsPage';
import RankingPage from './pages/RankingPage';
import VotingPage from './pages/VotingPage';
import GamesPage from './pages/GamesPage';
import { default as QuizList } from './pages/QuizListPage';
import GameList from './pages/GameList';
import QuizPage from './pages/QuizPage';
import SimulatorPage from './pages/SimulatorPage';
import SimulatorDetailPage from './pages/SimulatorDetailPage';
import InteractiveSimulatorPage from './pages/InteractiveSimulatorPage';
import GenericSimulatorPage from './pages/GenericSimulatorPage';
import GenericSimulatorDashboard from './pages/GenericSimulatorDashboard';
import SimulatorOnboarding from './pages/SimulatorOnboarding';
import SimulatorListPage from './pages/SimulatorListPage';
import AssociationPage from './pages/AssociationPage';
import AssociationDetailPage from './pages/AssociationDetailPage';
import AssociationListPage from './pages/AssociationListPage';
import CrosswordsListPage from './pages/CrosswordsListPage';
import CrosswordsDetailPage from './pages/CrosswordsDetailPage';
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
import CertificationsPage from './pages/CertificationsPage';
import CertificationsDetailPage from './pages/CertificationsDetailPage';
import MarketplaceListPage from './pages/MarketplaceListPage';
import MarketplaceDetailPage from './pages/MarketplaceDetailPage';
import MarketplaceProviderPage from './pages/MarketplaceProviderPage';
import KixikilaDetailPage from './pages/KixikilaDetailPage';
import KixikilaCreatePage from './pages/KixikilaCreatePage';
import KixikilaManagementPage from './pages/KixikilaManagementPage';
import KixikilaContributePage from './pages/KixikilaContributePage';
import KixikilaMembersManagementPage from './pages/KixikilaMembersManagementPage';
import KixikilaLeaderboardPage from './pages/KixikilaLeaderboardPage';
import QuizLeaderboardPage from './pages/QuizLeaderboardPage';
import QuizAnalyticsPage from './pages/QuizAnalyticsPage';
import MyEnrollmentsPage from './pages/MyEnrollmentsPage';
import MyOrdersPage from './pages/MyOrdersPage';
import MyGroupsPage from './pages/MyGroupsPage';
import MarketplacePage from './pages/MarketplacePage';
import MarketplaceCreatePage from './pages/MarketplaceCreatePage';
import KixikilaPage from './pages/KixikilaPage';
import DonationsPage from './pages/DonationsPage';
import CartPage from './pages/CartPage';
import ForbiddenPage from './pages/ForbiddenPage';

function App() {
  useEffect(() => {
    // Initialize analytics service on app load
    analyticsService.initialize();
    
    // Track page views on route changes
    const handlePopState = () => {
      analyticsService.trackPageView('page_view', {
        page_path: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <CartProvider>
          <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upgrade" element={<UpgradePage />} />
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
            <Route path="/quizzes" element={<ProtectedRoute><QuizList /></ProtectedRoute>} />
            <Route path="/games" element={<ProtectedRoute><GameList /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><QuizList /></ProtectedRoute>} />
            <Route path="/jogos/quiz/:id" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
            <Route path="/quiz/:id" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
            <Route path="/quiz/:id/leaderboard" element={<ProtectedRoute><QuizLeaderboardPage /></ProtectedRoute>} />
            <Route path="/quiz/:id/analytics" element={<ProtectedRoute><QuizAnalyticsPage /></ProtectedRoute>} />
            <Route path="/jogos/simulador" element={<ProtectedRoute><SimulatorPage /></ProtectedRoute>} />
            <Route path="/jogos/simuladores" element={<ProtectedRoute><SimulatorListPage /></ProtectedRoute>} />
            <Route path="/jogos/simuladores/:id" element={<ProtectedRoute><SimulatorDetailPage /></ProtectedRoute>} />
            <Route path="/jogos/simuladores/:id/interactive" element={<ProtectedRoute><InteractiveSimulatorPage /></ProtectedRoute>} />
            <Route path="/jogos/simuladores/:id/generic" element={<ProtectedRoute><GenericSimulatorPage /></ProtectedRoute>} />
            <Route path="/jogos/simuladores/:id/dashboard" element={<ProtectedRoute><GenericSimulatorDashboard /></ProtectedRoute>} />
            <Route path="/jogos/simulador/onboarding" element={<ProtectedRoute><SimulatorOnboarding /></ProtectedRoute>} />
            <Route path="/jogos/associacao" element={<ProtectedRoute><AssociationListPage /></ProtectedRoute>} />
            <Route path="/jogos/associacao/:id" element={<ProtectedRoute><AssociationDetailPage /></ProtectedRoute>} />
            <Route path="/jogos/palavras-cruzadas" element={<ProtectedRoute><CrosswordsListPage /></ProtectedRoute>} />
            <Route path="/jogos/palavras-cruzadas/:id" element={<ProtectedRoute><CrosswordsDetailPage /></ProtectedRoute>} />
            <Route path="/temporadas" element={<ProtectedRoute><SeasonsPage /></ProtectedRoute>} />
            <Route path="/temporadas/:id" element={<ProtectedRoute><SeasonDetailPage /></ProtectedRoute>} />
            <Route path="/season-details/:id" element={<ProtectedRoute><SeasonDetailsPage /></ProtectedRoute>} />
            <Route path="/media" element={<ProtectedRoute require="canPublishContent"><MediaManagementPage /></ProtectedRoute>} />
            <Route path="/conteudos" element={<ProtectedRoute require="canPublishContent"><ContentPage /></ProtectedRoute>} />
            <Route path="/perfil" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
            <Route path="/participante/:id" element={<ProtectedRoute><ParticipantProfilePage /></ProtectedRoute>} />
            <Route path="/simuladores" element={<ProtectedRoute><SimuladoresPage /></ProtectedRoute>} />
            {/* Novas rotas - Módulos 3 */}
            <Route path="/certifications" element={<ProtectedRoute><CertificationsPage /></ProtectedRoute>} />
            <Route path="/certifications/:id" element={<ProtectedRoute><CertificationsDetailPage /></ProtectedRoute>} />
            <Route path="/my-enrollments" element={<ProtectedRoute><MyEnrollmentsPage /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><MarketplaceListPage /></ProtectedRoute>} />
            <Route path="/marketplace/listing/:id" element={<ProtectedRoute><MarketplaceDetailPage /></ProtectedRoute>} />
            <Route path="/marketplace/provider/:id" element={<ProtectedRoute><MarketplaceProviderPage /></ProtectedRoute>} />
            <Route path="/marketplace/create" element={<ProtectedRoute require="canSellMarketplace"><MarketplaceCreatePage /></ProtectedRoute>} />
            <Route path="/marketplace/:id" element={<ProtectedRoute><MarketplaceDetailPage /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
            <Route path="/kixikila" element={<ProtectedRoute><KixikilaPage /></ProtectedRoute>} />
            <Route path="/kixikila/create" element={<ProtectedRoute><KixikilaCreatePage /></ProtectedRoute>} />
            <Route path="/kixikila/:id" element={<ProtectedRoute><KixikilaDetailPage /></ProtectedRoute>} />
            <Route path="/kixikila/:id/manage" element={<ProtectedRoute><KixikilaManagementPage /></ProtectedRoute>} />
            <Route path="/kixikila/:id/members" element={<ProtectedRoute><KixikilaMembersManagementPage /></ProtectedRoute>} />
            <Route path="/kixikila/:id/contribute" element={<ProtectedRoute><KixikilaContributePage /></ProtectedRoute>} />
            <Route path="/kixikila/leaderboard" element={<ProtectedRoute><KixikilaLeaderboardPage /></ProtectedRoute>} />
            <Route path="/my-groups" element={<ProtectedRoute><MyGroupsPage /></ProtectedRoute>} />
            <Route path="/doacoes" element={<ProtectedRoute><DonationsPage /></ProtectedRoute>} />
            <Route path="/forbidden" element={<ForbiddenPage />} />
          </Routes>
        </Router>
          </CartProvider>
      </AuthProvider>
    </I18nextProvider>
    </ErrorBoundary>
  );
}

export default App;
