import { Card } from '@/components/common/Card';
import type { DCFParameters, EBITDAData } from '@/types/dcf';
import { formatCurrency } from '@/utils/format';

interface ScenarioSummaryProps {
  parameters: DCFParameters;
  ebitdaData: EBITDAData;
}

export const ScenarioSummary = ({ parameters, ebitdaData }: ScenarioSummaryProps) => {
  const sortedEntries = Object.entries(ebitdaData)
    .map(([year, value]) => ({ year: Number(year), value }))
    .sort((a, b) => a.year - b.year);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Key Assumptions" subtitle="Rates applied to this scenario">
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-slate-600">Weighted Average Cost of Capital</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              {parameters.discountRate.toFixed(1)}%
            </dd>
            <dd className="text-xs text-slate-500">Applied across projected cash flows.</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-600">Perpetual Growth Rate</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              {parameters.perpetuityRate.toFixed(1)}%
            </dd>
            <dd className="text-xs text-slate-500">Used in Gordon Growth terminal value.</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-600">Corporate Tax Rate</dt>
            <dd className="mt-1 text-lg font-semibold text-slate-900">
              {parameters.corporateTaxRate.toFixed(1)}%
            </dd>
            <dd className="text-xs text-slate-500">Only applied when EBITDA is positive.</dd>
          </div>
        </dl>
      </Card>

      <Card title="EBITDA Outlook" subtitle="Verify historical and projected values before running the model">
        <ul className="divide-y divide-slate-100">
          {sortedEntries.map(({ year, value }) => {
            const isHistorical = year <= 2024;
            return (
              <li
                key={year}
                className={`flex items-center justify-between px-4 py-3 text-sm ${
                  isHistorical ? 'bg-danger/5 text-danger' : 'text-slate-700'
                }`}
              >
                <span className="font-medium">{year}</span>
                <span className="font-mono">{formatCurrency(value)}</span>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
};
