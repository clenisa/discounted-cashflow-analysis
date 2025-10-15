import React, { useState, useEffect, useRef } from 'react';
import { useDataService } from '@/hooks/useDataService';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Download, FileText, AlertCircle } from 'lucide-react';
import type { DCFScenario, DCFModel, IncomeStatementData, IncomeStatementAdjustments } from '@/types/dcf';

interface ScenarioFormProps {
  model: DCFModel;
  scenario?: DCFScenario;
  onSubmit: (scenario: DCFScenario) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export const ScenarioForm: React.FC<ScenarioFormProps> = ({
  model,
  scenario,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const { user } = useAuth();
  const dataService = useDataService();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    scenarioName: scenario?.scenarioName || '',
    description: scenario?.description || '',
    discountRate: scenario?.discountRate || model.discountRate || 20,
    perpetuityRate: scenario?.perpetuityRate || model.perpetuityRate || 4,
    corporateTaxRate: scenario?.corporateTaxRate || model.corporateTaxRate || 25,
    ebitdaData: scenario?.ebitdaData || { [new Date().getFullYear()]: 0 },
    incomeStatementData: scenario?.incomeStatementData,
    incomeStatementAdjustments: scenario?.incomeStatementAdjustments,
    inputMode: scenario?.inputMode || 'ebitda' as 'ebitda' | 'income-statement' | 'adjustment-matrix',
    baseScenarioId: scenario?.baseScenarioId,
    parameterAdjustments: scenario?.parameterAdjustments || {
      discountRateAdjustment: 0,
      perpetuityRateAdjustment: 0,
      corporateTaxRateAdjustment: 0
    },
    isBaseScenario: scenario?.isBaseScenario || false
  });

  const [ebitdaYears, setEbitdaYears] = useState<number[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [availableScenarios, setAvailableScenarios] = useState<DCFScenario[]>([]);
  const [baseScenario, setBaseScenario] = useState<DCFScenario | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize years from current year to 5 years ahead
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear + i);
    setEbitdaYears(years);
  }, []);

  useEffect(() => {
    // Load available scenarios for adjustment matrix
    const loadScenarios = async () => {
      if (formData.inputMode === 'adjustment-matrix') {
        try {
          const scenarios = await dataService.listScenarios(model.id!);
          setAvailableScenarios(scenarios.filter(s => s.id !== scenario?.id)); // Exclude current scenario
        } catch (error) {
          console.error('Failed to load scenarios:', error);
        }
      }
    };
    loadScenarios();
  }, [formData.inputMode, model.id, scenario?.id, dataService]);

  useEffect(() => {
    // Load base scenario data when selected
    const loadBaseScenario = async () => {
      if (formData.baseScenarioId && formData.inputMode === 'adjustment-matrix') {
        try {
          const baseScenarioData = await dataService.loadScenario(formData.baseScenarioId);
          setBaseScenario(baseScenarioData);
        } catch (error) {
          console.error('Failed to load base scenario:', error);
        }
      }
    };
    loadBaseScenario();
  }, [formData.baseScenarioId, formData.inputMode, dataService]);

  const parseCSV = (csvText: string, isIncomeStatement: boolean = false) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    if (isIncomeStatement) {
      // Expected format: Year,Revenue,COGS,SGA,Depreciation,Amortization
      const requiredHeaders = ['year', 'revenue', 'cogs', 'sga', 'depreciation', 'amortization'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      }
      
      const incomeStatementData: IncomeStatementData = {};
      const adjustments: IncomeStatementAdjustments = {};
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const year = parseInt(values[0]);
        
        if (isNaN(year)) continue;
        
        incomeStatementData[year] = {
          revenue: parseFloat(values[1]) || 0,
          cogs: parseFloat(values[2]) || 0,
          sga: parseFloat(values[3]) || 0,
          depreciation: parseFloat(values[4]) || 0,
          amortization: parseFloat(values[5]) || 0
        };
        
        adjustments[year] = {
          revenueAdjustment: 0,
          cogsAdjustment: 0,
          sgaAdjustment: 0
        };
      }
      
      return { incomeStatementData, adjustments };
    } else {
      // Expected format: Year,EBITDA
      if (!headers.includes('year') || !headers.includes('ebitda')) {
        throw new Error('CSV must contain "Year" and "EBITDA" columns');
      }
      
      const ebitdaData: { [year: number]: number } = {};
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const year = parseInt(values[0]);
        const ebitda = parseFloat(values[1]);
        
        if (!isNaN(year) && !isNaN(ebitda)) {
          ebitdaData[year] = ebitda;
        }
      }
      
      return { ebitdaData };
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const isIncomeStatement = formData.inputMode === 'income-statement';
        
        if (isIncomeStatement) {
          const { incomeStatementData, adjustments } = parseCSV(csvText, true);
          setFormData(prev => ({
            ...prev,
            incomeStatementData: incomeStatementData || undefined,
            incomeStatementAdjustments: adjustments || undefined
          }));
        } else {
          const { ebitdaData } = parseCSV(csvText, false);
          setFormData(prev => ({
            ...prev,
            ebitdaData: ebitdaData || prev.ebitdaData
          }));
        }
        
        setCsvError(null);
      } catch (error) {
        setCsvError(error instanceof Error ? error.message : 'Failed to parse CSV');
      }
    };
    
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const isIncomeStatement = formData.inputMode === 'income-statement';
    let csvContent: string;
    
    if (isIncomeStatement) {
      csvContent = 'Year,Revenue,COGS,SGA,Depreciation,Amortization\n';
      ebitdaYears.forEach(year => {
        csvContent += `${year},0,0,0,0,0\n`;
      });
    } else {
      csvContent = 'Year,EBITDA\n';
      ebitdaYears.forEach(year => {
        csvContent += `${year},0\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${isIncomeStatement ? 'income_statement' : 'ebitda'}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleEbitdaChange = (year: number, value: number) => {
    setFormData(prev => ({
      ...prev,
      ebitdaData: {
        ...prev.ebitdaData,
        [year]: value
      }
    }));
  };

  const handleIncomeStatementChange = (year: number, field: keyof IncomeStatementData[number], value: number) => {
    setFormData(prev => {
      const currentData = prev.incomeStatementData || {};
      const existingYearData = currentData[year] || {
        revenue: 0,
        cogs: 0,
        sga: 0,
        depreciation: 0,
        amortization: 0
      };
      
      return {
        ...prev,
        incomeStatementData: {
          ...currentData,
          [year]: {
            ...existingYearData,
            [field]: value
          }
        }
      };
    });
  };

  const handleAdjustmentChange = (year: number, field: keyof IncomeStatementAdjustments[number], value: number) => {
    setFormData(prev => {
      const currentAdjustments = prev.incomeStatementAdjustments || {};
      const existingYearAdjustments = currentAdjustments[year] || {
        revenueAdjustment: 0,
        cogsAdjustment: 0,
        sgaAdjustment: 0
      };
      
      return {
        ...prev,
        incomeStatementAdjustments: {
          ...currentAdjustments,
          [year]: {
            ...existingYearAdjustments,
            [field]: value
          }
        }
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const scenarioData: Omit<DCFScenario, 'id'> = {
        userId: user.id,
        modelId: model.id!,
        scenarioName: formData.scenarioName,
        description: formData.description,
        discountRate: formData.discountRate,
        perpetuityRate: formData.perpetuityRate,
        corporateTaxRate: formData.corporateTaxRate,
        ebitdaData: formData.ebitdaData,
        incomeStatementData: formData.incomeStatementData,
        incomeStatementAdjustments: formData.incomeStatementAdjustments,
        inputMode: formData.inputMode,
        baseCurrency: model.baseCurrency || 'EUR',
        isBaseScenario: formData.isBaseScenario,
        sortOrder: scenario?.sortOrder || 0,
        createdAt: scenario?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let savedScenario: DCFScenario;
      if (isEditing && scenario?.id) {
        // Update existing scenario - for now, just save as new since updateScenario doesn't exist
        const scenarioId = await dataService.saveScenario(scenarioData as DCFScenario);
        const loaded = await dataService.loadScenario(scenarioId);
        if (!loaded) throw new Error('Failed to load updated scenario');
        savedScenario = loaded;
      } else {
        // Create new scenario
        const scenarioId = await dataService.saveScenario(scenarioData as DCFScenario);
        const loaded = await dataService.loadScenario(scenarioId);
        if (!loaded) throw new Error('Failed to load created scenario');
        savedScenario = loaded;
      }

      onSubmit(savedScenario);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save scenario';
      setError(message);
      console.error('Error saving scenario:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          {isEditing ? 'Edit Scenario' : 'Create New Scenario'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="scenarioName" className="block text-sm font-medium text-gray-700 mb-1">
              Scenario Name *
            </label>
            <input
              type="text"
              id="scenarioName"
              value={formData.scenarioName}
              onChange={(e) => setFormData(prev => ({ ...prev, scenarioName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isBaseScenario"
              checked={formData.isBaseScenario}
              onChange={(e) => setFormData(prev => ({ ...prev, isBaseScenario: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isBaseScenario" className="ml-2 block text-sm text-gray-700">
              Base Scenario
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Financial Parameters */}
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Financial Parameters</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="discountRate" className="block text-sm font-medium text-gray-700 mb-1">
                Discount Rate (%)
              </label>
              <input
                type="number"
                id="discountRate"
                value={formData.discountRate}
                onChange={(e) => setFormData(prev => ({ ...prev, discountRate: Number(e.target.value) }))}
                step="0.1"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="perpetuityRate" className="block text-sm font-medium text-gray-700 mb-1">
                Perpetuity Growth Rate (%)
              </label>
              <input
                type="number"
                id="perpetuityRate"
                value={formData.perpetuityRate}
                onChange={(e) => setFormData(prev => ({ ...prev, perpetuityRate: Number(e.target.value) }))}
                step="0.1"
                min="0"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="corporateTaxRate" className="block text-sm font-medium text-gray-700 mb-1">
                Corporate Tax Rate (%)
              </label>
              <input
                type="number"
                id="corporateTaxRate"
                value={formData.corporateTaxRate}
                onChange={(e) => setFormData(prev => ({ ...prev, corporateTaxRate: Number(e.target.value) }))}
                step="0.1"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Input Mode Selection */}
        <div className="border-t pt-6">
          <div className="mb-4">
            <h4 className="text-md font-medium text-gray-900">Financial Data Input Mode</h4>
            <p className="text-sm text-gray-500">
              Choose how to input financial data for this scenario
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* EBITDA Mode */}
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.inputMode === 'ebitda' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, inputMode: 'ebitda' }))}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  formData.inputMode === 'ebitda' 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {formData.inputMode === 'ebitda' && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">EBITDA Direct</h5>
                  <p className="text-sm text-gray-500">Input EBITDA values directly</p>
                </div>
              </div>
            </div>

            {/* Income Statement Mode */}
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.inputMode === 'income-statement' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, inputMode: 'income-statement' }))}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  formData.inputMode === 'income-statement' 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {formData.inputMode === 'income-statement' && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">Income Statement</h5>
                  <p className="text-sm text-gray-500">Input detailed income statement</p>
                </div>
              </div>
            </div>

            {/* Adjustment Matrix Mode */}
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                formData.inputMode === 'adjustment-matrix' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, inputMode: 'adjustment-matrix' }))}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  formData.inputMode === 'adjustment-matrix' 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                }`}>
                  {formData.inputMode === 'adjustment-matrix' && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
                <div>
                  <h5 className="font-medium text-gray-900">Adjustment Matrix</h5>
                  <p className="text-sm text-gray-500">Adjust from base scenario</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Data Input */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">
              {formData.inputMode === 'income-statement' ? 'Income Statement Data' : formData.inputMode === 'adjustment-matrix' ? 'Adjustment Matrix' : 'EBITDA Projections'}
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download size={16} />
                Download Template
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
              >
                <Upload size={16} />
                Upload CSV
              </button>
            </div>
          </div>

          {csvError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md flex items-center gap-2">
              <AlertCircle size={16} />
              {csvError}
            </div>
          )}

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-2">
              <FileText size={16} className="text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">CSV Format Requirements:</p>
                {formData.inputMode === 'income-statement' ? (
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Required columns: Year, Revenue, COGS, SGA, Depreciation, Amortization</li>
                    <li>First row must contain headers (case insensitive)</li>
                    <li>Values should be numbers (no currency symbols)</li>
                    <li>Years should be 4-digit format (e.g., 2024)</li>
                  </ul>
                ) : (
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Required columns: Year, EBITDA</li>
                    <li>First row must contain headers (case insensitive)</li>
                    <li>Values should be numbers (no currency symbols)</li>
                    <li>Years should be 4-digit format (e.g., 2024)</li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Base Scenario Selection for Adjustment Matrix */}
          {formData.inputMode === 'adjustment-matrix' && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Base Scenario Selection</h5>
              <div className="space-y-3">
                <div>
                  <label htmlFor="baseScenario" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Base Scenario
                  </label>
                  <select
                    id="baseScenario"
                    value={formData.baseScenarioId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseScenarioId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a base scenario...</option>
                    {availableScenarios.map(scenario => (
                      <option key={scenario.id} value={scenario.id}>
                        {scenario.scenarioName}
                      </option>
                    ))}
                  </select>
                </div>
                
                {baseScenario && (
                  <div className="p-3 bg-white border border-gray-200 rounded-md">
                    <h6 className="text-sm font-medium text-gray-900 mb-2">Base Scenario Details</h6>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Discount Rate:</span>
                        <span className="ml-1 font-medium">{baseScenario.discountRate || model.discountRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Perpetuity Rate:</span>
                        <span className="ml-1 font-medium">{baseScenario.perpetuityRate || model.perpetuityRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Tax Rate:</span>
                        <span className="ml-1 font-medium">{baseScenario.corporateTaxRate || model.corporateTaxRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Input Mode:</span>
                        <span className="ml-1 font-medium capitalize">{baseScenario.inputMode || 'ebitda'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Adjustment Matrix Interface */}
          {formData.inputMode === 'adjustment-matrix' && baseScenario && (
            <div className="mb-6">
              <h5 className="text-md font-medium text-gray-900 mb-4">Adjustment Matrix</h5>
              
              {/* Financial Parameter Adjustments */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h6 className="text-sm font-medium text-gray-900 mb-3">Financial Parameter Adjustments (%)</h6>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Discount Rate Adjustment</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.parameterAdjustments?.discountRateAdjustment || 0}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          parameterAdjustments: {
                            ...prev.parameterAdjustments,
                            discountRateAdjustment: Number(e.target.value)
                          }
                        }))}
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Base: {(baseScenario.discountRate || model.discountRate).toFixed(1)}% → New: {((baseScenario.discountRate || model.discountRate) * (1 + (formData.parameterAdjustments?.discountRateAdjustment || 0) / 100)).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Perpetuity Rate Adjustment</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.parameterAdjustments?.perpetuityRateAdjustment || 0}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          parameterAdjustments: {
                            ...prev.parameterAdjustments,
                            perpetuityRateAdjustment: Number(e.target.value)
                          }
                        }))}
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Base: {(baseScenario.perpetuityRate || model.perpetuityRate).toFixed(1)}% → New: {((baseScenario.perpetuityRate || model.perpetuityRate) * (1 + (formData.parameterAdjustments?.perpetuityRateAdjustment || 0) / 100)).toFixed(1)}%
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tax Rate Adjustment</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.parameterAdjustments?.corporateTaxRateAdjustment || 0}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          parameterAdjustments: {
                            ...prev.parameterAdjustments,
                            corporateTaxRateAdjustment: Number(e.target.value)
                          }
                        }))}
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Base: {(baseScenario.corporateTaxRate || model.corporateTaxRate).toFixed(1)}% → New: {((baseScenario.corporateTaxRate || model.corporateTaxRate) * (1 + (formData.parameterAdjustments?.corporateTaxRateAdjustment || 0) / 100)).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* EBITDA Adjustments */}
              {baseScenario.inputMode === 'ebitda' && baseScenario.ebitdaData && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h6 className="text-sm font-medium text-gray-900 mb-3">EBITDA Adjustments (%)</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ebitdaYears.map(year => {
                      const baseEbitda = baseScenario.ebitdaData?.[year] || 0;
                      const adjustment = formData.incomeStatementAdjustments?.[year]?.revenueAdjustment || 0;
                      const newEbitda = baseEbitda * (1 + adjustment / 100);
                      
                      return (
                        <div key={year} className="p-3 bg-white border border-gray-200 rounded-md">
                          <div className="text-sm font-medium text-gray-900 mb-2">{year}</div>
                          <div className="space-y-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Adjustment %</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={adjustment}
                                  onChange={(e) => handleAdjustmentChange(year, 'revenueAdjustment', Number(e.target.value))}
                                  step="0.1"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                                <span className="text-sm text-gray-500">%</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-600">
                              Base: {baseEbitda.toLocaleString()} → New: <span className="font-medium text-green-600">{newEbitda.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Income Statement Adjustments */}
              {baseScenario.inputMode === 'income-statement' && baseScenario.incomeStatementData && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h6 className="text-sm font-medium text-gray-900 mb-3">Income Statement Adjustments (%)</h6>
                  <div className="space-y-4">
                    {ebitdaYears.map(year => {
                      const baseData = baseScenario.incomeStatementData?.[year];
                      const adjustments = formData.incomeStatementAdjustments?.[year] || {
                        revenueAdjustment: 0,
                        cogsAdjustment: 0,
                        sgaAdjustment: 0
                      };
                      
                      if (!baseData) return null;
                      
                      const adjustedData = {
                        revenue: baseData.revenue * (1 + (adjustments.revenueAdjustment || 0) / 100),
                        cogs: baseData.cogs * (1 + (adjustments.cogsAdjustment || 0) / 100),
                        sga: baseData.sga * (1 + (adjustments.sgaAdjustment || 0) / 100),
                        depreciation: baseData.depreciation,
                        amortization: baseData.amortization
                      };
                      
                      const adjustedEbitda = adjustedData.revenue - adjustedData.cogs - adjustedData.sga - adjustedData.depreciation - adjustedData.amortization;
                      const baseEbitda = baseData.revenue - baseData.cogs - baseData.sga - baseData.depreciation - baseData.amortization;
                      
                      return (
                        <div key={year} className="p-4 bg-white border border-gray-200 rounded-lg">
                          <div className="text-sm font-medium text-gray-900 mb-3">{year}</div>
                          
                          {/* Adjustment Inputs */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Revenue Adjustment %</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={adjustments.revenueAdjustment || 0}
                                  onChange={(e) => handleAdjustmentChange(year, 'revenueAdjustment', Number(e.target.value))}
                                  step="0.1"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                                <span className="text-sm text-gray-500">%</span>
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                Base: {baseData.revenue.toLocaleString()} → New: <span className="font-medium text-purple-600">{adjustedData.revenue.toLocaleString()}</span>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">COGS Adjustment %</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={adjustments.cogsAdjustment || 0}
                                  onChange={(e) => handleAdjustmentChange(year, 'cogsAdjustment', Number(e.target.value))}
                                  step="0.1"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                                <span className="text-sm text-gray-500">%</span>
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                Base: {baseData.cogs.toLocaleString()} → New: <span className="font-medium text-purple-600">{adjustedData.cogs.toLocaleString()}</span>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">SGA Adjustment %</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={adjustments.sgaAdjustment || 0}
                                  onChange={(e) => handleAdjustmentChange(year, 'sgaAdjustment', Number(e.target.value))}
                                  step="0.1"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                                <span className="text-sm text-gray-500">%</span>
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                Base: {baseData.sga.toLocaleString()} → New: <span className="font-medium text-purple-600">{adjustedData.sga.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* EBITDA Summary */}
                          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                            <div className="text-xs font-medium text-gray-700 mb-1">EBITDA Impact</div>
                            <div className="text-sm">
                              Base EBITDA: {baseEbitda.toLocaleString()} → 
                              <span className="ml-2 font-medium text-purple-600">{adjustedEbitda.toLocaleString()}</span>
                              <span className="ml-2 text-xs text-gray-500">
                                ({(adjustedEbitda - baseEbitda).toLocaleString()} change)
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {formData.inputMode === 'ebitda' && (
            // EBITDA Input
            <div className="space-y-3">
              {ebitdaYears.map(year => (
                <div key={year} className="flex items-center gap-4">
                  <label htmlFor={`ebitda-${year}`} className="w-20 text-sm font-medium text-gray-700">
                    {year}
                  </label>
                  <div className="flex-1">
                    <input
                      type="number"
                      id={`ebitda-${year}`}
                      value={formData.ebitdaData[year] || 0}
                      onChange={(e) => handleEbitdaChange(year, Number(e.target.value))}
                      step="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <span className="text-sm text-gray-500">{model.baseCurrency || 'EUR'}</span>
                </div>
              ))}
            </div>
          )}

          {formData.inputMode === 'income-statement' && (
            // Income Statement Input
            <div className="space-y-4">
              {ebitdaYears.map(year => (
                <div key={year} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-900 mb-3">{year}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Revenue</label>
                      <input
                        type="number"
                        value={formData.incomeStatementData?.[year]?.revenue || 0}
                        onChange={(e) => handleIncomeStatementChange(year, 'revenue', Number(e.target.value))}
                        step="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">COGS</label>
                      <input
                        type="number"
                        value={formData.incomeStatementData?.[year]?.cogs || 0}
                        onChange={(e) => handleIncomeStatementChange(year, 'cogs', Number(e.target.value))}
                        step="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">SGA</label>
                      <input
                        type="number"
                        value={formData.incomeStatementData?.[year]?.sga || 0}
                        onChange={(e) => handleIncomeStatementChange(year, 'sga', Number(e.target.value))}
                        step="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Depreciation</label>
                      <input
                        type="number"
                        value={formData.incomeStatementData?.[year]?.depreciation || 0}
                        onChange={(e) => handleIncomeStatementChange(year, 'depreciation', Number(e.target.value))}
                        step="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Amortization</label>
                      <input
                        type="number"
                        value={formData.incomeStatementData?.[year]?.amortization || 0}
                        onChange={(e) => handleIncomeStatementChange(year, 'amortization', Number(e.target.value))}
                        step="1000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  {/* Adjustment Matrix */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs font-medium text-gray-700 mb-2">Adjustment Matrix (%)</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Revenue Adj.</label>
                        <input
                          type="number"
                          value={formData.incomeStatementAdjustments?.[year]?.revenueAdjustment || 0}
                          onChange={(e) => handleAdjustmentChange(year, 'revenueAdjustment', Number(e.target.value))}
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">COGS Adj.</label>
                        <input
                          type="number"
                          value={formData.incomeStatementAdjustments?.[year]?.cogsAdjustment || 0}
                          onChange={(e) => handleAdjustmentChange(year, 'cogsAdjustment', Number(e.target.value))}
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">SGA Adj.</label>
                        <input
                          type="number"
                          value={formData.incomeStatementAdjustments?.[year]?.sgaAdjustment || 0}
                          onChange={(e) => handleAdjustmentChange(year, 'sgaAdjustment', Number(e.target.value))}
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Scenario' : 'Create Scenario')}
          </button>
        </div>
      </form>
    </div>
  );
};