import React from 'react';
import { Card } from '@/components/common/Card';
import type { DCFDataSet } from '@/types/dcf';

interface ScenarioComparisonSimpleProps {
  scenarios: DCFDataSet[];
}

export const ScenarioComparisonSimple = ({ scenarios }: ScenarioComparisonSimpleProps) => {
  console.log('ScenarioComparisonSimple render:', { scenarios: scenarios.length });

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

        <Card title="Debug Info" subtitle="Checking if component renders">
          <div className="space-y-2">
            <p>Scenarios loaded: {scenarios.length}</p>
            <p>Scenario names: {scenarios.map(s => s.label).join(', ')}</p>
          </div>
        </Card>

        <Card title="Select Scenarios" subtitle="Choose two different scenarios to compare">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Scenario A</label>
              <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">Select a scenario...</option>
                {scenarios.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Scenario B</label>
              <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">Select a scenario...</option>
                {scenarios.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};