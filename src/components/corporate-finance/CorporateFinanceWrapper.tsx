import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDataService } from '@/hooks/useDataService';
import { ModelManager } from '@/components/models/ModelManager';
import { ScenarioManager } from '@/components/scenarios/ScenarioManager';
import { DCFCalculator } from '@/components/dcf/DCFCalculator';
import { ScenarioComparison } from '@/components/comparison/ScenarioComparison';
import type { DCFModel, DCFScenario, DCFDataSet } from '@/types/dcf';

type DashboardView = 'models' | 'scenarios' | 'calculator' | 'comparison';

interface CorporateFinanceWrapperProps {
  onSectionChange?: (section: any) => void;
}

export const CorporateFinanceWrapper: React.FC<CorporateFinanceWrapperProps> = ({ onSectionChange }) => {
  const { user } = useAuth();
  const dataService = useDataService();
  const [currentView, setCurrentView] = useState<DashboardView>('models');
  const [selectedModel, setSelectedModel] = useState<DCFModel | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<DCFScenario | null>(null);
  const [scenarios, setScenarios] = useState<DCFScenario[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleModelDelete = async (modelId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      await dataService.deleteModel(modelId);
      
      // If deleted model was selected, clear selection
      if (selectedModel?.id === modelId) {
        setSelectedModel(null);
        setSelectedScenario(null);
        setCurrentView('models');
      }
      
      // Refresh models list
      const updatedModels = await dataService.listModels();
      // Note: This would need to be handled by ModelManager
    } catch (error) {
      console.error('Failed to delete model:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioDelete = async (scenarioId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      if (scenarioId) {
        await dataService.deleteScenario(scenarioId);
      }
      
      // If deleted scenario was selected, clear selection
      if (selectedScenario?.id === scenarioId) {
        setSelectedScenario(null);
        setCurrentView('scenarios');
      }
      
      // Refresh scenarios list
      if (selectedModel?.id) {
        const updatedScenarios = await dataService.listScenarios(selectedModel.id);
        setScenarios(updatedScenarios);
      }
    } catch (error) {
      console.error('Failed to delete scenario:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioEdit = (scenario: DCFScenario) => {
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

  // Generate breadcrumbs for navigation
  const breadcrumbs = useMemo(() => {
    const items: Array<{ label: string; href?: string }> = [{ label: 'Corporate Finance' }];
    
    if (selectedModel) {
      items.push({ 
        label: selectedModel.modelName,
        href: `/corporate-finance/${selectedModel.id}`
      });
    }
    
    if (selectedScenario) {
      items.push({ label: selectedScenario.scenarioName });
    }
    
    return items;
  }, [selectedModel, selectedScenario]);

  // Navigation header content
  const headerContent = (
    <div className="flex items-center space-x-4">
      <nav className="flex space-x-8">
        <button
          onClick={() => setCurrentView('models')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            currentView === 'models'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          Models
        </button>
        
        {selectedModel && (
          <button
            onClick={() => setCurrentView('scenarios')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              currentView === 'scenarios'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Scenarios
          </button>
        )}
        
        {selectedScenario && (
          <>
            <button
              onClick={() => setCurrentView('calculator')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentView === 'calculator'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Calculator
            </button>
            
            <button
              onClick={() => setCurrentView('comparison')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentView === 'comparison'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Comparison
            </button>
          </>
        )}
      </nav>
    </div>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
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
    <>
      {/* Header Content */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {headerContent}
        </div>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 1 && (
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
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900">DCF Models</h2>
                <p className="text-sm text-gray-500">Create and manage your DCF models</p>
              </div>
              <ModelManager
                onModelSelect={handleModelSelect}
                selectedModelId={selectedModel?.id}
                onModelDelete={handleModelDelete}
              />
            </div>
          </div>
        )}
        
        {currentView === 'scenarios' && selectedModel && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Scenarios for {selectedModel.modelName}</h2>
                  <p className="text-sm text-gray-500">Create and manage scenarios for this model</p>
                </div>
                <button
                  onClick={() => setCurrentView('models')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Back to Models
                </button>
              </div>
              <ScenarioManager
                onScenarioSelect={handleScenarioSelect}
                selectedScenarioId={selectedScenario?.id}
                selectedModelId={selectedModel.id}
                onScenarioDelete={handleScenarioDelete}
                onScenarioEdit={handleScenarioEdit}
                onScenariosChange={setScenarios}
              />
            </div>
          </div>
        )}
        
        {currentView === 'calculator' && selectedDataSet && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    DCF Calculator - {selectedScenario?.scenarioName}
                  </h2>
                  <p className="text-sm text-gray-500">Model: {selectedModel?.modelName}</p>
                </div>
                <button
                  onClick={() => setCurrentView('scenarios')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Back to Scenarios
                </button>
              </div>
              <DCFCalculator dataSet={selectedDataSet} />
            </div>
          </div>
        )}
        
        {currentView === 'comparison' && scenarios.length > 0 && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Scenario Comparison
                  </h2>
                  <p className="text-sm text-gray-500">Compare scenarios for {selectedModel?.modelName}</p>
                </div>
                <button
                  onClick={() => setCurrentView('scenarios')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Back to Scenarios
                </button>
              </div>
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
    </>
  );
};