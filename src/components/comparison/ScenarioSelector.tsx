import type { DCFDataSet } from '@/types/dcf';

interface ScenarioSelectorProps {
  label: string;
  scenarios: DCFDataSet[];
  selectedScenarioId: string;
  onScenarioChange: (scenarioId: string) => void;
  excludeScenarioId?: string;
}

export const ScenarioSelector = ({ 
  label, 
  scenarios, 
  selectedScenarioId, 
  onScenarioChange, 
  excludeScenarioId 
}: ScenarioSelectorProps) => {
  const availableScenarios = scenarios.filter(scenario => scenario.id !== excludeScenarioId);

  return (
    <div className="space-y-2">
      <label htmlFor={`scenario-select-${label.toLowerCase()}`} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={`scenario-select-${label.toLowerCase()}`}
        value={selectedScenarioId}
        onChange={(e) => onScenarioChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="">Select a scenario...</option>
        {availableScenarios.map((scenario) => (
          <option key={scenario.id} value={scenario.id}>
            {scenario.label}
          </option>
        ))}
      </select>
      {selectedScenarioId && (
        <div className="text-xs text-slate-500">
          {scenarios.find(s => s.id === selectedScenarioId)?.label}
        </div>
      )}
    </div>
  );
};