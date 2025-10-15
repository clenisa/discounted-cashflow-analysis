import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ModelManager } from '@/components/models/ModelManager';
import { ScenarioManager } from '@/components/scenarios/ScenarioManager';
import { DCFCalculator } from '@/components/dcf/DCFCalculator';
import { ScenarioComparison } from '@/components/comparison/ScenarioComparison';
import type { DCFModel, DCFScenario, DCFDataSet } from '@/types/dcf';

type DashboardView = 'models' | 'scenarios' | 'calculator' | 'comparison';

export const CorporateFinanceDashboard: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<DashboardView>('models');
  const [selectedModel, setSelectedModel] = useState<DCFModel | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<DCFScenario | null>(null);
  const [scenarios, setScenarios] = useState<DCFScenario[]>([]);

  // Convert DCFScenario to DCFDataSet for compatibility with existing components
  const selectedDataSet: DCFDataSet | null = selectedScenario ? {
    id: selectedScenario.id!,
    label: selectedScenario.scenarioName,
    ebitdaData: selectedScenario.ebitdaData || {},
    parameters: {
      discountRate: selectedScenario.discountRate || selectedModel?.discountRate || 20,
      perpetuityRate: selectedScenario.perpetuityRate || selectedModel?.perpetuityRate || 4,
      corporateTaxRate: selectedScenario.corporateTaxRate || selectedModel?.corporateTaxRate || 25
    },
    useIncomeStatement: false,
    baseCurrency: selectedModel?.baseCurrency || 'EUR'
  } : null;

  const handleModelSelect = (model: DCFModel) => {
    setSelectedModel(model);
    setSelectedScenario(null);
    setCurrentView('scenarios');
  };

  const handleScenarioSelect = (scenario: DCFScenario) => {
    setSelectedScenario(scenario);
    setCurrentView('calculator');
  };

  const handleBackToModels = () => {
    setSelectedModel(null);
    setSelectedScenario(null);
    setCurrentView('models');
  };

  const handleBackToScenarios = () => {
    setSelectedScenario(null);
    setCurrentView('scenarios');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Corporate Finance Dashboard</h2>
          <p className="text-gray-600 mb-8">Please sign in to access your DCF models and scenarios.</p>
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Corporate Finance</h1>
              {selectedModel && (
                <div className="ml-4 flex items-center text-sm text-gray-500">
                  <span>/</span>
                  <span className="ml-2">{selectedModel.modelName}</span>
                  {selectedScenario && (
                    <>
                      <span className="ml-2">/</span>
                      <span className="ml-2">{selectedScenario.scenarioName}</span>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Welcome, {user.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentView('models')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'models'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Models
            </button>
            
            {selectedModel && (
              <button
                onClick={() => setCurrentView('scenarios')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentView === 'scenarios'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Scenarios
              </button>
            )}
            
            {selectedScenario && (
              <>
                <button
                  onClick={() => setCurrentView('calculator')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    currentView === 'calculator'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Calculator
                </button>
                
                <button
                  onClick={() => setCurrentView('comparison')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    currentView === 'comparison'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Comparison
                </button>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Breadcrumb */}
      {(selectedModel || selectedScenario) && (
        <div className="bg-gray-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <button
                    onClick={handleBackToModels}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    Models
                  </button>
                </li>
                
                {selectedModel && (
                  <>
                    <li>
                      <div className="flex items-center">
                        <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        <button
                          onClick={handleBackToScenarios}
                          className="ml-4 text-gray-500 hover:text-gray-700 text-sm font-medium"
                        >
                          {selectedModel.modelName}
                        </button>
                      </div>
                    </li>
                  </>
                )}
                
                {selectedScenario && (
                  <li>
                    <div className="flex items-center">
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-4 text-gray-500 text-sm font-medium">
                        {selectedScenario.scenarioName}
                      </span>
                    </div>
                  </li>
                )}
              </ol>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'models' && (
          <ModelManager
            onModelSelect={handleModelSelect}
            selectedModelId={selectedModel?.id}
          />
        )}
        
        {currentView === 'scenarios' && selectedModel && (
          <ScenarioManager
            onScenarioSelect={handleScenarioSelect}
            selectedScenarioId={selectedScenario?.id}
          />
        )}
        
        {currentView === 'calculator' && selectedDataSet && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                DCF Calculator - {selectedScenario?.scenarioName}
              </h2>
              <DCFCalculator dataSet={selectedDataSet} />
            </div>
          </div>
        )}
        
        {currentView === 'comparison' && scenarios.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Scenario Comparison
              </h2>
              <ScenarioComparison scenarios={scenarios.map(s => ({
                id: s.id!,
                label: s.scenarioName,
                ebitdaData: s.ebitdaData || {},
                parameters: {
                  discountRate: s.discountRate || selectedModel?.discountRate || 20,
                  perpetuityRate: s.perpetuityRate || selectedModel?.perpetuityRate || 4,
                  corporateTaxRate: s.corporateTaxRate || selectedModel?.corporateTaxRate || 25
                },
                useIncomeStatement: false,
                baseCurrency: selectedModel?.baseCurrency || 'EUR'
              }))} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};