import React, { useState, useEffect } from 'react';
import { Button } from '../components/common';
import { ArrowRight, TrendingUp, Users, Zap, Award, ShoppingBag, Calendar, Gamepad2 } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { useNavigate } from 'react-router-dom';
import { useUserEngagement } from '../hooks/useUserEngagement';
import { useCTAPersonalization } from '../hooks/useCTAPersonalization';

interface HeroVariantProps {
  variant?: 'A' | 'B';
  onCTAClick?: (label: string) => void;
}

/**
 * HeroVariant Component
 * Renders hero section with A/B test variants
 * Variant A: Text-only (default)
 * Variant B: With image + secondary CTA (personalized based on user engagement)
 */
const HeroVariant: React.FC<HeroVariantProps> = ({ variant = 'A', onCTAClick }) => {
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState<'A' | 'B'>(variant);
  const { primary_engagement, primary_percentage } = useUserEngagement();
  const personalized = useCTAPersonalization(primary_engagement);

  // Get icon for personalized CTA
  const getPersonalizedIcon = () => {
    const iconMap: Record<string, typeof Award> = {
      'kixikila': Award,
      'marketplace': ShoppingBag,
      'seasons': Calendar,
      'games': Gamepad2
    };
    return iconMap[personalized.module] || ShoppingBag;
  };

  // Detect variant from query param (for A/B testing)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryVariant = params.get('hero-variant') as 'A' | 'B' | null;
    if (queryVariant && ['A', 'B'].includes(queryVariant)) {
      setSelectedVariant(queryVariant);
      // Track which variant user is seeing
      trackEvent({
        name: 'hero-variant-exposed',
        page: 'home',
        variant: queryVariant,
      });
    }
  }, []);

  const handlePrimaryCTA = () => {
    trackEvent({
      name: 'hero-cta-click',
      page: 'home',
      cta_type: 'primary',
      label: 'dashboard',
      variant: selectedVariant,
      primary_engagement: primary_engagement,
    });
    navigate('/dashboard');
    onCTAClick?.('dashboard');
  };

  const handleSecondaryCTA = () => {
    trackEvent({
      name: 'hero-cta-click',
      page: 'home',
      cta_type: 'secondary',
      label: personalized.label,
      variant: selectedVariant,
      primary_engagement: primary_engagement,
      personalized: true,
      engagement_percentage: primary_percentage,
    });
    navigate(personalized.path);
    onCTAClick?.(personalized.label);
  };

  if (selectedVariant === 'B') {
    return (
      <section className="relative bg-gradient-to-br from-acredita-primary via-acredita-dark to-acredita-primary min-h-screen flex items-center overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left: Content */}
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight">
                Ganhe Dinheiro
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
                  em Comunidade
                </span>
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-md leading-relaxed">
                Participe em grupos de poupança, venda serviços, obtenha certificações e ganhe reputação.
              </p>
            </div>

            {/* Stats Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-full">
                <Users className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-semibold">5.000+ Membros</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-300" />
                <span className="text-sm font-semibold">+1M Poupado</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-full">
                <Zap className="w-4 h-4 text-blue-300" />
                <span className="text-sm font-semibold">Sem Taxas Ocultas</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={handlePrimaryCTA}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Entrar no Dashboard
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                onClick={handleSecondaryCTA}
                className="border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-3 rounded-lg transition-all flex items-center gap-2"
              >
                {personalized.label}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Trust indicator */}
            <div className="pt-4 border-t border-white/20">
              <p className="text-sm text-white/70">
                ✓ Seguro e verificado • ✓ Sem dados pessoais • ✓ Suporte 24/7
              </p>
            </div>
          </div>

          {/* Right: Image/Illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              {/* Placeholder gradient illustration */}
              <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-yellow-300/30 via-orange-300/30 to-red-300/30 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                <div className="text-center text-white/60">
                  <Zap className="w-24 h-24 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">Imagem de Comunidade</p>
                  <p className="text-sm">(Substitua por imagem real)</p>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-8 -right-8 bg-white text-acredita-primary font-bold px-4 py-2 rounded-full shadow-lg">
                +85% ROI
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-green-400 text-white font-bold px-4 py-2 rounded-full shadow-lg">
                Variante B
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Variant A (default)
  return (
    <section className="relative bg-gradient-to-b from-acredita-primary to-acredita-dark min-h-screen flex items-center overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center min-h-screen flex flex-col justify-center space-y-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
          Bem-vindo ao{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
            Acredita
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
          A primeira plataforma que une Reality TV com Finanças Colaborativas em Angola — vote, poupe e cresça sem taxas ocultas.
        </p>

        {/* Social Proof Chips */}
        <div className="flex flex-wrap justify-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-full">
            <Users className="w-4 h-4 text-yellow-300" />
            <span className="text-sm font-semibold text-white">5.000+ Membros</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-full">
            <TrendingUp className="w-4 h-4 text-green-300" />
            <span className="text-sm font-semibold text-white">+1M Poupado</span>
          </div>
        </div>

        {/* Primary CTA */}
        <Button
          onClick={handlePrimaryCTA}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all mx-auto flex items-center justify-center gap-2"
        >
          Entrar no Dashboard
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </section>
  );
};

export default HeroVariant;
