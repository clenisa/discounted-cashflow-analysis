import type { DCFDataSet } from '@/types/dcf';
import { useDCFCalculationFromDataSet } from '@/hooks/useDCFCalculationFromDataSet';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { DashboardHeader } from './DashboardHeader';
import { DetailedAnalysisTable } from './DetailedAnalysisTable';
import { VisualizationPanel } from './VisualizationPanel';

interface DCFCalculatorProps {
  dataSet: DCFDataSet;
}

export const DCFCalculator = ({ dataSet }: DCFCalculatorProps) => {
  const debouncedDataSet = useDebouncedValue(dataSet, 180);
  const dcfResults = useDCFCalculationFromDataSet(debouncedDataSet);

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Selected Scenario</p>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">{dataSet.label}</h1>
        </div>
        <DashboardHeader results={dcfResults} parameters={dataSet.parameters} />
      </div>
      <DetailedAnalysisTable results={dcfResults} parameters={dataSet.parameters} />
      <VisualizationPanel results={dcfResults} parameters={dataSet.parameters} />
    </div>
  );
};
