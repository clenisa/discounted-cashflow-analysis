import { useState } from 'react';
import { DEFAULT_DCF_PARAMETERS, DEFAULT_EBITDA_DATA } from '@/constants/dcf';
import { useDCFCalculation } from '@/hooks/useDCFCalculation';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import type { DCFParameters, EBITDAData } from '@/types/dcf';
import { DashboardHeader } from './DashboardHeader';
import { DetailedAnalysisTable } from './DetailedAnalysisTable';
import { InputPanel } from './InputPanel';
import { VisualizationPanel } from './VisualizationPanel';

export const DCFCalculator = () => {
  const [ebitdaData, setEbitdaData] = useState<EBITDAData>(DEFAULT_EBITDA_DATA);
  const [parameters, setParameters] = useState<DCFParameters>(DEFAULT_DCF_PARAMETERS);

  const debouncedEbitdaData = useDebouncedValue(ebitdaData, 180);
  const debouncedParameters = useDebouncedValue(parameters, 180);
  const dcfResults = useDCFCalculation(debouncedEbitdaData, debouncedParameters);

  const handleEbitdaChange = (year: number, value: number) => {
    setEbitdaData((previous) => ({
      ...previous,
      [year]: value
    }));
  };

  const handleParametersChange = (updated: Partial<DCFParameters>) => {
    setParameters((previous) => ({
      ...previous,
      ...updated
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <DashboardHeader results={dcfResults} parameters={parameters} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <InputPanel
          ebitdaData={ebitdaData}
          parameters={parameters}
          onEbitdaChange={handleEbitdaChange}
          onParametersChange={handleParametersChange}
        />
        <div className="space-y-6 lg:col-span-2">
          <VisualizationPanel results={dcfResults} parameters={parameters} />
          <DetailedAnalysisTable results={dcfResults} parameters={parameters} />
        </div>
      </div>
    </div>
  );
};
