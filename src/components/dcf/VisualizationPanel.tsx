import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
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

export const VisualizationPanel = ({ results, parameters }: VisualizationPanelProps) => (
  <div className="space-y-6">
    <Card title="Cash Flow Analysis" subtitle="EBITDA, tax, free cash flow, and present value by year">
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={results.presentValues}>
            <CartesianGrid strokeDasharray="4 4" stroke="#CBD5F5" />
            <XAxis dataKey="year" stroke="#64748B" />
            <YAxis stroke="#64748B" tickFormatter={(value) => formatCurrencyShort(value)} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label: number) => `Year ${label}`}
            />
            <Legend />
            <Bar dataKey="ebitda" fill="#4F46E5" name="EBITDA" />
            <Bar dataKey="tax" fill="#EF4444" name="Corporate Tax" />
            <Bar dataKey="fcf" fill="#10B981" name="Free Cash Flow" />
            <Line type="monotone" dataKey="presentValue" stroke="#8B5CF6" strokeWidth={3} name="Present Value" />
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
