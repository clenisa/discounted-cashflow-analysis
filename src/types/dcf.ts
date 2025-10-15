export interface EBITDAData {
  [year: number]: number;
}

export interface IncomeStatementData {
  [year: number]: {
    revenue: number;
    cogs: number; // Cost of Goods Sold
    sga: number;  // Selling, General & Administrative
    depreciation: number;
    amortization: number;
  };
}

export interface IncomeStatementAdjustments {
  [year: number]: {
    revenueAdjustment: number; // Percentage adjustment
    cogsAdjustment: number;
    sgaAdjustment: number;
  };
}

export type FiscalYearLabels = Record<number, string>;

export interface DCFParameters {
  discountRate: number;
  perpetuityRate: number;
  corporateTaxRate: number;
}

export interface DCFDataSet {
  id: string;
  label: string;
  ebitdaData: EBITDAData;
  parameters: DCFParameters;
  useIncomeStatement: boolean; // Toggle between EBITDA input and income statement input
  incomeStatementData?: IncomeStatementData;
  incomeStatementAdjustments?: IncomeStatementAdjustments;
  fiscalYearLabels?: FiscalYearLabels;
  baseCurrency?: 'EUR' | 'USD'; // Currency the data is stored in
}

export interface PresentValueBreakdown {
  year: number;
  ebitda: number;
  tax: number;
  fcf: number;
  discountFactor: number;
  presentValue: number;
}

export interface DCFResults {
  enterpriseValue: number;
  terminalValue: number;
  terminalValuePV: number;
  projectionsPV: number;
  presentValues: PresentValueBreakdown[];
}

// Base DCF Model interface (matches Supabase schema)
export interface DCFModel {
  id?: string;
  userId?: string;
  modelName: string;
  companyName?: string;
  description?: string;
  
  // DCF Parameters
  discountRate: number;
  perpetuityRate: number;
  corporateTaxRate: number;
  
  // Financial Data
  ebitdaData: EBITDAData;
  incomeStatementData?: IncomeStatementData;
  incomeStatementAdjustments?: IncomeStatementAdjustments;
  fiscalYearLabels?: FiscalYearLabels;
  
  // Configuration
  useIncomeStatement: boolean;
  baseCurrency: 'EUR' | 'USD';
  
  // Calculated Results (cached)
  enterpriseValue?: number;
  terminalValue?: number;
  terminalValuePV?: number;
  projectionsPV?: number;
  presentValues?: PresentValueBreakdown[];
  
  // Metadata
  isTemplate?: boolean;
  isPublic?: boolean;
  tags?: string[];
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// DCF Scenario interface
export interface DCFScenario {
  id?: string;
  userId?: string;
  modelId: string;
  scenarioName: string;
  description?: string;
  
  // Scenario-specific parameters (optional - inherit from model if not set)
  discountRate?: number;
  perpetuityRate?: number;
  corporateTaxRate?: number;
  
  // Scenario-specific data
  ebitdaData?: EBITDAData;
  incomeStatementData?: IncomeStatementData;
  incomeStatementAdjustments?: IncomeStatementAdjustments;
  
  // Calculated results for this scenario
  enterpriseValue?: number;
  terminalValue?: number;
  terminalValuePV?: number;
  projectionsPV?: number;
  presentValues?: PresentValueBreakdown[];
  
  // Metadata
  isBaseScenario?: boolean;
  sortOrder?: number;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// Model sharing interface
export interface DCFModelShare {
  id?: string;
  modelId: string;
  sharedByUserId: string;
  sharedWithUserId?: string;
  sharedWithEmail?: string;
  
  // Permissions
  canView: boolean;
  canEdit: boolean;
  canShare: boolean;
  canDelete: boolean;
  
  // Access control
  expiresAt?: string;
  isActive: boolean;
  
  // Metadata
  shareToken?: string;
  message?: string;
  
  // Timestamps
  createdAt?: string;
  lastAccessedAt?: string;
}

// Model version interface
export interface DCFModelVersion {
  id?: string;
  modelId: string;
  versionNumber: number;
  createdByUserId: string;
  
  // Snapshot of model data at this version
  modelData: DCFModel;
  changeSummary?: string;
  changeType: 'manual' | 'auto_save' | 'import' | 'template';
  
  // Timestamps
  createdAt?: string;
}

// Financial data template interface
export interface FinancialDataTemplate {
  id?: string;
  createdByUserId?: string;
  templateName: string;
  description?: string;
  category?: string;
  
  // Template data
  ebitdaData: EBITDAData;
  incomeStatementData?: IncomeStatementData;
  fiscalYearLabels?: FiscalYearLabels;
  baseCurrency: 'EUR' | 'USD';
  
  // Default parameters
  defaultDiscountRate?: number;
  defaultPerpetuityRate?: number;
  defaultCorporateTaxRate?: number;
  
  // Metadata
  isPublic: boolean;
  isSystemTemplate: boolean;
  tags: string[];
  usageCount: number;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

// Extended interfaces for UI components
export interface DCFModelWithScenarios extends DCFModel {
  scenarioCount: number;
  lastScenarioUpdate?: string;
}

export interface DCFModelWithAccess extends DCFModel {
  accessLevel: 'owner' | 'editor' | 'viewer' | 'none';
}

export interface DCFModelStats {
  id: string;
  modelName: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  totalScenarios: number;
  totalVersions: number;
  lastVersionCreated?: string;
  totalShares: number;
}

// Sharing permissions type
export type SharingPermissions = {
  canView: boolean;
  canEdit: boolean;
  canShare: boolean;
  canDelete: boolean;
};

// Access level type
export type AccessLevel = 'owner' | 'editor' | 'viewer' | 'none';

// Change type for versioning
export type ChangeType = 'manual' | 'auto_save' | 'import' | 'template';
