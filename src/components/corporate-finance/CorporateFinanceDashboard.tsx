import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ModelManager } from '@/components/models/ModelManager';
import { ScenarioManager } from '@/components/scenarios/ScenarioManager';
import { DCFCalculator } from '@/components/dcf/DCFCalculator';
import { ScenarioComparison } from '@/components/comparison/ScenarioComparison';
import type {
  DCFModel,
  DCFScenario,
  DCFDataSet,
  EBITDAData,
  IncomeStatementData,
  IncomeStatementAdjustments
} from '@/types/dcf';

type DashboardView = 'models' | 'scenarios' | 'calculator' | 'comparison';

const normalizeEbitdaData = (data?: EBITDAData): EBITDAData | undefined => {
  if (!data) {
    return undefined;
  }
  const normalized: EBITDAData = {};
  Object.entries(data).forEach(([year, value]) => {
    const numericYear = Number(year);
    if (Number.isNaN(numericYear)) {
      return;
    }
    const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
    normalized[numericYear] = Number.isFinite(numericValue) ? numericValue : 0;
  });
  return normalized;
};

const cloneIncomeStatement = (data?: IncomeStatementData): IncomeStatementData | undefined => {
  if (!data) {
    return undefined;
  }
  const clone: IncomeStatementData = {};
  Object.entries(data).forEach(([year, entry]) => {
    const numericYear = Number(year);
    if (Number.isNaN(numericYear)) {
      return;
    }
    clone[numericYear] = { ...entry };
  });
  return clone;
};

const cloneIncomeStatementAdjustments = (
  data?: IncomeStatementAdjustments
): IncomeStatementAdjustments | undefined => {
  if (!data) {
    return undefined;
  }
  const clone: IncomeStatementAdjustments = {};
  Object.entries(data).forEach(([year, entry]) => {
    const numericYear = Number(year);
    if (Number.isNaN(numericYear)) {
      return;
    }
    clone[numericYear] = { ...entry };
  });
  return clone;
};

export const CorporateFinanceDashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('models');
  const [selectedModel, setSelectedModel] = useState<DCFModel | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<DCFScenario | null>(null);
  const [scenarios, setScenarios] = useState<DCFScenario[]>([]);

  const buildDataSet = useCallback(
    (scenario: DCFScenario | null): DCFDataSet | null => {
      if (!scenario) {
        return null;
      }

      let ebitda = normalizeEbitdaData(scenario.ebitdaData);
      const modelEbitda = normalizeEbitdaData(selectedModel?.ebitdaData);

      if (!ebitda || Object.keys(ebitda).length === 0) {
        if (modelEbitda && Object.keys(modelEbitda).length > 0) {
          ebitda = modelEbitda;
        } else {
          const currentYear = new Date().getFullYear();
          ebitda = { [currentYear]: 0 };
        }
      }

      const incomeStatement =
        cloneIncomeStatement(scenario.incomeStatementData) ??
        cloneIncomeStatement(selectedModel?.incomeStatementData);

      const incomeStatementAdjustments =
        cloneIncomeStatementAdjustments(scenario.incomeStatementAdjustments) ??
        cloneIncomeStatementAdjustments(selectedModel?.incomeStatementAdjustments);

      const scenarioId =
        scenario.id ??
        (scenario.scenarioName
          ? scenario.scenarioName.toLowerCase().replace(/\s+/g, '-')
          : 'temporary-scenario');

      return {
        id: scenarioId,
        label: scenario.scenarioName ?? 'Scenario',
        ebitdaData: ebitda,
        parameters: {
          discountRate: scenario.discountRate ?? selectedModel?.discountRate ?? 20,
          perpetuityRate: scenario.perpetuityRate ?? selectedModel?.perpetuityRate ?? 4,
          corporateTaxRate: scenario.corporateTaxRate ?? selectedModel?.corporateTaxRate ?? 25
        },
        useIncomeStatement: Boolean(incomeStatement && Object.keys(incomeStatement).length > 0),
        incomeStatementData: incomeStatement,
        incomeStatementAdjustments,
        fiscalYearLabels: selectedModel?.fiscalYearLabels,
        baseCurrency: selectedModel?.baseCurrency ?? 'EUR'
      };
    },
    [selectedModel]
  );

  const selectedDataSet = useMemo(
    () => buildDataSet(selectedScenario),
    [selectedScenario, buildDataSet]
  );

  const comparisonDataSets = useMemo(
    () => scenarios.map((scenario) => buildDataSet(scenario)).filter(Boolean) as DCFDataSet[],
    [scenarios, buildDataSet]
  );

  const handleModelSelect = (model: DCFModel) => {
    setSelectedModel(model);
    setSelectedScenario(null);
    setCurrentView('scenarios');
  };

  const handleScenarioSelect = (scenario: DCFScenario) => {
    setSelectedScenario(scenario);
    setCurrentView('calculator');
  };

  const handleScenariosChange = useCallback((nextScenarios: DCFScenario[]) => {
    setScenarios(nextScenarios);
    setSelectedScenario((current) => {
      if (!current) {
        return current;
      }
      return nextScenarios.find((scenario) => scenario.id === current.id) ?? null;
    });
  }, []);

  const handleScenarioManagerModelChange = useCallback((model: DCFModel | null) => {
    setSelectedModel(model);
    setSelectedScenario(null);
    if (!model) {
      setScenarios([]);
    }
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Corporate Finance Dashboard</h2>
          <p className="text-gray-600 mb-8">
            Please sign in to access your DCF models and scenarios.
          </p>
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Corporate Finance</h1>
          {selectedModel && (
            <p className="text-sm text-slate-500 mt-1">
              {selectedModel.modelName}
              {selectedScenario ? ` / ${selectedScenario.scenarioName}` : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('models')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              currentView === 'models'
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Models
          </button>
          <button
            onClick={() => setCurrentView('scenarios')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              currentView === 'scenarios'
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            disabled={!selectedModel}
          >
            Scenarios
          </button>
          <button
            onClick={() => setCurrentView('calculator')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              currentView === 'calculator'
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            disabled={!selectedScenario}
          >
            Calculator
          </button>
          <button
            onClick={() => setCurrentView('comparison')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              currentView === 'comparison'
                ? 'bg-primary text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            disabled={comparisonDataSets.length < 2}
          >
            Comparison
          </button>
        </div>
      </div>

      {currentView === 'models' && (
        <ModelManager onModelSelect={handleModelSelect} selectedModelId={selectedModel?.id} />
      )}

      {currentView === 'scenarios' && (
        <div className="bg-white shadow rounded-lg border border-slate-200 p-6">
          <ScenarioManager
            onScenarioSelect={handleScenarioSelect}
            selectedScenarioId={selectedScenario?.id}
            selectedModelId={selectedModel?.id}
            onModelChange={handleScenarioManagerModelChange}
            onScenariosChange={handleScenariosChange}
          />
        </div>
      )}

      {currentView === 'calculator' && (
        <div className="bg-white shadow rounded-lg border border-slate-200 p-6">
          {selectedDataSet ? (
            <>
              <h2 className="text-lg font-medium text-slate-900 mb-4">
                DCF Calculator — {selectedDataSet.label}
              </h2>
              <DCFCalculator dataSet={selectedDataSet} />
            </>
          ) : (
            <div className="text-center text-slate-500 py-12">
              Select a scenario with financial data to view calculations.
            </div>
          )}
        </div>
      )}

      {currentView === 'comparison' && comparisonDataSets.length > 0 && (
        <div className="bg-white shadow rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-medium text-slate-900 mb-4">Scenario Comparison</h2>
          <ScenarioComparison scenarios={comparisonDataSets} />
        </div>
      )}
    </div>
  );
};
