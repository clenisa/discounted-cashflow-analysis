import type { Currency } from '@/types/currency';
import type { DCFDataSet, EBITDAData, IncomeStatementData } from '@/types/dcf';

export const convertEBITDAData = (
  ebitdaData: EBITDAData,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRate: number
): EBITDAData => {
  if (fromCurrency === toCurrency) return ebitdaData;
  
  const converted: EBITDAData = {};
  Object.entries(ebitdaData).forEach(([year, value]) => {
    converted[parseInt(year)] = value * exchangeRate;
  });
  
  return converted;
};

export const convertIncomeStatementData = (
  incomeStatementData: IncomeStatementData,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRate: number
): IncomeStatementData => {
  if (fromCurrency === toCurrency) return incomeStatementData;
  
  const converted: IncomeStatementData = {};
  Object.entries(incomeStatementData).forEach(([year, data]) => {
    converted[parseInt(year)] = {
      revenue: data.revenue * exchangeRate,
      cogs: data.cogs * exchangeRate,
      sga: data.sga * exchangeRate,
      depreciation: data.depreciation * exchangeRate,
      amortization: data.amortization * exchangeRate
    };
  });
  
  return converted;
};

export const convertDCFDataSet = (
  dataSet: DCFDataSet,
  fromCurrency: Currency,
  toCurrency: Currency,
  exchangeRate: number
): DCFDataSet => {
  if (fromCurrency === toCurrency) return dataSet;
  
  return {
    ...dataSet,
    ebitdaData: convertEBITDAData(dataSet.ebitdaData, fromCurrency, toCurrency, exchangeRate),
    incomeStatementData: dataSet.incomeStatementData 
      ? convertIncomeStatementData(dataSet.incomeStatementData, fromCurrency, toCurrency, exchangeRate)
      : undefined,
    baseCurrency: toCurrency
  };
};