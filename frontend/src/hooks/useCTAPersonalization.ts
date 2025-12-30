interface CTAConfig {
  label: string;
  path: string;
  icon: string;
  color: string;
  description: string;
}

interface CTAPersonalizationResult {
  label: string;
  path: string;
  icon: string;
  color: string;
  description: string;
  module: string;
}

/**
 * Hook to get personalized CTA based on user's primary engagement
 * 
 * Maps primary engagement module to appropriate CTA:
 * - kixikila/certifications → "Iniciar Certificação"
 * - marketplace → "Explorar Marketplace"
 * - seasons → "Juntar-se Temporada"
 * - default → "Explorar Oportunidades"
 */
export const useCTAPersonalization = (
  primaryEngagement: string = 'marketplace'
): CTAPersonalizationResult => {
  
  const ctaMap: Record<string, CTAConfig> = {
    'kixikila': {
      label: 'Iniciar Certificação',
      path: '/certifications',
      icon: 'Award',
      color: 'text-amber-600',
      description: 'Melhore suas habilidades com certificações'
    },
    'marketplace': {
      label: 'Explorar Marketplace',
      path: '/marketplace',
      icon: 'ShoppingBag',
      color: 'text-blue-600',
      description: 'Descubra oportunidades e negócios'
    },
    'seasons': {
      label: 'Juntar-se à Temporada',
      path: '/seasons',
      icon: 'Calendar',
      color: 'text-purple-600',
      description: 'Participe em competições sazonais'
    },
    'games': {
      label: 'Jogar Agora',
      path: '/games',
      icon: 'Gamepad2',
      color: 'text-pink-600',
      description: 'Ganhe pontos jogando e aprendendo'
    }
  };

  const config = ctaMap[primaryEngagement.toLowerCase()] || ctaMap['marketplace'];

  return {
    ...config,
    module: primaryEngagement
  };
};
