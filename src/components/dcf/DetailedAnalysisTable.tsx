import { Card } from '@/components/common/Card';
import type { DCFParameters, DCFResults } from '@/types/dcf';
import { useCurrency } from '@/contexts/CurrencyContext';

interface DetailedAnalysisTableProps {
  results: DCFResults;
  parameters: DCFParameters;
}

export const DetailedAnalysisTable = ({ results, parameters }: DetailedAnalysisTableProps) => {
  const { formatCurrency } = useCurrency();
  const wacc = parameters.discountRate / 100;
  const terminalDiscountFactor = 1 / Math.pow(1 + wacc, results.presentValues.length);

  return (
    <Card title="Detailed DCF Analysis" subtitle="Year-by-year discounted cash flow breakdown">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3 text-right">EBITDA</th>
              <th className="px-4 py-3 text-right">Corporate Tax</th>
              <th className="px-4 py-3 text-right">Free Cash Flow</th>
              <th className="px-4 py-3 text-right">Discount Factor</th>
              <th className="px-4 py-3 text-right">Present Value</th>
            </tr>
          </thead>
          <tbody>
            {results.presentValues.map((row) => {
              const isHistorical = row.year <= 2024;
              return (
                <tr
                  key={row.year}
                  className={`border-b border-slate-100 ${isHistorical ? 'bg-danger/5' : 'bg-white'}`}
                >
                  <td className="px-4 py-3 font-medium text-slate-700">{row.year}</td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-slate-700">
                    {formatCurrency(row.ebitda)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-danger">
                    {row.tax > 0 ? `(${formatCurrency(row.tax)})` : '--'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-slate-700">
                    {formatCurrency(row.fcf)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-slate-500">
                    {row.discountFactor.toFixed(3)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-slate-800">
                    {formatCurrency(row.presentValue)}
                  </td>
                </tr>
              );
            })}
            <tr className="border-b border-slate-200 bg-white">
              <td className="px-4 py-3 font-semibold text-slate-700">Terminal Value</td>
              <td className="px-4 py-3 text-right font-mono text-sm text-slate-400">--</td>
              <td className="px-4 py-3 text-right font-mono text-sm text-slate-400">--</td>
              <td className="px-4 py-3 text-right font-mono text-sm text-slate-700">
                {formatCurrency(results.terminalValue)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm text-slate-500">
                {terminalDiscountFactor.toFixed(3)}
              </td>
              <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-slate-800">
                {formatCurrency(results.terminalValuePV)}
              </td>
            </tr>
            <tr className="bg-primary/5 font-semibold text-slate-800">
              <td className="px-4 py-3">Enterprise Value</td>
              <td className="px-4 py-3" />
              <td className="px-4 py-3" />
              <td className="px-4 py-3" />
              <td className="px-4 py-3" />
              <td className="px-4 py-3 text-right font-mono text-base text-primary">
                {formatCurrency(results.enterpriseValue)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
};
