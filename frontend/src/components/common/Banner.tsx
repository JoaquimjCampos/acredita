import React from 'react';
import { cn } from '../../utils/index.original';

interface BannerProps {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  color?: 'primary' | 'secondary' | 'gradient';
  children?: React.ReactNode;
}

const Banner: React.FC<BannerProps> = ({
  title,
  subtitle,
  ctaText,
  ctaHref,
  color = 'gradient',
  children,
}) => {
  return (
    <section
      className={cn(
        'w-full py-10 md:py-16 flex flex-col items-center justify-center text-center',
        color === 'primary' && 'bg-acredita-primary text-white',
        color === 'secondary' && 'bg-acredita-secondary text-white',
        color === 'gradient' && 'bg-gradient-to-r from-acredita-primary to-acredita-secondary text-white'
      )}
      aria-label={title}
    >
      <h1 className="text-4xl md:text-6xl font-bold mb-2 drop-shadow-lg">{title}</h1>
      {subtitle && <h2 className="text-xl md:text-2xl font-light mb-6 opacity-90">{subtitle}</h2>}
      {children}
      {ctaText && ctaHref && (
        <a
          href={ctaHref}
          className="inline-block mt-6 px-8 py-3 rounded-lg bg-white text-acredita-primary font-semibold shadow hover:bg-gray-100 transition"
        >
          {ctaText}
        </a>
      )}
    </section>
  );
};

export { Banner };
