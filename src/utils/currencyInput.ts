export const sanitizeNumericInput = (value: string): string => {
  if (!value) {
    return '';
  }

  let sanitized = value.replace(/[^\d.-]/g, '');
  const isNegative = sanitized.startsWith('-');

  sanitized = sanitized.replace(/-/g, '');

  if (sanitized.length === 0) {
    return isNegative ? '-' : '';
  }

  const parts = sanitized.split('.');
  const integerPart = parts.shift() ?? '';
  const decimalPart = parts.length > 0 ? `.${parts.join('')}` : '';

  let normalized = `${integerPart}${decimalPart}`;

  if (normalized.startsWith('0') && normalized.length > 1 && normalized[1] !== '.') {
    normalized = normalized.replace(/^0+/, '');
    if (normalized === '') {
      normalized = '0';
    }
  }

  if (isNegative) {
    normalized = integerPart.length === 0 && decimalPart.length === 0 ? '-' : `-${normalized}`;
  }

  return normalized;
};

export const parseSanitizedNumber = (value: string): number => {
  if (!value || value === '-' || value === '.' || value === '-.') {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
