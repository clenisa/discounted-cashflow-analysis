import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UnifiedLayout, ReturnProSection } from '@/layouts/UnifiedLayout';
import { ModelManager } from '@/components/models/ModelManager';
import { ScenarioManager } from '@/components/scenarios/ScenarioManager';
import { DCFCalculator } from '@/components/dcf/DCFCalculator';
import { ScenarioComparison } from '@/components/comparison/ScenarioComparison';
import type { DCFModel, DCFScenario, DCFDataSet } from '@/types/dcf';

type DashboardView = 'models' | 'scenarios' | 'calculator' | 'comparison';

interface CorporateFinanceDashboardProps {
  onSectionChange?: (section: ReturnProSection) => void;
}

export const CorporateFinanceDashboard: React.FC<CorporateFinanceDashboardProps> = ({ onSectionChange }) => {
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
      <UnifiedLayout
        activeSection="corporate-finance"
        onSectionChange={onSectionChange || (() => {})}
        breadcrumbs={breadcrumbs}
      >
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
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout
      activeSection="corporate-finance"
      onSectionChange={onSectionChange || (() => {})}
      headerContent={headerContent}
      breadcrumbs={breadcrumbs}
    >
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
    </UnifiedLayout>
  );
};