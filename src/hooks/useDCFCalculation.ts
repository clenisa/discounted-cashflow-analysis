import { useMemo } from 'react';
import { calculateDCF } from '@/lib/dcf';
import type { DCFParameters, DCFResults, EBITDAData } from '@/types/dcf';

export const useDCFCalculation = (ebitdaData: EBITDAData, parameters: DCFParameters): DCFResults => {
  return useMemo(
    () =>
      calculateDCF(
        ebitdaData,
        parameters.discountRate,
        parameters.perpetuityRate,
        parameters.corporateTaxRate
      ),
    [ebitdaData, parameters]
  );
};
