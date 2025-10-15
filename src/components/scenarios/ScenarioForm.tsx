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
    useIncomeStatement: scenario?.useIncomeStatement || false,
    isBaseScenario: scenario?.isBaseScenario || false
  });

  const [ebitdaYears, setEbitdaYears] = useState<number[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize years from current year to 5 years ahead
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear + i);
    setEbitdaYears(years);
  }, []);

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
        const isIncomeStatement = formData.useIncomeStatement;
        
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
    const isIncomeStatement = formData.useIncomeStatement;
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
        useIncomeStatement: formData.useIncomeStatement,
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

        {/* Input Mode Toggle */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-md font-medium text-gray-900">Financial Data Input</h4>
              <p className="text-sm text-gray-500">
                Choose how to input financial data for this scenario
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, useIncomeStatement: !prev.useIncomeStatement }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.useIncomeStatement ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.useIncomeStatement ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex space-x-4 text-sm">
            <span className={!formData.useIncomeStatement ? 'font-medium text-blue-600' : 'text-gray-500'}>
              EBITDA Direct
            </span>
            <span className={formData.useIncomeStatement ? 'font-medium text-blue-600' : 'text-gray-500'}>
              Income Statement
            </span>
          </div>
        </div>

        {/* Financial Data Input */}
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-gray-900">
              {formData.useIncomeStatement ? 'Income Statement Data' : 'EBITDA Projections'}
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
                {formData.useIncomeStatement ? (
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

          {!formData.useIncomeStatement ? (
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
          ) : (
            // Income Statement Input
            <div className="space-y-4">
              {ebitdaYears.map(year => (
                <div key={year} className="border border-gray-200 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">{year}</h5>
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
                    <h6 className="text-xs font-medium text-gray-700 mb-2">Adjustment Matrix (%)</h6>
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