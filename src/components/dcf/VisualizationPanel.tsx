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
  // Build a cumulative enterprise value bridge where each bar starts where the previous bar ended.
  const bridgeData: Array<{
    name: string;
    start: number;
    increase: number;
    decrease: number;
    total: number;
    tooltipValue: number;
    cumulative: number;
  }> = [];

  let cumulativeValue = 0;

  bridgeData.push({
    name: 'Start',
    start: 0,
    increase: 0,
    decrease: 0,
    total: 0,
    tooltipValue: 0,
    cumulative: 0
  });

  results.presentValues.forEach((pv, index) => {
    const yearStart = cumulativeValue;
    cumulativeValue += pv.presentValue;
    bridgeData.push({
      name: `Year ${index + 1}`,
      start: yearStart,
      increase: pv.presentValue >= 0 ? pv.presentValue : 0,
      decrease: pv.presentValue < 0 ? Math.abs(pv.presentValue) : 0,
      total: 0,
      tooltipValue: pv.presentValue,
      cumulative: cumulativeValue
    });
  });

  bridgeData.push({
    name: 'PV of Projections',
    start: 0,
    increase: 0,
    decrease: 0,
    total: results.projectionsPV,
    tooltipValue: results.projectionsPV,
    cumulative: results.projectionsPV
  });

  const terminalStart = results.projectionsPV;
  bridgeData.push({
    name: 'Terminal Value PV',
    start: terminalStart,
    increase: results.terminalValuePV,
    decrease: 0,
    total: 0,
    tooltipValue: results.terminalValuePV,
    cumulative: results.enterpriseValue
  });

  bridgeData.push({
    name: 'Enterprise Value',
    start: 0,
    increase: 0,
    decrease: 0,
    total: results.enterpriseValue,
    tooltipValue: results.enterpriseValue,
    cumulative: results.enterpriseValue
  });

  return bridgeData;
};

export const VisualizationPanel = ({ results, parameters }: VisualizationPanelProps) => (
  <div className="space-y-6">
    <Card
      title="Value Bridge"
      subtitle="Cumulative present value build from unlevered cash flows to enterprise value"
    >
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={buildValueBridgeData(results)}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="name"
              stroke="#64748B"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#64748B" tickFormatter={(value) => formatCurrencyShort(value)} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value, name, { payload }) => {
                if (!payload || typeof payload.name !== 'string' || payload.name.trim() === '') {
                  return null;
                }
                const displayValue =
                  payload.name.includes('PV') ||
                  payload.name.includes('Value') ||
                  payload.name.includes('Enterprise')
                    ? payload.total ?? payload.tooltipValue
                    : payload.tooltipValue;
                return [formatCurrency(Math.abs(displayValue || 0)), payload.name];
              }}
              labelFormatter={(label: string) => label}
              contentStyle={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px' }}
            />
            <Legend />
            <Bar dataKey="start" stackId="waterfall" fill="transparent" legendType="none" />
            <Bar
              dataKey="increase"
              stackId="waterfall"
              fill="#10B981"
              name="Cash Flow Contribution"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="decrease"
              stackId="waterfall"
              fill="#EF4444"
              name="Cash Flow Reduction"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="total"
              stackId="waterfall"
              fill="#3B82F6"
              name="Cumulative Value"
              radius={[2, 2, 2, 2]}
            />
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
