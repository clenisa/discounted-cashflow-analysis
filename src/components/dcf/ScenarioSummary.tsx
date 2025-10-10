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
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                {sortedEntries.map(({ year }) => {
                  const isHistorical = year <= 2024;
                  return (
                    <th
                      key={year}
                      scope="col"
                      className={`px-4 py-3 text-right font-semibold ${isHistorical ? 'text-danger' : 'text-slate-600'}`}
                    >
                      {year}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                {sortedEntries.map(({ year, value }) => {
                  const isHistorical = year <= 2024;
                  return (
                    <td
                      key={year}
                      className={`px-4 py-4 text-right font-mono ${
                        isHistorical ? 'bg-danger/5 text-danger' : 'bg-white text-slate-700'
                      }`}
                    >
                      {formatCurrency(value)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
