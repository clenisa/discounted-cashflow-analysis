import { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { calculateEBITDA } from '@/lib/incomeStatement';
import type { IncomeStatementData, IncomeStatementAdjustments, FiscalYearLabels } from '@/types/dcf';
import { formatCurrency } from '@/utils/format';
import { sanitizeNumericInput, parseSanitizedNumber } from '@/utils/currencyInput';

interface IncomeStatementInputProps {
  scenarioId: string;
  incomeStatementData: IncomeStatementData;
  incomeStatementAdjustments?: IncomeStatementAdjustments;
  fiscalYearLabels?: FiscalYearLabels;
  onIncomeStatementChange: (year: number, field: keyof IncomeStatementData[number], value: number) => void;
  onAdjustmentChange: (year: number, field: keyof IncomeStatementAdjustments[number], value: number) => void;
}

export const IncomeStatementInput = ({
  scenarioId,
  incomeStatementData,
  incomeStatementAdjustments = {},
  fiscalYearLabels,
  onIncomeStatementChange,
  onAdjustmentChange
}: IncomeStatementInputProps) => {
  const [showAdjustments, setShowAdjustments] = useState(false);

  const sortedYears = Object.keys(incomeStatementData)
    .map(Number)
    .sort((a, b) => a - b);

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;
  };

  const lineItems = [
    { key: 'revenue' as const, label: 'Revenue', className: 'font-semibold' },
    { key: 'cogs' as const, label: 'Cost of Goods Sold', className: 'text-slate-600' },
    { key: 'sga' as const, label: 'SG&A', className: 'text-slate-600' },
    { key: 'depreciation' as const, label: 'Depreciation', className: 'text-slate-600' },
    { key: 'amortization' as const, label: 'Amortization', className: 'text-slate-600' }
  ];

  const getFiscalLabel = (year: number) => fiscalYearLabels?.[year] ?? String(year);

  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [activeValue, setActiveValue] = useState<string>('');

  useEffect(() => {
    setActiveCell(null);
    setActiveValue('');
  }, [scenarioId]);

  const getCellKey = (year: number, field: keyof IncomeStatementData[number]) => `${year}-${field}`;

  const handleCellFocus = (year: number, field: keyof IncomeStatementData[number], currentValue: number) => {
    setActiveCell(getCellKey(year, field));
    setActiveValue(String(currentValue ?? 0));
  };

  const handleCellChange = (year: number, field: keyof IncomeStatementData[number], rawValue: string) => {
    const sanitized = sanitizeNumericInput(rawValue);
    setActiveCell(getCellKey(year, field));
    setActiveValue(sanitized);
    const numericValue = parseSanitizedNumber(sanitized);
    onIncomeStatementChange(year, field, numericValue);
  };

  const handleCellBlur = () => {
    setActiveCell(null);
    setActiveValue('');
  };

  const getDisplayValue = (year: number, field: keyof IncomeStatementData[number]) => {
    const key = getCellKey(year, field);
    if (activeCell === key) {
      return activeValue;
    }
    const value = incomeStatementData[year]?.[field] || 0;
    return formatCurrency(value);
  };

  return (
    <div className="space-y-6">
      <Card title="Income Statement Data" subtitle="Enter detailed income statement line items">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 font-medium text-slate-700 border-b border-slate-200">
                  Line Item
                </th>
                {sortedYears.map(year => {
                  const isHistorical = year <= 2024;
                  const fiscalLabel = getFiscalLabel(year);
                  return (
                    <th key={year} className={`text-right py-3 px-4 font-medium border-b border-slate-200 ${
                      isHistorical ? 'text-danger' : 'text-slate-700'
                    }`}>
                      {fiscalLabel}
                      {isHistorical && <span className="block text-xs font-normal text-danger">Historical</span>}
                    </th>
                  );
                })}
                <th className="text-right py-3 px-4 font-medium text-slate-700 border-b border-slate-200">
                  EBITDA
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map(({ key, label, className }) => (
                <tr key={key} className="hover:bg-slate-50">
                  <td className={`py-3 px-4 border-b border-slate-100 ${className}`}>
                    {label}
                  </td>
                  {sortedYears.map(year => {
                    const value = incomeStatementData[year]?.[key] || 0;
                    const displayValue = getDisplayValue(year, key);
                    return (
                      <td key={year} className="py-3 px-4 border-b border-slate-100">
                        <input
                          type="text"
                          value={displayValue}
                          inputMode="decimal"
                          onFocus={() => handleCellFocus(year, key, value)}
                          onBlur={handleCellBlur}
                          onChange={(e) => handleCellChange(year, key, e.target.value)}
                          className="w-full text-right font-mono text-sm border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-2 py-1"
                        />
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 border-b border-slate-100">
                    <div className="text-right font-mono text-sm text-slate-500">
                      {formatCurrency(0)} {/* Will be calculated dynamically */}
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-semibold">
                <td className="py-3 px-4 border-b border-slate-200 text-slate-700">
                  EBITDA
                </td>
                {sortedYears.map(year => {
                  const data = incomeStatementData[year];
                  const ebitda = data ? calculateEBITDA(
                    data.revenue,
                    data.cogs,
                    data.sga,
                    data.depreciation,
                    data.amortization
                  ) : 0;
                  return (
                    <td key={year} className="py-3 px-4 border-b border-slate-200">
                      <div className={`text-right font-mono text-sm ${
                        ebitda >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(ebitda)}
                      </div>
                    </td>
                  );
                })}
                <td className="py-3 px-4 border-b border-slate-200">
                  <div className="text-right font-mono text-sm text-slate-500">
                    Total
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Adjustments Panel */}
      <Card 
        title="Synergy & Negotiation Adjustments" 
        subtitle="Apply percentage adjustments to account for synergies and negotiations"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-700">Enable Adjustments</h3>
              <p className="text-xs text-slate-500">Toggle to show percentage adjustment controls</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAdjustments(!showAdjustments)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showAdjustments ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showAdjustments ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {showAdjustments && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-700 border-b border-slate-200">
                      Adjustment Type
                    </th>
                    {sortedYears.map(year => {
                      const isHistorical = year <= 2024;
                      const fiscalLabel = getFiscalLabel(year);
                      return (
                        <th key={year} className={`text-right py-3 px-4 font-medium border-b border-slate-200 ${
                          isHistorical ? 'text-danger' : 'text-slate-700'
                        }`}>
                          {fiscalLabel}
                          {isHistorical && <span className="block text-xs font-normal text-danger">Historical</span>}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'revenueAdjustment' as const, label: 'Revenue Adjustment' },
                    { key: 'cogsAdjustment' as const, label: 'COGS Adjustment' },
                    { key: 'sgaAdjustment' as const, label: 'SG&A Adjustment' }
                  ].map(({ key, label }) => (
                    <tr key={key} className="hover:bg-slate-50">
                      <td className="py-3 px-4 border-b border-slate-100 text-slate-700">
                        {label}
                      </td>
                      {sortedYears.map(year => {
                        const adjustment = incomeStatementAdjustments[year]?.[key] || 0;
                        return (
                          <td key={year} className="py-3 px-4 border-b border-slate-100">
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                step="0.01"
                                min="-1"
                                max="10"
                                value={adjustment}
                                onChange={(e) => onAdjustmentChange(year, key, parseFloat(e.target.value) || 0)}
                                className="w-20 text-right font-mono text-sm border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                placeholder="0.1"
                              />
                              <span className="text-xs text-slate-500 whitespace-nowrap min-w-0">
                                {formatPercentage(adjustment)}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
