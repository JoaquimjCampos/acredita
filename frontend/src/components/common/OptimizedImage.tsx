import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

interface OptimizedImageProps {
  src?: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
  lazy?: boolean;
  fallbackIcon?: React.ReactNode;
  onError?: () => void;
}

/**
 * Componente de imagem otimizado com:
 * - lazy-load nativo
 * - fallback em caso de erro
 * - skeleton loading opcional
 * - srcSet para responsividade (future enhancement)
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = 'w-full h-auto object-cover',
  containerClassName = '',
  lazy = true,
  fallbackIcon = <ImageOff className="h-12 w-12 text-gray-400" />,
  onError,
}) => {
  const [hasError, setHasError] = useState(!src);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (hasError || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 ${containerClassName}`}
        style={width && height ? { width, height } : {}}
      >
        {fallbackIcon}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${containerClassName}`} style={width && height ? { width, height } : {}}>
      {/* Skeleton while loading */}
      {isLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}

      {/* Image */}
      <img
        src={src || ''}
        alt={alt}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        onError={handleError}
        onLoad={handleLoad}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      />
    </div>
  );
};

export default OptimizedImage;
