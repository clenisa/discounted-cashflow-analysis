import type { DCFParameters, EBITDAData, FiscalYearLabels, DCFDataSet } from '@/types/dcf';

// Nvidia financial data based on public information
export const NVIDIA_EBITDA_DATA: EBITDAData = {
  2023: 7_200_000_000,  // $7.2B
  2024: 12_500_000_000, // $12.5B
  2025: 18_000_000_000, // $18.0B (projected)
  2026: 24_000_000_000, // $24.0B (projected)
  2027: 30_000_000_000, // $30.0B (projected)
  2028: 36_000_000_000, // $36.0B (projected)
  2029: 42_000_000_000  // $42.0B (projected)
};

export const NVIDIA_DCF_PARAMETERS: DCFParameters = {
  discountRate: 12,  // Lower discount rate for established tech company
  perpetuityRate: 3, // Conservative growth rate
  corporateTaxRate: 21
};

const extractShortYear = (year: number) => String(year).slice(-2).padStart(2, '0');

const createNvidiaFiscalYearLabels = (ebitdaData: EBITDAData): FiscalYearLabels => {
  const labels: FiscalYearLabels = {};
  Object.keys(ebitdaData)
    .map(Number)
    .sort((a, b) => a - b)
    .forEach((year) => {
      labels[year] = `FY${extractShortYear(year)}`;
    });
  return labels;
};

export const NVIDIA_FISCAL_YEAR_LABELS = createNvidiaFiscalYearLabels(NVIDIA_EBITDA_DATA);

const NVIDIA_PREFIX = 'NVIDIA';
const DEFAULT_TAX_RATE = NVIDIA_DCF_PARAMETERS.corporateTaxRate;

const createNvidiaScenario = ({
  id,
  label,
  discountRate,
  perpetuityRate
}: {
  id: string;
  label: string;
  discountRate: number;
  perpetuityRate: number;
}): DCFDataSet => ({
  id,
  label: `${NVIDIA_PREFIX} ${label}`,
  ebitdaData: { ...NVIDIA_EBITDA_DATA },
  parameters: {
    discountRate,
    perpetuityRate,
    corporateTaxRate: DEFAULT_TAX_RATE
  },
  useIncomeStatement: false,
  incomeStatementData: undefined,
  incomeStatementAdjustments: undefined,
  fiscalYearLabels: { ...NVIDIA_FISCAL_YEAR_LABELS },
  baseCurrency: 'USD'
});

export const NVIDIA_SCENARIOS: DCFDataSet[] = [
  createNvidiaScenario({
    id: 'nvidia-conservative',
    label: 'Conservative',
    discountRate: 15,
    perpetuityRate: 2
  }),
  createNvidiaScenario({
    id: 'nvidia-base',
    label: 'Base',
    discountRate: 12,
    perpetuityRate: 3
  }),
  createNvidiaScenario({
    id: 'nvidia-optimistic',
    label: 'Optimistic',
    discountRate: 10,
    perpetuityRate: 4
  })
];

export const DEFAULT_NVIDIA_SCENARIO_ID = 'nvidia-base';