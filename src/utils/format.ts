export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export const formatCurrencyShort = (value: number): string => {
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000_000) {
    return `€${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (absolute >= 1_000_000) {
    return `€${(value / 1_000_000).toFixed(1)}M`;
  }

  if (absolute >= 1_000) {
    return `€${(value / 1_000).toFixed(1)}K`;
  }

  return formatCurrency(value);
};

export const formatPercentage = (value: number, digits = 1): string => {
  return `${value.toFixed(digits)}%`;
};
