import { useState, useMemo } from 'react';
import { Card } from '@/components/common/Card';
import { ComparisonMetrics } from './ComparisonMetrics';
import { ComparisonTable } from './ComparisonTable';
import { ComparisonVisualization } from './ComparisonVisualization';
import { ScenarioSelector } from './ScenarioSelector';
import type { DCFDataSet, DCFResults } from '@/types/dcf';
import { calculateDCF } from '@/lib/dcf';

interface ScenarioComparisonProps {
  scenarios: DCFDataSet[];
}

export const ScenarioComparison = ({ scenarios }: ScenarioComparisonProps) => {
  const [selectedScenarioA, setSelectedScenarioA] = useState<string>('');
  const [selectedScenarioB, setSelectedScenarioB] = useState<string>('');

  const scenarioA = useMemo(() => 
    scenarios.find(s => s.id === selectedScenarioA), 
    [scenarios, selectedScenarioA]
  );
  
  const scenarioB = useMemo(() => 
    scenarios.find(s => s.id === selectedScenarioB), 
    [scenarios, selectedScenarioB]
  );

  const resultsA = useMemo<DCFResults | null>(() => {
    if (!scenarioA) {
      return null;
    }
    try {
      const { ebitdaData, parameters } = scenarioA;
      return calculateDCF(ebitdaData, parameters.discountRate, parameters.perpetuityRate, parameters.corporateTaxRate);
    } catch (error) {
      console.error('Failed to calculate DCF for scenario A', error);
      return null;
    }
  }, [scenarioA]);
  
  const resultsB = useMemo<DCFResults | null>(() => {
    if (!scenarioB) {
      return null;
    }
    try {
      const { ebitdaData, parameters } = scenarioB;
      return calculateDCF(ebitdaData, parameters.discountRate, parameters.perpetuityRate, parameters.corporateTaxRate);
    } catch (error) {
      console.error('Failed to calculate DCF for scenario B', error);
      return null;
    }
  }, [scenarioB]);

  const hasValidComparison = Boolean(
    scenarioA && scenarioB && resultsA && resultsB && scenarioA.id !== scenarioB.id
  );

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Scenario Comparison</p>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Compare DCF Scenarios</h1>
          <p className="text-sm text-slate-600 mt-1">
            Select two scenarios to compare their DCF calculations, parameters, and results side-by-side.
          </p>
        </div>

        <Card title="Select Scenarios" subtitle="Choose two different scenarios to compare">
          <div className="grid gap-4 md:grid-cols-2">
            <ScenarioSelector
              label="Scenario A"
              scenarios={scenarios}
              selectedScenarioId={selectedScenarioA}
              onScenarioChange={setSelectedScenarioA}
              excludeScenarioId={selectedScenarioB}
            />
            <ScenarioSelector
              label="Scenario B"
              scenarios={scenarios}
              selectedScenarioId={selectedScenarioB}
              onScenarioChange={setSelectedScenarioB}
              excludeScenarioId={selectedScenarioA}
            />
          </div>
        </Card>

        {hasValidComparison && scenarioA && scenarioB && resultsA && resultsB ? (
          <>
            <ComparisonMetrics 
              scenarioA={scenarioA} 
              scenarioB={scenarioB}
              resultsA={resultsA}
              resultsB={resultsB}
            />
            <ComparisonTable 
              scenarioA={scenarioA} 
              scenarioB={scenarioB}
              resultsA={resultsA}
              resultsB={resultsB}
            />
            <ComparisonVisualization 
              scenarioA={scenarioA} 
              scenarioB={scenarioB}
              resultsA={resultsA}
              resultsB={resultsB}
            />
          </>
        ) : (
          <Card title="No Comparison Selected" subtitle="Please select two different scenarios to begin comparison">
            <div className="text-center py-8">
              <div className="text-slate-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-slate-500">Select two different scenarios from the dropdowns above to start comparing.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
