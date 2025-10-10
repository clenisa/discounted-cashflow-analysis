import type { DCFParameters, DCFResults } from '@/types/dcf';
import { Banknote, Binary, Calculator, PercentCircle } from 'lucide-react';
import { MetricCard } from './MetricCard';

interface DashboardHeaderProps {
  results: DCFResults;
  parameters: DCFParameters;
}

export const DashboardHeader = ({ results, parameters }: DashboardHeaderProps) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
    <MetricCard
      title="Enterprise Value"
      value={results.enterpriseValue}
      format="currency"
      icon={<Banknote className="h-6 w-6 text-primary" aria-hidden />}
      color="blue"
      info="Present value of projected free cash flows plus the discounted terminal value."
    />
    <MetricCard
      title="Terminal Value"
      value={results.terminalValue}
      format="currency"
      icon={<Binary className="h-6 w-6 text-success" aria-hidden />}
      color="green"
      info="Estimated value of the business beyond the forecast period using the Gordon Growth formula."
    />
    <MetricCard
      title="Terminal Value PV"
      value={results.terminalValuePV}
      format="currency"
      icon={<Calculator className="h-6 w-6 text-purple" aria-hidden />}
      color="purple"
      info="Terminal value discounted back to the present using the weighted average cost of capital."
    />
    <MetricCard
      title="Weighted Average Cost of Capital"
      value={parameters.discountRate}
      format="percentage"
      icon={<PercentCircle className="h-6 w-6 text-warning" aria-hidden />}
      color="orange"
    />
  </div>
);
