import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { AdsBannerList } from '../components/ads/AdsBannerList';
import { useGames, useAds } from '../hooks';
import OnboardingTips from '../components/OnboardingTips';
import { Gamepad2, HelpCircle, Puzzle, Brain } from 'lucide-react';

// Tipos importados dos hooks

const GamesPage: React.FC = () => {
  const { games, loading: gamesLoading, error: gamesError } = useGames();
  const { ads, loading: adsLoading, error: adsError } = useAds();

  if (gamesLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner text="Carregando jogos..." />
        </div>
      </Layout>
    );
  }

  if (gamesError) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-500">{gamesError}</p>
        </div>
      </Layout>
    );
  }

  if (adsLoading) {
    return <div className="flex justify-center items-center"><span>A carregar anúncios...</span></div>;
  }
  if (adsError) {
    return <div className="text-red-500">Erro ao carregar anúncios: {adsError.toString()}</div>;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Gamepad2 className="h-8 w-8 text-acredita-primary animate-bounce" aria-hidden="true" />
            Jogos Interativos
            <span className="ml-2 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold animate-pulse">Novo!</span>
          </h1>
          <OnboardingTips />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {games.map((game) => {
              let icon = <Gamepad2 className="h-8 w-8 text-acredita-primary mb-2" aria-hidden="true" />;
              if (game.type === 'quiz') icon = <HelpCircle className="h-8 w-8 text-acredita-primary mb-2 animate-spin-slow" aria-hidden="true" />;
              if (game.type === 'simulator') icon = <Brain className="h-8 w-8 text-acredita-primary mb-2 animate-pulse" aria-hidden="true" />;
              if (game.type === 'association') icon = <Puzzle className="h-8 w-8 text-acredita-primary mb-2 animate-bounce" aria-hidden="true" />;
              return (
                <Card
                  key={game.id}
                  title={game.title}
                  subtitle={game.type}
                  className="flex flex-col h-full transition-transform duration-200 hover:scale-105 hover:shadow-lg focus-within:scale-105 focus-within:shadow-lg border-2 border-transparent hover:border-acredita-primary"
                >
                  <div
                    className="flex flex-col items-center outline-none"
                    tabIndex={0}
                    aria-label={`Jogo: ${game.title}`}
                  >
                    {icon}
                    <p className="mb-4 text-gray-700 flex-1 text-center">{game.description}</p>
                    {/* Gamification badge example */}
                    <span className="inline-block mt-2 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold animate-fade-in">+50 XP</span>
                  </div>
                  <Button
                    className="w-full mt-auto bg-acredita-primary text-white hover:bg-acredita-secondary transition-colors duration-200 focus:ring-2 focus:ring-acredita-primary"
                    onClick={() => {
                      if (game.type === 'quiz') {
                        window.location.href = `/quiz/${game.id}`;
                      } else if (game.type === 'simulator') {
                        window.location.href = `/simuladores`;
                      } else if (game.type === 'association') {
                        window.location.href = `/associacao`;
                      } else {
                        alert('Tipo de jogo não suportado: ' + game.type);
                      }
                    }}
                    aria-label={`Jogar ${game.title}`}
                  >
                    Jogar
                  </Button>
                </Card>
              );
            })}
          </div>
          {/* Banner de publicidade horizontal ao final da página */}
          {ads && ads.length > 0 && (
            <div className="mt-10">
              <AdsBannerList ads={ads} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default GamesPage;
