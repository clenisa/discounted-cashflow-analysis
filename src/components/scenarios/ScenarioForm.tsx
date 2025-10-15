import React, { useState, useEffect } from 'react';
import { useDataService } from '@/hooks/useDataService';
import { useAuth } from '@/contexts/AuthContext';
import type { DCFScenario, DCFModel } from '@/types/dcf';

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
    isBaseScenario: scenario?.isBaseScenario || false
  });

  const [ebitdaYears, setEbitdaYears] = useState<number[]>([]);

  useEffect(() => {
    // Initialize years from current year to 5 years ahead
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear + i);
    setEbitdaYears(years);
  }, []);

  const handleEbitdaChange = (year: number, value: number) => {
    setFormData(prev => ({
      ...prev,
      ebitdaData: {
        ...prev.ebitdaData,
        [year]: value
      }
    }));
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
        incomeStatementData: model.incomeStatementData ? { ...model.incomeStatementData } : undefined,
        incomeStatementAdjustments: model.incomeStatementAdjustments ? { ...model.incomeStatementAdjustments } : undefined,
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

        {/* EBITDA Data */}
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">EBITDA Projections</h4>
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