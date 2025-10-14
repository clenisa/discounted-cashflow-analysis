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

export interface DCFModel {
  id?: string;
  modelName: string;
  companyName?: string;
  ebitdaData: EBITDAData;
  parameters: DCFParameters;
  results: DCFResults;
  createdAt?: string;
  updatedAt?: string;
}
