import React from 'react';
import { Card, LoadingSpinner } from '../common';

interface SectionWrapperProps {
  id?: string;
  title?: string | React.ReactNode;
  subtitle?: string;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  onRetry?: () => void;
  ariaLabel?: string;
  ariaLive?: 'polite' | 'assertive';
}

/**
 * Wrapper reutilizável para seções de dados com suporte a:
 * - Loading (skeleton via LoadingSpinner)
 * - Erro com ação de retry
 * - Estado vazio com ícone e CTA
 * - Conteúdo renderizado
 *
 * Normaliza experiência de UX/acessibilidade across seções.
 */
export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  id,
  title,
  subtitle,
  loading = false,
  error = null,
  empty = false,
  emptyIcon,
  emptyTitle = 'Nenhum dado disponível',
  emptyMessage = 'Volte mais tarde ou verifique os filtros.',
  emptyAction,
  children,
  className = 'py-12',
  containerClassName = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  onRetry,
  ariaLabel,
  ariaLive,
}) => {
  return (
    <section
      id={id}
      className={className}
      aria-label={ariaLabel}
      aria-live={ariaLive}
      role={ariaLive ? 'region' : undefined}
    >
      <div className={containerClassName}>
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-12 animate-fade-in">
            {title && (
              typeof title === 'string' ? (
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
              ) : (
                <div className="text-3xl font-bold text-gray-900 mb-4">{title}</div>
              )
            )}
            {subtitle && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center min-h-[200px]">
            <LoadingSpinner size="lg" text="A carregar..." />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <Card className="bg-red-50 border border-red-200 text-red-700 py-6 mb-6 animate-shake text-center">
            <h3 className="text-lg font-bold mb-2">Erro ao carregar dados</h3>
            <p className="mb-4">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Tentar Novamente
              </button>
            )}
          </Card>
        )}

        {/* Empty */}
        {empty && !loading && !error && (
          <Card className="text-center py-12 animate-fade-in">
            {emptyIcon && <div className="mb-4 flex justify-center">{emptyIcon}</div>}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{emptyTitle}</h3>
            <p className="text-gray-600 mb-6">{emptyMessage}</p>
            {emptyAction}
          </Card>
        )}

        {/* Content */}
        {!loading && !error && !empty && <div className="animate-fade-in">{children}</div>}
      </div>
    </section>
  );
};

export default SectionWrapper;
