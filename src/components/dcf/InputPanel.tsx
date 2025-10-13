import { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { ParameterInput } from '@/components/common/ParameterInput';
import { IncomeStatementInput } from '@/components/financial-data/IncomeStatementInput';
import type {
  DCFParameters,
  EBITDAData,
  IncomeStatementData,
  IncomeStatementAdjustments,
  FiscalYearLabels
} from '@/types/dcf';
import { formatCurrency } from '@/utils/format';
import { sanitizeNumericInput, parseSanitizedNumber } from '@/utils/currencyInput';

interface InputPanelProps {
  scenarioId: string;
  ebitdaData: EBITDAData;
  parameters: DCFParameters;
  useIncomeStatement: boolean;
  incomeStatementData?: IncomeStatementData;
  incomeStatementAdjustments?: IncomeStatementAdjustments;
  fiscalYearLabels?: FiscalYearLabels;
  onEbitdaChange: (year: number, value: number) => void;
  onParametersChange: (updated: Partial<DCFParameters>) => void;
  onIncomeStatementToggle: (useIncomeStatement: boolean) => void;
  onIncomeStatementChange: (year: number, field: keyof IncomeStatementData[number], value: number) => void;
  onAdjustmentChange: (year: number, field: keyof IncomeStatementAdjustments[number], value: number) => void;
}

export const InputPanel = ({ 
  scenarioId,
  ebitdaData, 
  parameters, 
  useIncomeStatement,
  incomeStatementData,
  incomeStatementAdjustments,
  fiscalYearLabels,
  onEbitdaChange, 
  onParametersChange,
  onIncomeStatementToggle,
  onIncomeStatementChange,
  onAdjustmentChange
}: InputPanelProps) => {
  const sortedEntries = Object.entries(ebitdaData)
    .map(([year, value]) => ({ year: Number(year), value }))
    .sort((a, b) => a.year - b.year);

  const getFiscalLabel = (year: number) => fiscalYearLabels?.[year] ?? String(year);

  const [editingYear, setEditingYear] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  useEffect(() => {
    setEditingYear(null);
    setEditingValue('');
  }, [scenarioId]);

  const handleEbitdaFocus = (year: number) => {
    setEditingYear(year);
    setEditingValue(String(ebitdaData[year] ?? 0));
  };

  const handleEbitdaChange = (year: number, rawValue: string) => {
    const sanitized = sanitizeNumericInput(rawValue);
    setEditingYear(year);
    setEditingValue(sanitized);
    const numericValue = parseSanitizedNumber(sanitized);
    onEbitdaChange(year, numericValue);
  };

  const handleEbitdaBlur = () => {
    setEditingYear(null);
    setEditingValue('');
  };

  const getEbitdaInputValue = (year: number, value: number) => {
    if (editingYear === year) {
      return editingValue;
    }
    return formatCurrency(value);
  };

  return (
    <div className="space-y-6">
      {/* Input Mode Toggle */}
      <Card title="Financial Data Input" subtitle="Choose how to input financial data">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-slate-700">Input Mode</h3>
              <p className="text-xs text-slate-500">
                {useIncomeStatement 
                  ? 'Enter detailed income statement line items' 
                  : 'Enter EBITDA values directly'
                }
              </p>
            </div>
            <button
              type="button"
              onClick={() => onIncomeStatementToggle(!useIncomeStatement)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                useIncomeStatement ? 'bg-primary' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useIncomeStatement ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex space-x-4 text-sm">
            <span className={!useIncomeStatement ? 'font-medium text-primary' : 'text-slate-500'}>
              EBITDA Direct
            </span>
            <span className={useIncomeStatement ? 'font-medium text-primary' : 'text-slate-500'}>
              Income Statement
            </span>
          </div>
        </div>
      </Card>

      {/* EBITDA Input Mode */}
      {!useIncomeStatement && (
        <Card title="EBITDA Data" subtitle="Historical and projected EBITDA values">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-slate-700 border-b border-slate-200">
                    Line Item
                  </th>
                  {sortedEntries.map(({ year }) => {
                    const isHistorical = year <= 2024;
                    const fiscalLabel = getFiscalLabel(year);
                    return (
                      <th
                        key={year}
                        className={`text-right py-3 px-4 font-medium border-b border-slate-200 ${
                          isHistorical ? 'text-danger' : 'text-slate-700'
                        }`}
                      >
                        {fiscalLabel}
                        {isHistorical && (
                          <span className="block text-xs font-normal text-danger">Historical</span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-slate-50">
                  <td className="py-3 px-4 border-b border-slate-100 font-semibold text-slate-700">EBITDA</td>
                  {sortedEntries.map(({ year, value }) => {
                    const isHistorical = year <= 2024;
                    const inputId = `ebitda-${year}`;
                    const fiscalLabel = getFiscalLabel(year);
                    const displayValue = getEbitdaInputValue(year, value);
                    return (
                      <td key={year} className="py-3 px-4 border-b border-slate-100">
                        <input
                          id={inputId}
                          type="text"
                          aria-label={`EBITDA for ${fiscalLabel}`}
                          aria-describedby={`${inputId}-help`}
                          value={displayValue}
                          inputMode="decimal"
                          onFocus={() => handleEbitdaFocus(year)}
                          onBlur={handleEbitdaBlur}
                          onChange={(event) => handleEbitdaChange(year, event.target.value)}
                          className={`w-full rounded-md border px-3 py-2 font-mono text-right text-sm focus:outline-none focus:ring-2 ${
                            isHistorical
                              ? 'border-danger/40 bg-danger/5 text-danger focus:border-danger focus:ring-danger/20'
                              : 'border-slate-300 bg-white text-slate-700 focus:border-primary focus:ring-primary/20'
                          }`}
                        />
                        <p id={`${inputId}-help`} className="sr-only">
                          Enter EBITDA value in euros for {fiscalLabel}. Use negative values for losses. Current value{' '}
                          {formatCurrency(value)}.
                        </p>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Income Statement Input Mode */}
      {useIncomeStatement && incomeStatementData && (
        <IncomeStatementInput
          scenarioId={scenarioId}
          incomeStatementData={incomeStatementData}
          incomeStatementAdjustments={incomeStatementAdjustments}
          fiscalYearLabels={fiscalYearLabels}
          onIncomeStatementChange={onIncomeStatementChange}
          onAdjustmentChange={onAdjustmentChange}
        />
      )}

      <Card title="DCF Parameters" subtitle="Valuation assumptions">
        <div className="space-y-4">
          <ParameterInput
            label="WACC (Discount Rate) %"
            value={parameters.discountRate}
            min={5}
            max={50}
            step={0.1}
            helperText="Weighted average cost of capital applied to all projected cash flows."
            onChange={(value) => onParametersChange({ discountRate: value })}
          />
          <ParameterInput
            label="Perpetual Growth Rate %"
            value={parameters.perpetuityRate}
            min={0}
            max={10}
            step={0.1}
            helperText="Long-term growth rate applied in the terminal value."
            onChange={(value) => onParametersChange({ perpetuityRate: value })}
          />
          <ParameterInput
            label="Corporate Tax Rate %"
            value={parameters.corporateTaxRate}
            min={0}
            max={50}
            step={0.1}
            helperText="Tax applied only on positive EBITDA."
            onChange={(value) => onParametersChange({ corporateTaxRate: value })}
          />
        </div>
      </Card>
    </div>
  );
};
