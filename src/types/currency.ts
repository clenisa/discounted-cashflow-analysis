export type Currency = 'EUR' | 'USD';

export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  lastUpdated: Date;
}

export interface CurrencySettings {
  activeCurrency: Currency;
  exchangeRates: ExchangeRate[];
}

export const DEFAULT_EXCHANGE_RATES: ExchangeRate[] = [
  {
    from: 'EUR',
    to: 'USD',
    rate: 1.08, // Example rate: 1 EUR = 1.08 USD
    lastUpdated: new Date()
  },
  {
    from: 'USD',
    to: 'EUR',
    rate: 0.93, // Example rate: 1 USD = 0.93 EUR
    lastUpdated: new Date()
  }
];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: '€',
  USD: '$'
};

export const CURRENCY_LOCALES: Record<Currency, string> = {
  EUR: 'en-US',
  USD: 'en-US'
};