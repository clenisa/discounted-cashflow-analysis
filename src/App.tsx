import { useMemo, useState } from 'react';
import { DCFCalculator } from '@/components/dcf/DCFCalculator';
import { FinancialDataTab } from '@/components/financial-data/FinancialDataTab';
import { DEFAULT_DCF_PARAMETERS, DEFAULT_EBITDA_DATA } from '@/constants/dcf';
import { ReturnProLayout, type ReturnProSection } from '@/layouts/ReturnProLayout';
import type { DCFDataSet, DCFParameters } from '@/types/dcf';

const DEFAULT_SCENARIO: DCFDataSet = {
  id: 'scenario-default',
  label: '10.08.25 exercise',
  ebitdaData: { ...DEFAULT_EBITDA_DATA },
  parameters: { ...DEFAULT_DCF_PARAMETERS }
};

const App = () => {
  const [activeSection, setActiveSection] = useState<ReturnProSection>('financial-data');
  const [scenarios, setScenarios] = useState<DCFDataSet[]>([DEFAULT_SCENARIO]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(DEFAULT_SCENARIO.id);

  const selectedScenario = useMemo(() => {
    if (scenarios.length === 0) {
      return null;
    }
    return scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? scenarios[0];
  }, [scenarios, selectedScenarioId]);

  const updateScenario = (scenarioId: string, updater: (scenario: DCFDataSet) => DCFDataSet) => {
    setScenarios((previous) =>
      previous.map((scenario) => (scenario.id === scenarioId ? updater({ ...scenario }) : scenario))
    );
  };

  const handleLabelChange = (label: string) => {
    if (!selectedScenario) {
      return;
    }
    updateScenario(selectedScenario.id, (scenario) => ({
      ...scenario,
      label
    }));
  };

  const handleEbitdaChange = (year: number, value: number) => {
    if (!selectedScenario) {
      return;
    }
    updateScenario(selectedScenario.id, (scenario) => ({
      ...scenario,
      ebitdaData: {
        ...scenario.ebitdaData,
        [year]: value
      }
    }));
  };

  const handleParametersChange = (updated: Partial<DCFParameters>) => {
    if (!selectedScenario) {
      return;
    }
    updateScenario(selectedScenario.id, (scenario) => ({
      ...scenario,
      parameters: {
        ...scenario.parameters,
        ...updated
      }
    }));
  };

  const headerContent =
    scenarios.length > 0 ? (
      <div className="flex items-center gap-3">
        <label htmlFor="scenario-select" className="sr-only">
          Choose scenario
        </label>
        <select
          id="scenario-select"
          value={selectedScenarioId}
          onChange={(event) => setSelectedScenarioId(event.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {scenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.label}
            </option>
          ))}
        </select>
      </div>
    ) : null;

  return (
    <ReturnProLayout activeSection={activeSection} onSectionChange={setActiveSection} headerContent={headerContent}>
      {selectedScenario &&
        (activeSection === 'financial-data' ? (
          <FinancialDataTab
            scenario={selectedScenario}
            onLabelChange={handleLabelChange}
            onEbitdaChange={handleEbitdaChange}
            onParametersChange={handleParametersChange}
          />
        ) : (
          <DCFCalculator
            scenarioLabel={selectedScenario.label}
            ebitdaData={selectedScenario.ebitdaData}
            parameters={selectedScenario.parameters}
          />
        ))}
    </ReturnProLayout>
  );
};

export default App;
