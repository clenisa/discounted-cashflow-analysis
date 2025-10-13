import { Card } from '@/components/common/Card';
import { formatCurrency } from '@/utils/format';
import type { DCFDataSet, DCFResults } from '@/types/dcf';

interface ComparisonMetricsProps {
  scenarioA: DCFDataSet;
  scenarioB: DCFDataSet;
  resultsA: DCFResults;
  resultsB: DCFResults;
}

export const ComparisonMetrics = ({ scenarioA, scenarioB, resultsA, resultsB }: ComparisonMetricsProps) => {
  const calculateDifference = (valueA: number, valueB: number) => {
    const diff = valueB - valueA;
    const percentDiff = valueA !== 0 ? (diff / valueA) * 100 : 0;
    return { diff, percentDiff };
  };

  const enterpriseValueDiff = calculateDifference(resultsA.enterpriseValue, resultsB.enterpriseValue);
  const terminalValueDiff = calculateDifference(resultsA.terminalValue, resultsB.terminalValue);
  const projectionsPVDiff = calculateDifference(resultsA.projectionsPV, resultsB.projectionsPV);

  const formatDifference = (diff: number, percentDiff: number) => {
    const isPositive = diff >= 0;
    const sign = isPositive ? '+' : '';
    return (
      <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {sign}{formatCurrency(diff)} ({sign}{percentDiff.toFixed(1)}%)
      </span>
    );
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card title="Enterprise Value Comparison" subtitle="Total company valuation">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">{scenarioA.label}</span>
            <span className="text-lg font-semibold text-slate-900">
              {formatCurrency(resultsA.enterpriseValue)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">{scenarioB.label}</span>
            <span className="text-lg font-semibold text-slate-900">
              {formatCurrency(resultsB.enterpriseValue)}
            </span>
          </div>
          <div className="border-t border-slate-200 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Difference</span>
              {formatDifference(enterpriseValueDiff.diff, enterpriseValueDiff.percentDiff)}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Terminal Value Comparison" subtitle="Gordon Growth terminal value">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">{scenarioA.label}</span>
            <span className="text-lg font-semibold text-slate-900">
              {formatCurrency(resultsA.terminalValue)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">{scenarioB.label}</span>
            <span className="text-lg font-semibold text-slate-900">
              {formatCurrency(resultsB.terminalValue)}
            </span>
          </div>
          <div className="border-t border-slate-200 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Difference</span>
              {formatDifference(terminalValueDiff.diff, terminalValueDiff.percentDiff)}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Projections PV Comparison" subtitle="Present value of projected cash flows">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">{scenarioA.label}</span>
            <span className="text-lg font-semibold text-slate-900">
              {formatCurrency(resultsA.projectionsPV)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">{scenarioB.label}</span>
            <span className="text-lg font-semibold text-slate-900">
              {formatCurrency(resultsB.projectionsPV)}
            </span>
          </div>
          <div className="border-t border-slate-200 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Difference</span>
              {formatDifference(projectionsPVDiff.diff, projectionsPVDiff.percentDiff)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
