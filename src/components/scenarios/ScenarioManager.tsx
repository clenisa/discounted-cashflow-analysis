import React, { useState, useEffect, useMemo } from 'react';
import { useDataService } from '@/hooks/useDataService';
import { useAuth } from '@/contexts/AuthContext';
import { ScenarioForm } from './ScenarioForm';
import type { DCFModel, DCFScenario, IncomeStatementData, IncomeStatementAdjustments } from '@/types/dcf';

interface ScenarioManagerProps {
  onScenarioSelect: (scenario: DCFScenario) => void;
  selectedScenarioId?: string;
  selectedModelId?: string;
  onModelChange?: (model: DCFModel | null) => void;
  onScenariosChange?: (scenarios: DCFScenario[]) => void;
  onScenarioDelete?: (scenarioId: string) => void;
  onScenarioEdit?: (scenario: DCFScenario) => void;
}

export const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  onScenarioSelect,
  selectedScenarioId,
  selectedModelId: controlledModelId,
  onModelChange,
  onScenariosChange,
  onScenarioDelete,
  onScenarioEdit
}) => {
  const { user } = useAuth();
  const dataService = useDataService();
  const [models, setModels] = useState<DCFModel[]>([]);
  const [scenarios, setScenarios] = useState<DCFScenario[]>([]);
  const [activeModelId, setActiveModelId] = useState<string>(controlledModelId ?? '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingScenario, setEditingScenario] = useState<DCFScenario | null>(null);

  const selectedModel = useMemo(
    () => models.find((model) => model.id === activeModelId) ?? null,
    [models, activeModelId]
  );

  useEffect(() => {
    if (controlledModelId && controlledModelId !== activeModelId) {
      setActiveModelId(controlledModelId);
    }
  }, [controlledModelId, activeModelId]);

  useEffect(() => {
    onModelChange?.(selectedModel ?? null);
  }, [selectedModel, onModelChange]);

  useEffect(() => {
    onScenariosChange?.(scenarios);
  }, [scenarios, onScenariosChange]);

  // Load user's models
  useEffect(() => {
    const loadModels = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userModels = await dataService.listModels();
        setModels(userModels);
        
        if (userModels.length > 0) {
          const initialModel = controlledModelId
            ? userModels.find((model) => model.id === controlledModelId) ?? userModels[0]
            : userModels[0];
          setActiveModelId(initialModel.id ?? '');
        }
      } catch (err) {
        setError('Failed to load models');
        console.error('Error loading models:', err);
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, [user, dataService, controlledModelId]);

  // Load scenarios for selected model
  useEffect(() => {
    const loadScenarios = async () => {
      if (!activeModelId) return;
      
      try {
        setLoading(true);
        const modelScenarios = await dataService.listScenarios(activeModelId);
        setScenarios(modelScenarios);
      } catch (err) {
        setError('Failed to load scenarios');
        console.error('Error loading scenarios:', err);
      } finally {
        setLoading(false);
      }
    };

    loadScenarios();
  }, [activeModelId, dataService]);

  const handleModelChange = (modelId: string) => {
    setActiveModelId(modelId);
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

  const handleCreateScenario = () => {
    setShowCreateForm(true);
  };

  const handleEditScenario = (scenario: DCFScenario) => {
    setEditingScenario(scenario);
  };

  const handleScenarioSubmit = (scenario: DCFScenario) => {
    if (editingScenario) {
      // Update existing scenario
      setScenarios(prev => prev.map(s => s.id === scenario.id ? scenario : s));
      setEditingScenario(null);
    } else {
      // Add new scenario
      setScenarios(prev => [...prev, scenario]);
      setShowCreateForm(false);
    }
    onScenarioSelect(scenario);
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingScenario(null);
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    if (!confirm('Are you sure you want to delete this scenario? This action cannot be undone.')) {
      return;
    }
    
    try {
      await dataService.deleteScenario(scenarioId);
      setScenarios(prev => prev.filter(scenario => scenario.id !== scenarioId));
      onScenarioDelete?.(scenarioId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete scenario';
      setError(message);
      console.error('Error deleting scenario:', err);
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
          value={activeModelId}
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
      {activeModelId && (
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

          {/* Scenario Form */}
          {(showCreateForm || editingScenario) && selectedModel && (
            <div className="mb-6">
              <ScenarioForm
                model={selectedModel}
                scenario={editingScenario || undefined}
                onSubmit={handleScenarioSubmit}
                onCancel={handleCancelForm}
                isEditing={!!editingScenario}
              />
            </div>
          )}
          
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
                    <div className="flex-1">
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
                    <div className="flex items-center gap-3">
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
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditScenario(scenario);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 focus:outline-none"
                          title="Edit scenario"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteScenario(scenario.id!);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 focus:outline-none"
                          title="Delete scenario"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
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
