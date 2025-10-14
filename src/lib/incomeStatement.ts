import type { IncomeStatementData, IncomeStatementAdjustments, EBITDAData } from '@/types/dcf';

/**
 * Calculate EBITDA from income statement line items
 * EBITDA = Revenue - COGS - SG&A + Depreciation + Amortization
 */
export const calculateEBITDA = (
  revenue: number,
  cogs: number,
  sga: number,
  depreciation: number,
  amortization: number
): number => {
  return revenue - cogs - sga + depreciation + amortization;
};

/**
 * Calculate EBITDA for a specific year from income statement data
 */
export const calculateEBITDAForYear = (
  incomeStatementData: IncomeStatementData,
  year: number
): number => {
  const data = incomeStatementData[year];
  if (!data) {
    return 0;
  }

  return calculateEBITDA(
    data.revenue,
    data.cogs,
    data.sga,
    data.depreciation,
    data.amortization
  );
};

/**
 * Convert income statement data to EBITDA data
 */
export const convertIncomeStatementToEBITDA = (
  incomeStatementData: IncomeStatementData
): EBITDAData => {
  const ebitdaData: EBITDAData = {};
  
  Object.keys(incomeStatementData).forEach(yearStr => {
    const year = Number(yearStr);
    ebitdaData[year] = calculateEBITDAForYear(incomeStatementData, year);
  });

  return ebitdaData;
};

/**
 * Apply percentage adjustments to income statement data
 */
export const applyIncomeStatementAdjustments = (
  incomeStatementData: IncomeStatementData,
  adjustments: IncomeStatementAdjustments
): IncomeStatementData => {
  const adjustedData: IncomeStatementData = {};

  Object.keys(incomeStatementData).forEach(yearStr => {
    const year = Number(yearStr);
    const originalData = incomeStatementData[year];
    const yearAdjustments = adjustments[year];

    if (!originalData) {
      return;
    }

    // Apply percentage adjustments (0.1 = 10% increase, -0.1 = 10% decrease)
    const revenueAdjustment = yearAdjustments?.revenueAdjustment || 0;
    const cogsAdjustment = yearAdjustments?.cogsAdjustment || 0;
    const sgaAdjustment = yearAdjustments?.sgaAdjustment || 0;

    adjustedData[year] = {
      revenue: originalData.revenue * (1 + revenueAdjustment),
      cogs: originalData.cogs * (1 + cogsAdjustment),
      sga: originalData.sga * (1 + sgaAdjustment),
      depreciation: originalData.depreciation, // Depreciation and amortization typically not adjusted
      amortization: originalData.amortization
    };
  });

  return adjustedData;
};

/**
 * Get effective EBITDA data for a scenario (either direct EBITDA or calculated from income statement)
 */
export const getEffectiveEBITDAData = (
  ebitdaData: EBITDAData,
  useIncomeStatement: boolean,
  incomeStatementData?: IncomeStatementData,
  incomeStatementAdjustments?: IncomeStatementAdjustments
): EBITDAData => {
  if (!useIncomeStatement || !incomeStatementData) {
    return ebitdaData;
  }

  // Apply adjustments if provided
  const adjustedIncomeStatement = incomeStatementAdjustments
    ? applyIncomeStatementAdjustments(incomeStatementData, incomeStatementAdjustments)
    : incomeStatementData;

  return convertIncomeStatementToEBITDA(adjustedIncomeStatement);
};