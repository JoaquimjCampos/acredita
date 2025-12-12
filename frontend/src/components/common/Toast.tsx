import React, { useEffect } from 'react';
import { cn } from '../../utils/index.original';
import { CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  duration = 2500,
  onClose,
  className,
}) => {
  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  const typeClasses = {
    success: 'bg-green-100 text-green-800',
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  const icons = {
    success: <CheckCircle2 className="mr-2 h-5 w-5 text-green-600" aria-hidden="true" />,
    info: <Info className="mr-2 h-5 w-5 text-blue-600" aria-hidden="true" />,
    warning: <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600" aria-hidden="true" />,
    error: <XCircle className="mr-2 h-5 w-5 text-red-600" aria-hidden="true" />,
  };

  return (
    <div
      className={cn(
        'fixed top-6 right-6 z-50 px-4 py-3 rounded shadow-lg font-semibold flex items-center',
        typeClasses[type],
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      {icons[type]}
      {message}
    </div>
  );
};
