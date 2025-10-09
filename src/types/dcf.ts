export interface EBITDAData {
  [year: number]: number;
}

export interface DCFParameters {
  discountRate: number;
  perpetuityRate: number;
  corporateTaxRate: number;
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
