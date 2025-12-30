import React, { useMemo } from 'react';

import { cn } from '../../utils/index.original';

interface BaseComponentProps {
  children?: React.ReactNode;
  className?: string;
}


interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = React.memo(({
  title,
  subtitle,
  children,
  footer,
  className,
}) => {
  const headerClasses = useMemo(() => 
    title || subtitle ? 'card-header' : undefined,
    [title, subtitle]
  );

  return (
    <div className={cn('card', className)}>
      {headerClasses && (
        <div className={headerClasses}>
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
      {footer && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          {footer}
        </div>
      )}
    </div>
  );
});

Card.displayName = 'Card';
