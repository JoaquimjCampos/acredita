import React, { useMemo } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

const base = 'rounded px-4 py-2 font-semibold focus:outline-none transition';
const variants = {
  primary: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-4 focus:ring-acredita-primary',
  outline: 'border border-gray-900 text-gray-900 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-acredita-primary',
  ghost: 'bg-transparent text-gray-900 hover:bg-gray-100',
};
const sizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const SPIN_ANIMATION = `@keyframes spin { 100% { transform: rotate(360deg); } }`;

const Button: React.FC<ButtonProps> = React.memo(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled,
  ...props
}) => {
  const classNames = useMemo(() => 
    `${base} ${variants[variant]} ${sizes[size]} ${className} focus-visible:ring-2 focus-visible:ring-acredita-primary focus-visible:outline-none`,
    [variant, size, className]
  );

  return (
    <button
      className={classNames}
      disabled={loading || disabled}
      tabIndex={0}
      {...props}
    >
      {loading ? (
        <span className="loader mr-2 inline-block align-middle" style={{ width: 16, height: 16, border: '2px solid #fff', borderRightColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
      ) : null}
      {children}
      <style>{SPIN_ANIMATION}</style>
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
