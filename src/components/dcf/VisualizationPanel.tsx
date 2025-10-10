import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Card } from '@/components/common/Card';
import type { DCFParameters, DCFResults } from '@/types/dcf';
import { formatCurrency, formatCurrencyShort, formatPercentage } from '@/utils/format';

interface VisualizationPanelProps {
  results: DCFResults;
  parameters: DCFParameters;
}

const PIE_COLORS = ['#4F46E5', '#10B981'];

const buildValueBridgeData = (results: DCFResults) => {
  // Build a finance-standard enterprise value bridge showing discounted UFCFs, PV of projections, and terminal value.
  const bridgeData: Array<{
    name: string;
    start: number;
    increase: number;
    decrease: number;
    total: number;
    tooltipValue: number;
  }> = [];

  let runningTotal = 0;

  results.presentValues.forEach((pv, index) => {
    const start = runningTotal;
    runningTotal += pv.presentValue;
    bridgeData.push({
      name: `UFCF Year ${index + 1}`,
      start,
      increase: pv.presentValue >= 0 ? pv.presentValue : 0,
      decrease: pv.presentValue < 0 ? Math.abs(pv.presentValue) : 0,
      total: 0,
      tooltipValue: pv.presentValue
    });

    if (index < results.presentValues.length - 1) {
      bridgeData.push({
        name: '',
        start: 0,
        increase: 0,
        decrease: 0,
        total: 0,
        tooltipValue: 0
      });
    }
  });

  bridgeData.push({
    name: 'PV of Projections',
    start: 0,
    increase: 0,
    decrease: 0,
    total: results.projectionsPV,
    tooltipValue: results.projectionsPV
  });

  bridgeData.push({
    name: ' ',
    start: 0,
    increase: 0,
    decrease: 0,
    total: 0,
    tooltipValue: 0
  });

  const terminalPVStart = results.projectionsPV;
  bridgeData.push({
    name: 'PV of Terminal Value',
    start: terminalPVStart,
    increase: results.terminalValuePV,
    decrease: 0,
    total: terminalPVStart + results.terminalValuePV,
    tooltipValue: results.terminalValuePV
  });

  bridgeData.push({
    name: ' ',
    start: 0,
    increase: 0,
    decrease: 0,
    total: 0,
    tooltipValue: 0
  });

  bridgeData.push({
    name: 'Enterprise Value',
    start: 0,
    increase: 0,
    decrease: 0,
    total: results.enterpriseValue,
    tooltipValue: results.enterpriseValue
  });

  return bridgeData;
};

export const VisualizationPanel = ({ results, parameters }: VisualizationPanelProps) => (
  <div className="space-y-6">
    <Card
      title="Value Bridge"
      subtitle="Enterprise value build-up from discounted unlevered cash flows and terminal value"
    >
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={buildValueBridgeData(results)}>
            <CartesianGrid strokeDasharray="4 4" stroke="#CBD5F5" />
            <XAxis dataKey="name" stroke="#64748B" />
            <YAxis stroke="#64748B" tickFormatter={(value) => formatCurrencyShort(value)} />
            <Tooltip
              formatter={(value, name, { payload }) => {
                if (!payload) {
                  return formatCurrency(0);
                }
                const label = typeof payload.name === 'string' ? payload.name : '';
                if (!label.trim()) {
                  return '';
                }
                const rawAmount =
                  label.includes('PV') || label.includes('Value')
                    ? payload.total ?? payload.tooltipValue
                    : payload.tooltipValue;
                return formatCurrency(Math.abs(rawAmount ?? 0));
              }}
              labelFormatter={(label: string) => label.trim()}
            />
            <Legend />
            <Bar dataKey="start" stackId="bridge" fill="transparent" legendType="none" />
            <Bar dataKey="increase" stackId="bridge" fill="#10B981" name="Value Added" barSize={48} />
            <Bar dataKey="decrease" stackId="bridge" fill="#EF4444" name="Value Reduction" barSize={48} />
            <Bar dataKey="total" stackId="bridge" fill="#4F46E5" name="Total" barSize={48} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>

    <Card title="Valuation Breakdown" subtitle="Components of enterprise value">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'PV of Projections', value: results.projectionsPV },
                  { name: 'PV of Terminal Value', value: results.terminalValuePV }
                ]}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {PIE_COLORS.map((color) => (
                  <Cell key={color} fill={color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4 text-sm text-slate-600">
          <div>
            <h4 className="text-base font-semibold text-slate-900">Methodology</h4>
            <ul className="mt-2 space-y-1">
              <li>- Standard DCF with Gordon Growth Model terminal value.</li>
              <li>- WACC: {formatPercentage(parameters.discountRate)} (applied to all cash flows).</li>
              <li>- Perpetual growth rate: {formatPercentage(parameters.perpetuityRate)}.</li>
              <li>- Corporate tax rate: {formatPercentage(parameters.corporateTaxRate)} on positive EBITDA only.</li>
            </ul>
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-900">Terminal Value Formula</h4>
            <p className="mt-2 font-mono text-xs text-slate-500">
              TV = FCF<sub>final</sub> * (1 + g) / (r - g)
            </p>
            <p className="text-xs text-slate-500">g = growth rate, r = weighted average cost of capital.</p>
          </div>
        </div>
      </div>
    </Card>
  </div>
);
