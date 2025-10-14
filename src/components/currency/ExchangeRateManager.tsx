import React, { useState } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Card } from '@/components/common/Card';
import type { Currency } from '@/types/currency';

export const ExchangeRateManager: React.FC = () => {
  const { currencySettings, updateExchangeRate } = useCurrency();
  const [eurToUsd, setEurToUsd] = useState<string>(
    currencySettings.exchangeRates.find(r => r.from === 'EUR' && r.to === 'USD')?.rate.toString() || '1.08'
  );
  const [usdToEur, setUsdToEur] = useState<string>(
    currencySettings.exchangeRates.find(r => r.from === 'USD' && r.to === 'EUR')?.rate.toString() || '0.93'
  );

  const handleEurToUsdChange = (value: string) => {
    setEurToUsd(value);
    const rate = parseFloat(value);
    if (!isNaN(rate) && rate > 0) {
      updateExchangeRate('EUR', 'USD', rate);
    }
  };

  const handleUsdToEurChange = (value: string) => {
    setUsdToEur(value);
    const rate = parseFloat(value);
    if (!isNaN(rate) && rate > 0) {
      updateExchangeRate('USD', 'EUR', rate);
    }
  };

  const syncRates = () => {
    const eurToUsdRate = parseFloat(eurToUsd);
    if (!isNaN(eurToUsdRate) && eurToUsdRate > 0) {
      const calculatedUsdToEur = 1 / eurToUsdRate;
      setUsdToEur(calculatedUsdToEur.toFixed(4));
      updateExchangeRate('USD', 'EUR', calculatedUsdToEur);
    }
  };

  return (
    <Card
      title="Exchange Rates"
      subtitle="Manage currency conversion rates for financial calculations"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="eur-to-usd" className="text-sm font-medium text-slate-700">
              EUR to USD
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">1 EUR =</span>
              <input
                id="eur-to-usd"
                type="number"
                step="0.0001"
                min="0"
                value={eurToUsd}
                onChange={(e) => handleEurToUsdChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="1.08"
              />
              <span className="text-sm text-slate-500">USD</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="usd-to-eur" className="text-sm font-medium text-slate-700">
              USD to EUR
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">1 USD =</span>
              <input
                id="usd-to-eur"
                type="number"
                step="0.0001"
                min="0"
                value={usdToEur}
                onChange={(e) => handleUsdToEurChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="0.93"
              />
              <span className="text-sm text-slate-500">EUR</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={syncRates}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            Sync Rates
          </button>
          <div className="text-xs text-slate-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Current Rates</h4>
          <div className="space-y-1 text-sm text-slate-600">
            <div>1 EUR = {eurToUsd} USD</div>
            <div>1 USD = {usdToEur} EUR</div>
          </div>
        </div>
      </div>
    </Card>
  );
};