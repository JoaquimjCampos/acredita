import React, { useRef } from 'react';
import { useSponsors } from '../hooks/useSponsors';
import { Card, LoadingSpinner } from '../components/common';
import { OptimizedImage } from './common/OptimizedImage';
import { useIntersectionObserver } from '../utils/performance';

const SponsorsSection: React.FC = React.memo(() => {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, 0.1);
  const { sponsors, loading, error } = useSponsors();

  if (loading) {
    return <LoadingSpinner size="lg" text="A carregar patrocinadores..." />;
  }

  if (error) {
    return <div className="text-red-600 font-semibold text-center" role="alert">{error}</div>;
  }

  if (!sponsors.length) {
    return (
      <Card className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum patrocinador disponível</h3>
        <p className="text-gray-600 mb-6">Não há patrocinadores no momento.</p>
      </Card>
    );
  }

  return (
    <section ref={sectionRef} className="py-16 bg-gray-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isVisible && (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="md" />
          </div>
        )}
        {isVisible && (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Patrocinadores &amp; Parceiros</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                O sucesso do programa é possível graças ao apoio dos nossos patrocinadores e parceiros.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center">
              {sponsors.map(sponsor => (
                <div key={sponsor.id} className="flex flex-col items-center">
                  <OptimizedImage src={sponsor.logo} alt={sponsor.name} width={64} height={64} className="h-16 w-16 mb-2 rounded-full shadow" lazy={true} />
                  <span className="text-gray-700 font-semibold">{sponsor.name}</span>
                  {sponsor.url && (
                    <a
                      href={sponsor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-acredita-primary underline mt-1"
                      data-analytics="sponsor-click"
                      data-sponsor-id={sponsor.id}
                      data-sponsor-name={sponsor.name}
                    >
                      Visitar
                    </a>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
});

SponsorsSection.displayName = 'SponsorsSection';

export default SponsorsSection;
