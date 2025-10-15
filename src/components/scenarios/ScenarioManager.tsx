import React, { useState, useEffect, useMemo } from 'react';
import { useDataService } from '@/hooks/useDataService';
import { useAuth } from '@/contexts/AuthContext';
import type { DCFModel, DCFScenario, IncomeStatementData, IncomeStatementAdjustments } from '@/types/dcf';

interface ScenarioManagerProps {
  onScenarioSelect: (scenario: DCFScenario) => void;
  selectedScenarioId?: string;
}

export const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  onScenarioSelect,
  selectedScenarioId
}) => {
  const { user } = useAuth();
  const dataService = useDataService();
  const [models, setModels] = useState<DCFModel[]>([]);
  const [scenarios, setScenarios] = useState<DCFScenario[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedModel = useMemo(
    () => models.find((model) => model.id === selectedModelId) ?? null,
    [models, selectedModelId]
  );

  // Load user's models
  useEffect(() => {
    const loadModels = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userModels = await dataService.listModels();
        setModels(userModels);
        
        if (userModels.length > 0) {
          setSelectedModelId(userModels[0].id!);
        }
      } catch (err) {
        setError('Failed to load models');
        console.error('Error loading models:', err);
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, [user, dataService]);

  // Load scenarios for selected model
  useEffect(() => {
    const loadScenarios = async () => {
      if (!selectedModelId) return;
      
      try {
        setLoading(true);
        const modelScenarios = await dataService.listScenarios(selectedModelId);
        setScenarios(modelScenarios);
      } catch (err) {
        setError('Failed to load scenarios');
        console.error('Error loading scenarios:', err);
      } finally {
        setLoading(false);
      }
    };

    loadScenarios();
  }, [selectedModelId, dataService]);

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
  };

  const handleScenarioSelect = (scenario: DCFScenario) => {
    onScenarioSelect(scenario);
  };

  const cloneIncomeStatement = (data?: IncomeStatementData) => {
    if (!data) return undefined;
    return Object.fromEntries(
      Object.entries(data).map(([year, entry]) => [
        Number(year),
        { ...entry }
      ])
    );
  };

  const cloneIncomeStatementAdjustments = (data?: IncomeStatementAdjustments) => {
    if (!data) return undefined;
    return Object.fromEntries(
      Object.entries(data).map(([year, entry]) => [
        Number(year),
        { ...entry }
      ])
    );
  };

  const getDefaultEbitdaData = () => {
    if (selectedModel?.ebitdaData && Object.keys(selectedModel.ebitdaData).length > 0) {
      return { ...selectedModel.ebitdaData };
    }
    const currentYear = new Date().getFullYear();
    return { [currentYear]: 0 };
  };

  const getUniqueScenarioName = () => {
    const baseName = 'New Scenario';
    if (!scenarios.some((scenario) => scenario.scenarioName === baseName)) {
      return baseName;
    }

    let suffix = 2;
    while (scenarios.some((scenario) => scenario.scenarioName === `${baseName} ${suffix}`)) {
      suffix += 1;
    }

    return `${baseName} ${suffix}`;
  };

  const handleCreateScenario = async () => {
    if (!selectedModelId) return;
    
    try {
      setError(null);

      const newScenario: Omit<DCFScenario, 'id'> = {
        userId: user?.id,
        modelId: selectedModelId,
        scenarioName: getUniqueScenarioName(),
        description: '',
        discountRate: selectedModel?.discountRate,
        perpetuityRate: selectedModel?.perpetuityRate,
        corporateTaxRate: selectedModel?.corporateTaxRate,
        ebitdaData: getDefaultEbitdaData(),
        incomeStatementData: cloneIncomeStatement(selectedModel?.incomeStatementData),
        incomeStatementAdjustments: cloneIncomeStatementAdjustments(selectedModel?.incomeStatementAdjustments),
        isBaseScenario: false,
        sortOrder: scenarios.length
      };
      
      const scenarioId = await dataService.saveScenario(newScenario as DCFScenario);
      const savedScenario = await dataService.loadScenario(scenarioId);
      
      if (savedScenario) {
        setScenarios(prev => [...prev, savedScenario]);
        onScenarioSelect(savedScenario);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create scenario';
      setError(message);
      console.error('Error creating scenario:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading scenarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Model Selector */}
      <div>
        <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Model
        </label>
        <select
          id="model-select"
          value={selectedModelId}
          onChange={(e) => handleModelChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a model...</option>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.modelName}
            </option>
          ))}
        </select>
      </div>

      {/* Scenarios List */}
      {selectedModelId && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-medium text-gray-900">Scenarios</h3>
            <button
              onClick={handleCreateScenario}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              + New Scenario
            </button>
          </div>
          
          <div className="space-y-2">
            {scenarios.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No scenarios found for this model.</p>
                <p className="text-sm">Create your first scenario to get started.</p>
              </div>
            ) : (
              scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedScenarioId === scenario.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleScenarioSelect(scenario)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {scenario.scenarioName}
                        {scenario.isBaseScenario && (
                          <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Base
                          </span>
                        )}
                      </h4>
                      {scenario.description && (
                        <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {scenario.enterpriseValue && (
                        <p className="text-sm font-medium text-gray-900">
                          ${scenario.enterpriseValue.toLocaleString()}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        {scenario.updatedAt ? new Date(scenario.updatedAt).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
