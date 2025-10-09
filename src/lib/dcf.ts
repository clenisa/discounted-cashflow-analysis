import type { DCFParameters, DCFResults, EBITDAData, PresentValueBreakdown } from '@/types/dcf';

export const calculateFCF = (ebitda: number, taxRate: number): number => {
  if (taxRate < 0 || taxRate > 100) {
    throw new Error('Corporate tax rate must be between 0 and 100 percent.');
  }

  if (ebitda <= 0) {
    return ebitda;
  }

  const tax = ebitda * (taxRate / 100);
  return ebitda - tax;
};

const calculateDiscountFactor = (wacc: number, period: number): number => {
  return 1 / Math.pow(1 + wacc, period);
};

const validateParameters = (discountRate: number, perpetuityRate: number) => {
  if (discountRate <= perpetuityRate) {
    throw new Error('Discount rate must be greater than perpetuity growth rate.');
  }
};

export const calculateDCF = (
  ebitdaData: EBITDAData,
  discountRate: number,
  perpetuityRate: number,
  taxRate: number
): DCFResults => {
  const years = Object.keys(ebitdaData).map(Number).sort((a, b) => a - b);
  if (years.length === 0) {
    throw new Error('EBITDA data is required to calculate DCF.');
  }

  validateParameters(discountRate, perpetuityRate);

  const wacc = discountRate / 100;
  const growthRate = perpetuityRate / 100;

  const presentValues: PresentValueBreakdown[] = [];
  let projectionsPV = 0;

  years.forEach((year, index) => {
    const ebitda = ebitdaData[year];
    const tax = ebitda > 0 ? ebitda * (taxRate / 100) : 0;
    const fcf = calculateFCF(ebitda, taxRate);
    const discountFactor = calculateDiscountFactor(wacc, index + 1);
    const presentValue = fcf * discountFactor;

    presentValues.push({
      year,
      ebitda,
      tax,
      fcf,
      discountFactor,
      presentValue
    });

    projectionsPV += presentValue;
  });

  const finalYearFCF = presentValues[presentValues.length - 1]?.fcf ?? 0;
  const terminalValue = (finalYearFCF * (1 + growthRate)) / (wacc - growthRate);
  const terminalValuePV = terminalValue * calculateDiscountFactor(wacc, years.length);
  const enterpriseValue = projectionsPV + terminalValuePV;

  return {
    enterpriseValue,
    terminalValue,
    terminalValuePV,
    projectionsPV,
    presentValues
  };
};
