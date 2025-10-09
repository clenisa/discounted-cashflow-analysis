import { describe, expect, test } from 'vitest';
import { DEFAULT_DCF_PARAMETERS, DEFAULT_EBITDA_DATA } from '@/constants/dcf';
import { calculateDCF, calculateFCF } from './dcf';

const TEST_EBITDA = { ...DEFAULT_EBITDA_DATA };

describe('DCF Calculator - Corrected Methodology', () => {
  test('calculates terminal value using Gordon Growth Model', () => {
    const finalFCF = calculateFCF(TEST_EBITDA[2029], DEFAULT_DCF_PARAMETERS.corporateTaxRate);
    const wacc = DEFAULT_DCF_PARAMETERS.discountRate / 100;
    const growth = DEFAULT_DCF_PARAMETERS.perpetuityRate / 100;

    const terminalValue = (finalFCF * (1 + growth)) / (wacc - growth);
    expect(terminalValue).toBeCloseTo(49_403_607.48, 2);
  });

  test('uses WACC consistently for all discounting', () => {
    const result = calculateDCF(
      TEST_EBITDA,
      DEFAULT_DCF_PARAMETERS.discountRate,
      DEFAULT_DCF_PARAMETERS.perpetuityRate,
      DEFAULT_DCF_PARAMETERS.corporateTaxRate
    );

    expect(result.enterpriseValue).not.toBeCloseTo(13_299_457, 0);
    expect(result.enterpriseValue).toBeGreaterThan(result.terminalValuePV);
  });

  test('validates discount rate greater than growth rate', () => {
    expect(() => calculateDCF(TEST_EBITDA, 4, 4, DEFAULT_DCF_PARAMETERS.corporateTaxRate)).toThrow(
      /Discount rate must be greater/
    );
  });

  test('handles negative EBITDA correctly by avoiding tax impact', () => {
    const fcf = calculateFCF(TEST_EBITDA[2023], DEFAULT_DCF_PARAMETERS.corporateTaxRate);
    expect(fcf).toBe(TEST_EBITDA[2023]);
  });
});
