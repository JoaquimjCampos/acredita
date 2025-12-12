import React from 'react';
import { cn } from '../../utils/index.original';

interface BaseComponentProps {
  children?: React.ReactNode;
  className?: string;
}

interface InputProps extends BaseComponentProps {
  label?: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    type = 'text',
    placeholder,
    error,
    required = false,
    disabled = false,
    value,
    onChange,
    name,
    id,
    className,
    ...props
  }, ref) => {
    const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={className}>
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={cn(
            'input-field',
            error && 'border-red-500 focus:ring-red-500',
            disabled && 'bg-gray-100 cursor-not-allowed'
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);
