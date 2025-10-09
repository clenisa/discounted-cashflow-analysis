import { Card } from '@/components/common/Card';
import { ParameterInput } from '@/components/common/ParameterInput';
import type { DCFParameters, EBITDAData } from '@/types/dcf';
import { formatCurrency } from '@/utils/format';

interface InputPanelProps {
  ebitdaData: EBITDAData;
  parameters: DCFParameters;
  onEbitdaChange: (year: number, value: number) => void;
  onParametersChange: (updated: Partial<DCFParameters>) => void;
}

export const InputPanel = ({ ebitdaData, parameters, onEbitdaChange, onParametersChange }: InputPanelProps) => {
  const sortedEntries = Object.entries(ebitdaData)
    .map(([year, value]) => ({ year: Number(year), value }))
    .sort((a, b) => a.year - b.year);

  return (
    <div className="space-y-6">
      <Card title="EBITDA Data" subtitle="Historical and projected EBITDA values">
        <div className="space-y-4">
          {sortedEntries.map(({ year, value }) => {
            const isHistorical = year <= 2024;
            const inputId = `ebitda-${year}`;
            return (
              <div key={year} className="space-y-2">
                <label
                  htmlFor={inputId}
                  className={`flex items-center justify-between text-sm font-medium ${
                    isHistorical ? 'text-danger font-semibold' : 'text-slate-700'
                  }`}
                >
                  <span>EBITDA {year}</span>
                  {isHistorical && <span className="text-xs uppercase tracking-wide">Historical</span>}
                </label>
                <input
                  id={inputId}
                  type="number"
                  aria-label={`EBITDA for year ${year}`}
                  aria-describedby={`${inputId}-help`}
                  value={Number.isFinite(value) ? value : 0}
                  onChange={(event) => onEbitdaChange(year, parseFloat(event.target.value) || 0)}
                  className={`w-full rounded-lg border px-3 py-2 font-mono text-right text-sm focus:outline-none focus:ring-2 ${
                    isHistorical
                      ? 'border-danger/40 bg-danger/10 text-danger focus:border-danger focus:ring-danger/20'
                      : 'border-slate-300 bg-white text-slate-700 focus:border-primary focus:ring-primary/20'
                  }`}
                />
                <p id={`${inputId}-help`} className="sr-only">
                  Enter EBITDA value in euros for {year}. Use negative values for losses. Current value{' '}
                  {formatCurrency(value)}.
                </p>
              </div>
            );
          })}
        </div>
      </Card>

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
