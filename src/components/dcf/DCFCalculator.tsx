import type { DCFParameters, EBITDAData } from '@/types/dcf';
import { useDCFCalculation } from '@/hooks/useDCFCalculation';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { DashboardHeader } from './DashboardHeader';
import { DetailedAnalysisTable } from './DetailedAnalysisTable';
import { ScenarioSummary } from './ScenarioSummary';
import { VisualizationPanel } from './VisualizationPanel';

interface DCFCalculatorProps {
  scenarioLabel: string;
  ebitdaData: EBITDAData;
  parameters: DCFParameters;
}

export const DCFCalculator = ({ scenarioLabel, ebitdaData, parameters }: DCFCalculatorProps) => {
  const debouncedEbitdaData = useDebouncedValue(ebitdaData, 180);
  const debouncedParameters = useDebouncedValue(parameters, 180);
  const dcfResults = useDCFCalculation(debouncedEbitdaData, debouncedParameters);

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Selected Scenario</p>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{scenarioLabel}</h1>
        </div>
        <DashboardHeader results={dcfResults} parameters={parameters} />
      </div>
      <ScenarioSummary ebitdaData={debouncedEbitdaData} parameters={parameters} />
      <VisualizationPanel results={dcfResults} parameters={parameters} />
      <DetailedAnalysisTable results={dcfResults} parameters={parameters} />
    </div>
  );
};
