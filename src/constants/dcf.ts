import type { DCFParameters, EBITDAData, FiscalYearLabels } from '@/types/dcf';

export const DEFAULT_EBITDA_DATA: EBITDAData = {
  2023: -1_274_610,
  2024: -885_664,
  2025: 29_279,
  2026: 1_715_988,
  2027: 3_618_470,
  2028: 7_840_841,
  2029: 15_634_053
};

export const DEFAULT_DCF_PARAMETERS: DCFParameters = {
  discountRate: 30,
  perpetuityRate: 4,
  corporateTaxRate: 21
};

const extractShortYear = (year: number) => String(year).slice(-2).padStart(2, '0');

const createDefaultFiscalYearLabels = (ebitdaData: EBITDAData): FiscalYearLabels => {
  const labels: FiscalYearLabels = {};
  Object.keys(ebitdaData)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((year) => {
      labels[year] = `FY${extractShortYear(year)}`;
    });
  return labels;
};

export const DEFAULT_FISCAL_YEAR_LABELS = createDefaultFiscalYearLabels(DEFAULT_EBITDA_DATA);
