import type { DCFDataSet } from '@/types/dcf';
import { DEFAULT_DCF_PARAMETERS, DEFAULT_EBITDA_DATA, DEFAULT_FISCAL_YEAR_LABELS } from './dcf';

const IFRETURNS_PREFIX = 'iFReturns';
const DEFAULT_TAX_RATE = DEFAULT_DCF_PARAMETERS.corporateTaxRate;

const createScenario = ({
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
  label: `${IFRETURNS_PREFIX} ${label}`,
  ebitdaData: { ...DEFAULT_EBITDA_DATA },
  parameters: {
    discountRate,
    perpetuityRate,
    corporateTaxRate: DEFAULT_TAX_RATE
  },
  useIncomeStatement: false,
  incomeStatementData: undefined,
  incomeStatementAdjustments: undefined,
  fiscalYearLabels: { ...DEFAULT_FISCAL_YEAR_LABELS }
});

export const IFRETURNS_SCENARIOS: DCFDataSet[] = [
  createScenario({
    id: 'ifreturns-conservative',
    label: 'Conservative',
    discountRate: 25,
    perpetuityRate: 3
  }),
  createScenario({
    id: 'ifreturns-base',
    label: 'Base',
    discountRate: 20,
    perpetuityRate: 4
  }),
  createScenario({
    id: 'ifreturns-optimistic',
    label: 'Optimistic',
    discountRate: 18,
    perpetuityRate: 5
  })
];

export const DEFAULT_IFRETURNS_SCENARIO_ID = 'ifreturns-base';
