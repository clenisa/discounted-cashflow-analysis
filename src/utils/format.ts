import type { Currency } from '@/types/currency';

export const formatCurrency = (value: number, currency: Currency = 'EUR'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatCurrencyShort = (value: number, currency: Currency = 'EUR'): string => {
  const symbol = currency === 'EUR' ? '€' : '$';
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000_000) {
    return `${symbol}${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (absolute >= 1_000_000) {
    return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  }

  if (absolute >= 1_000) {
    return `${symbol}${(value / 1_000).toFixed(1)}K`;
  }

  return formatCurrency(value, currency);
};

export const formatPercentage = (value: number, digits = 1): string => {
  return `${value.toFixed(digits)}%`;
};
