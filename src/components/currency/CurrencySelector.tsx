import React from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { Currency } from '@/types/currency';

interface CurrencySelectorProps {
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ className = '' }) => {
  const { currencySettings, setActiveCurrency } = useCurrency();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label htmlFor="currency-select" className="text-sm font-medium text-slate-700">
        Currency:
      </label>
      <select
        id="currency-select"
        value={currencySettings.activeCurrency}
        onChange={(e) => setActiveCurrency(e.target.value as Currency)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="EUR">EUR (€)</option>
        <option value="USD">USD ($)</option>
      </select>
    </div>
  );
};