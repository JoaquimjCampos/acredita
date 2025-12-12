import React from 'react';
import { PAYMENT_METHOD_LABELS } from '../../constants/kixikila';

interface PaymentMethodSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const PaymentMethodSelect: React.FC<PaymentMethodSelectProps> = ({
  value,
  onChange,
  label = 'Método de Pagamento',
  className = '',
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]: [string, string]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  </div>
);

export default PaymentMethodSelect;
