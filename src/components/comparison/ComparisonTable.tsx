import React from 'react';
import { Card } from '@/components/common/Card';
import { formatCurrency } from '@/utils/format';
import type { DCFDataSet, DCFResults } from '@/types/dcf';

interface ComparisonTableProps {
  scenarioA: DCFDataSet;
  scenarioB: DCFDataSet;
  resultsA: DCFResults;
  resultsB: DCFResults;
}

export const ComparisonTable = ({ scenarioA, scenarioB, resultsA, resultsB }: ComparisonTableProps) => {
  const formatPercentageDifference = (valueA: number, valueB: number) => {
    const diff = valueB - valueA;
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff.toFixed(1)}%`;
  };

  const formatCurrencyDifference = (valueA: number, valueB: number) => {
    const diff = valueB - valueA;
    const sign = diff > 0 ? '+' : '';
    return `${sign}${formatCurrency(diff)}`;
  };

  const comparisonData = [
    {
      category: 'Parameters',
      items: [
        {
          label: 'Discount Rate (WACC)',
          valueA: `${scenarioA.parameters.discountRate.toFixed(1)}%`,
          valueB: `${scenarioB.parameters.discountRate.toFixed(1)}%`,
          difference: formatPercentageDifference(scenarioA.parameters.discountRate, scenarioB.parameters.discountRate)
        },
        {
          label: 'Perpetuity Growth Rate',
          valueA: `${scenarioA.parameters.perpetuityRate.toFixed(1)}%`,
          valueB: `${scenarioB.parameters.perpetuityRate.toFixed(1)}%`,
          difference: formatPercentageDifference(scenarioA.parameters.perpetuityRate, scenarioB.parameters.perpetuityRate)
        },
        {
          label: 'Corporate Tax Rate',
          valueA: `${scenarioA.parameters.corporateTaxRate.toFixed(1)}%`,
          valueB: `${scenarioB.parameters.corporateTaxRate.toFixed(1)}%`,
          difference: formatPercentageDifference(scenarioA.parameters.corporateTaxRate, scenarioB.parameters.corporateTaxRate)
        }
      ]
    },
    {
      category: 'DCF Results',
      items: [
        {
          label: 'Enterprise Value',
          valueA: formatCurrency(resultsA.enterpriseValue),
          valueB: formatCurrency(resultsB.enterpriseValue),
          difference: formatCurrencyDifference(resultsA.enterpriseValue, resultsB.enterpriseValue)
        },
        {
          label: 'Terminal Value',
          valueA: formatCurrency(resultsA.terminalValue),
          valueB: formatCurrency(resultsB.terminalValue),
          difference: formatCurrencyDifference(resultsA.terminalValue, resultsB.terminalValue)
        },
        {
          label: 'Terminal Value PV',
          valueA: formatCurrency(resultsA.terminalValuePV),
          valueB: formatCurrency(resultsB.terminalValuePV),
          difference: formatCurrencyDifference(resultsA.terminalValuePV, resultsB.terminalValuePV)
        },
        {
          label: 'Projections PV',
          valueA: formatCurrency(resultsA.projectionsPV),
          valueB: formatCurrency(resultsB.projectionsPV),
          difference: formatCurrencyDifference(resultsA.projectionsPV, resultsB.projectionsPV)
        }
      ]
    }
  ];

  const getDifferenceColor = (difference: string) => {
    if (difference.startsWith('+')) {
      return 'text-green-600';
    }
    if (difference.includes('-')) {
      return 'text-red-600';
    }
    return 'text-slate-600';
  };

  return (
    <Card title="Detailed Comparison" subtitle="Side-by-side comparison of all key metrics">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Metric
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                {scenarioA.label}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                {scenarioB.label}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Difference
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {comparisonData.map((category, categoryIndex) => (
              <React.Fragment key={categoryIndex}>
                <tr className="bg-slate-50">
                  <td colSpan={4} className="px-4 py-2 text-sm font-semibold text-slate-700">
                    {category.category}
                  </td>
                </tr>
                {category.items.map((item, itemIndex) => (
                  <tr key={itemIndex} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {item.label}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-right text-slate-900">
                      {item.valueA}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-right text-slate-900">
                      {item.valueB}
                    </td>
                    <td className={`px-4 py-3 text-sm font-mono text-right ${getDifferenceColor(item.difference)}`}>
                      {item.difference}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
