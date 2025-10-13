import { useMemo } from 'react';
import { calculateDCFFromDataSet } from '@/lib/dcf';
import type { DCFDataSet, DCFResults } from '@/types/dcf';

export const useDCFCalculationFromDataSet = (dataSet: DCFDataSet): DCFResults => {
  return useMemo(
    () => calculateDCFFromDataSet(dataSet),
    [dataSet]
  );
};