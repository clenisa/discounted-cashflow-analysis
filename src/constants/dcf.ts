import type { DCFParameters, EBITDAData } from '@/types/dcf';

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
