import React from 'react';
import { cn } from '../../utils/index.original';

interface BaseComponentProps {
  children?: React.ReactNode;
  className?: string;
}

interface SelectProps extends BaseComponentProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name?: string;
  id?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  required = false,
  disabled = false,
  value,
  onChange,
  name,
  id,
  options,
  placeholder,
  className,
  ...props
}) => {
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
      <select
        id={inputId}
        name={name}
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
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
