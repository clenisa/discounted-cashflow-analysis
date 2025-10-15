import React, { useState, useEffect } from 'react';
import { useDataService } from '@/hooks/useDataService';
import { useAuth } from '@/contexts/AuthContext';
import type { DCFModel, DCFModelWithScenarios } from '@/types/dcf';

interface ModelManagerProps {
  onModelSelect: (model: DCFModel) => void;
  selectedModelId?: string;
  onModelDelete?: (modelId: string) => void;
}

export const ModelManager: React.FC<ModelManagerProps> = ({
  onModelSelect,
  selectedModelId,
  onModelDelete
}) => {
  const { user } = useAuth();
  const dataService = useDataService();
  const [models, setModels] = useState<DCFModelWithScenarios[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Load user's models
  useEffect(() => {
    const loadModels = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userModels = await dataService.listModels();
        setModels(userModels as DCFModelWithScenarios[]);
      } catch (err) {
        setError('Failed to load models');
        console.error('Error loading models:', err);
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, [user, dataService]);

  const handleModelSelect = (model: DCFModel) => {
    onModelSelect(model);
  };

  const handleCreateModel = async (modelData: Partial<DCFModel>) => {
    if (!user) return;
    
    try {
      const newModel: Omit<DCFModel, 'id'> = {
        userId: user.id,
        modelName: modelData.modelName || 'New Model',
        companyName: modelData.companyName,
        description: modelData.description,
        discountRate: modelData.discountRate || 20,
        perpetuityRate: modelData.perpetuityRate || 4,
        corporateTaxRate: modelData.corporateTaxRate || 25,
        ebitdaData: modelData.ebitdaData || {},
        useIncomeStatement: modelData.useIncomeStatement || false,
        baseCurrency: modelData.baseCurrency || 'EUR',
        isTemplate: false,
        isPublic: false,
        tags: []
      };
      
      const modelId = await dataService.saveModel(newModel as DCFModel);
      const savedModel = await dataService.loadModel(modelId);
      
      if (savedModel) {
        setModels(prev => [savedModel as DCFModelWithScenarios, ...prev]);
        onModelSelect(savedModel);
        setShowCreateForm(false);
      }
    } catch (err) {
      setError('Failed to create model');
      console.error('Error creating model:', err);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    if (!confirm('Are you sure you want to delete this model? This action cannot be undone.')) {
      return;
    }
    
    try {
      await dataService.deleteModel(modelId);
      setModels(prev => prev.filter(model => model.id !== modelId));
    } catch (err) {
      setError('Failed to delete model');
      console.error('Error deleting model:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading models...</p>
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">My Models</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          + New Model
        </button>
      </div>

      {/* Create Model Form */}
      {showCreateForm && (
        <CreateModelForm
          onSubmit={handleCreateModel}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Models List */}
      <div className="space-y-3">
        {models.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium">No models yet</p>
            <p className="text-sm">Create your first DCF model to get started.</p>
          </div>
        ) : (
          models.map((model) => (
            <div
              key={model.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedModelId === model.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleModelSelect(model)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">{model.modelName}</h3>
                    {model.isPublic && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Public
                      </span>
                    )}
                    {model.isTemplate && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        Template
                      </span>
                    )}
                  </div>
                  
                  {model.companyName && (
                    <p className="text-sm text-gray-600 mb-1">{model.companyName}</p>
                  )}
                  
                  {model.description && (
                    <p className="text-sm text-gray-500 mb-2">{model.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{model.scenarioCount || 0} scenarios</span>
                    <span>Updated {model.updatedAt ? new Date(model.updatedAt).toLocaleDateString() : 'Never'}</span>
                    {model.tags && model.tags.length > 0 && (
                      <div className="flex gap-1">
                        {model.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {model.enterpriseValue && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${model.enterpriseValue.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Enterprise Value</p>
                    </div>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteModel(model.id!);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 focus:outline-none"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Create Model Form Component
interface CreateModelFormProps {
  onSubmit: (modelData: Partial<DCFModel>) => void;
  onCancel: () => void;
}

const CreateModelForm: React.FC<CreateModelFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    modelName: '',
    companyName: '',
    description: '',
    discountRate: 20,
    perpetuityRate: 4,
    corporateTaxRate: 25,
    baseCurrency: 'EUR' as 'EUR' | 'USD'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Model</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 mb-1">
              Model Name *
            </label>
            <input
              id="modelName"
              type="text"
              value={formData.modelName}
              onChange={(e) => setFormData(prev => ({ ...prev, modelName: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter model name"
            />
          </div>
          
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              id="companyName"
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter company name"
            />
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
            placeholder="Enter model description"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="discountRate" className="block text-sm font-medium text-gray-700 mb-1">
              Discount Rate (%)
            </label>
            <input
              id="discountRate"
              type="number"
              value={formData.discountRate}
              onChange={(e) => setFormData(prev => ({ ...prev, discountRate: Number(e.target.value) }))}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="perpetuityRate" className="block text-sm font-medium text-gray-700 mb-1">
              Perpetuity Rate (%)
            </label>
            <input
              id="perpetuityRate"
              type="number"
              value={formData.perpetuityRate}
              onChange={(e) => setFormData(prev => ({ ...prev, perpetuityRate: Number(e.target.value) }))}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="corporateTaxRate" className="block text-sm font-medium text-gray-700 mb-1">
              Tax Rate (%)
            </label>
            <input
              id="corporateTaxRate"
              type="number"
              value={formData.corporateTaxRate}
              onChange={(e) => setFormData(prev => ({ ...prev, corporateTaxRate: Number(e.target.value) }))}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="baseCurrency" className="block text-sm font-medium text-gray-700 mb-1">
            Base Currency
          </label>
          <select
            id="baseCurrency"
            value={formData.baseCurrency}
            onChange={(e) => setFormData(prev => ({ ...prev, baseCurrency: e.target.value as 'EUR' | 'USD' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
          </select>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Model
          </button>
        </div>
      </form>
    </div>
  );
};