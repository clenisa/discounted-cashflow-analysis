import type { DCFDataSet, DCFParameters } from '@/types/dcf';
import { Card } from '@/components/common/Card';
import { InputPanel } from '@/components/dcf/InputPanel';

interface FinancialDataTabProps {
  scenario: DCFDataSet;
  onLabelChange: (label: string) => void;
  onEbitdaChange: (year: number, value: number) => void;
  onParametersChange: (updated: Partial<DCFParameters>) => void;
}

export const FinancialDataTab = ({
  scenario,
  onLabelChange,
  onEbitdaChange,
  onParametersChange
}: FinancialDataTabProps) => (
  <div className="space-y-6 p-6">
    <Card
      title="Scenario Details"
      subtitle="Confirm the dataset label and keep it in sync with financial assumptions."
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="scenario-label" className="text-sm font-medium text-slate-700">
            Scenario Label
          </label>
          <input
            id="scenario-label"
            type="text"
            value={scenario.label}
            onChange={(event) => onLabelChange(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Add a label so you can find this dataset in the DCF calculator"
          />
          <p className="text-xs text-slate-500">
            Pick a descriptive name for this dataset. It appears in the DCF calculator selector.
          </p>
        </div>
        <dl className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <div>
            <dt className="font-medium text-slate-700">Scenario ID</dt>
            <dd className="font-mono text-xs text-slate-500">{scenario.id}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700">WACC</dt>
            <dd>{scenario.parameters.discountRate.toFixed(1)}%</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-700">Perpetual Growth</dt>
            <dd>{scenario.parameters.perpetuityRate.toFixed(1)}%</dd>
          </div>
        </dl>
      </div>
    </Card>

    <InputPanel
      ebitdaData={scenario.ebitdaData}
      parameters={scenario.parameters}
      onEbitdaChange={onEbitdaChange}
      onParametersChange={onParametersChange}
    />
  </div>
);
