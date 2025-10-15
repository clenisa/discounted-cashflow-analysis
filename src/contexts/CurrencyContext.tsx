import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Currency, ExchangeRate, CurrencySettings } from '@/types/currency';
import { DEFAULT_EXCHANGE_RATES } from '@/types/currency';

interface CurrencyContextType {
  currencySettings: CurrencySettings;
  setActiveCurrency: (currency: Currency) => void;
  updateExchangeRate: (from: Currency, to: Currency, rate: number) => void;
  convertCurrency: (amount: number, from: Currency, to: Currency) => number;
  formatCurrency: (amount: number, currency?: Currency) => string;
  formatCurrencyShort: (amount: number, currency?: Currency) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(() => {
    const saved = localStorage.getItem('currencySettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        exchangeRates: parsed.exchangeRates.map((rate: any) => ({
          ...rate,
          lastUpdated: new Date(rate.lastUpdated)
        }))
      };
    }
    return {
      activeCurrency: 'USD',
      exchangeRates: DEFAULT_EXCHANGE_RATES
    };
  });

  // Save to localStorage when settings change
  useEffect(() => {
    localStorage.setItem('currencySettings', JSON.stringify(currencySettings));
  }, [currencySettings]);

  const setActiveCurrency = (currency: Currency) => {
    setCurrencySettings(prev => ({
      ...prev,
      activeCurrency: currency
    }));
  };

  const updateExchangeRate = (from: Currency, to: Currency, rate: number) => {
    setCurrencySettings(prev => ({
      ...prev,
      exchangeRates: prev.exchangeRates.map(existing => 
        existing.from === from && existing.to === to
          ? { ...existing, rate, lastUpdated: new Date() }
          : existing
      ).concat(
        prev.exchangeRates.some(existing => existing.from === from && existing.to === to)
          ? []
          : [{ from, to, rate, lastUpdated: new Date() }]
      )
    }));
  };

  const convertCurrency = (amount: number, from: Currency, to: Currency): number => {
    if (from === to) return amount;
    
    const exchangeRate = currencySettings.exchangeRates.find(
      rate => rate.from === from && rate.to === to
    );
    
    if (!exchangeRate) {
      console.warn(`No exchange rate found for ${from} to ${to}`);
      return amount;
    }
    
    return amount * exchangeRate.rate;
  };

  const formatCurrency = (amount: number, currency?: Currency): string => {
    const targetCurrency = currency || currencySettings.activeCurrency;
    const locale = targetCurrency === 'EUR' ? 'en-US' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCurrencyShort = (amount: number, currency?: Currency): string => {
    const targetCurrency = currency || currencySettings.activeCurrency;
    const symbol = targetCurrency === 'EUR' ? '€' : '$';
    const absolute = Math.abs(amount);

    if (absolute >= 1_000_000_000) {
      return `${symbol}${(amount / 1_000_000_000).toFixed(1)}B`;
    }

    if (absolute >= 1_000_000) {
      return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
    }

    if (absolute >= 1_000) {
      return `${symbol}${(amount / 1_000).toFixed(1)}K`;
    }

    return formatCurrency(amount, targetCurrency);
  };

  return (
    <CurrencyContext.Provider value={{
      currencySettings,
      setActiveCurrency,
      updateExchangeRate,
      convertCurrency,
      formatCurrency,
      formatCurrencyShort
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};