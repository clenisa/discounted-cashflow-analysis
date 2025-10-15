import { useMemo, useState, useEffect } from 'react';
import { DCFCalculator } from '@/components/dcf/DCFCalculator';
import { FinancialDataTab } from '@/components/financial-data/FinancialDataTab';
import { ScenarioComparison } from '@/components/comparison/ScenarioComparison';
import { IFRETURNS_SCENARIOS, DEFAULT_IFRETURNS_SCENARIO_ID } from '@/constants/scenarios';
import { NVIDIA_SCENARIOS, DEFAULT_NVIDIA_SCENARIO_ID } from '@/constants/nvidiaData';
import { ReturnProLayout, type ReturnProSection } from '@/layouts/ReturnProLayout';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CurrencyProvider, useCurrency } from '@/contexts/CurrencyContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserProfile } from '@/components/auth/UserProfile';
import { CorporateFinanceWrapper } from '@/components/corporate-finance/CorporateFinanceWrapper';
import type {
  DCFDataSet,
  DCFParameters,
  IncomeStatementData,
  IncomeStatementAdjustments
} from '@/types/dcf';

const MIN_REVENUE_BUFFER = 1;

const buildIncomeStatementEntry = (ebitda: number) => {
  const magnitude = Math.max(Math.abs(ebitda), 1);
  let revenue = Math.max(magnitude * 4, MIN_REVENUE_BUFFER);
  let cogs = revenue * 0.55;
  let depreciation = revenue * 0.05;
  let amortization = revenue * 0.03;
  let sga = revenue + depreciation + amortization - cogs - ebitda;

  if (sga <= 0) {
    const buffer = Math.abs(sga) + MIN_REVENUE_BUFFER;
    revenue += buffer;
    cogs = revenue * 0.55;
    depreciation = revenue * 0.05;
    amortization = revenue * 0.03;
    sga = revenue + depreciation + amortization - cogs - ebitda;
  }

  const round = (value: number) => Math.round(value);

  const roundedRevenue = round(revenue);
  const roundedCogs = round(cogs);
  const roundedDepreciation = round(depreciation);
  const roundedAmortization = round(amortization);
  const roundedSGA = round(roundedRevenue + roundedDepreciation + roundedAmortization - roundedCogs - ebitda);

  return {
    revenue: roundedRevenue,
    cogs: roundedCogs,
    sga: roundedSGA,
    depreciation: roundedDepreciation,
    amortization: roundedAmortization
  };
};

const initializeIncomeStatementData = (ebitdaData: { [year: number]: number }) => {
  const incomeStatementData: IncomeStatementData = {};
  Object.keys(ebitdaData).forEach((yearStr) => {
    const year = Number(yearStr);
    const ebitda = ebitdaData[year];
    incomeStatementData[year] = buildIncomeStatementEntry(ebitda);
  });
  return incomeStatementData;
};

const initializeIncomeStatementAdjustments = (ebitdaData: { [year: number]: number }) => {
  const adjustments: IncomeStatementAdjustments = {};
  Object.keys(ebitdaData).forEach((yearStr) => {
    const year = Number(yearStr);
    adjustments[year] = {
      revenueAdjustment: 0,
      cogsAdjustment: 0,
      sgaAdjustment: 0
    };
  });
  return adjustments;
};

const cloneIncomeStatementData = (data?: IncomeStatementData) => {
  if (!data) {
    return undefined;
  }
  const clone: IncomeStatementData = {};
  Object.entries(data).forEach(([yearStr, entry]) => {
    const year = Number(yearStr);
    clone[year] = { ...entry };
  });
  return clone;
};

const cloneIncomeStatementAdjustments = (data?: IncomeStatementAdjustments) => {
  if (!data) {
    return undefined;
  }
  const clone: IncomeStatementAdjustments = {};
  Object.entries(data).forEach(([yearStr, entry]) => {
    const year = Number(yearStr);
    clone[year] = { ...entry };
  });
  return clone;
};

const AppContent = () => {
  const { user, loading } = useAuth();
  const { currencySettings, convertCurrency } = useCurrency();
  const [activeSection, setActiveSection] = useState<ReturnProSection>('dcf');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  
  const isAuthenticated = !!user;
  
  // Use different scenarios based on authentication status
  const [scenarios, setScenarios] = useState<DCFDataSet[]>(() => {
    const baseScenarios = isAuthenticated ? IFRETURNS_SCENARIOS : NVIDIA_SCENARIOS;
    return baseScenarios.map((scenario) => ({
      ...scenario,
      ebitdaData: { ...scenario.ebitdaData },
      parameters: { ...scenario.parameters },
      useIncomeStatement: scenario.useIncomeStatement || false,
      incomeStatementData: cloneIncomeStatementData(scenario.incomeStatementData),
      incomeStatementAdjustments: cloneIncomeStatementAdjustments(scenario.incomeStatementAdjustments),
      fiscalYearLabels: scenario.fiscalYearLabels ? { ...scenario.fiscalYearLabels } : undefined
    }));
  });
  
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    isAuthenticated ? DEFAULT_IFRETURNS_SCENARIO_ID : DEFAULT_NVIDIA_SCENARIO_ID
  );

  // Update scenarios when authentication status changes
  useEffect(() => {
    const baseScenarios = isAuthenticated ? IFRETURNS_SCENARIOS : NVIDIA_SCENARIOS;
    const newScenarios = baseScenarios.map((scenario) => {
      const baseCurrency = scenario.baseCurrency || (isAuthenticated ? 'EUR' : 'USD');
      const targetCurrency = currencySettings.activeCurrency;
      
      // Convert currency if needed
      if (baseCurrency !== targetCurrency) {
        const exchangeRate = convertCurrency(1, baseCurrency, targetCurrency);
        return {
          ...scenario,
          ebitdaData: Object.fromEntries(
            Object.entries(scenario.ebitdaData).map(([year, value]) => [year, value * exchangeRate])
          ),
          incomeStatementData: scenario.incomeStatementData ? 
            Object.fromEntries(
              Object.entries(scenario.incomeStatementData).map(([year, data]) => [
                year,
                {
                  revenue: data.revenue * exchangeRate,
                  cogs: data.cogs * exchangeRate,
                  sga: data.sga * exchangeRate,
                  depreciation: data.depreciation * exchangeRate,
                  amortization: data.amortization * exchangeRate
                }
              ])
            ) : undefined,
          baseCurrency: targetCurrency
        };
      }
      
      return {
        ...scenario,
        ebitdaData: { ...scenario.ebitdaData },
        parameters: { ...scenario.parameters },
        useIncomeStatement: scenario.useIncomeStatement || false,
        incomeStatementData: cloneIncomeStatementData(scenario.incomeStatementData),
        incomeStatementAdjustments: cloneIncomeStatementAdjustments(scenario.incomeStatementAdjustments),
        fiscalYearLabels: scenario.fiscalYearLabels ? { ...scenario.fiscalYearLabels } : undefined
      };
    });
    setScenarios(newScenarios);
    
    // Update selected scenario ID
    const newDefaultId = isAuthenticated ? DEFAULT_IFRETURNS_SCENARIO_ID : DEFAULT_NVIDIA_SCENARIO_ID;
    setSelectedScenarioId(newDefaultId);
  }, [isAuthenticated, currencySettings.activeCurrency, convertCurrency]);

  const selectedScenario = useMemo(() => {
    if (scenarios.length === 0) {
      return null;
    }
    return scenarios.find((scenario) => scenario.id === selectedScenarioId) ?? scenarios[0];
  }, [scenarios, selectedScenarioId]);

  const updateScenario = (scenarioId: string, updater: (scenario: DCFDataSet) => DCFDataSet) => {
    setScenarios((previous) =>
      previous.map((scenario) => (scenario.id === scenarioId ? updater({ ...scenario }) : scenario))
    );
  };

  const handleLabelChange = (label: string) => {
    if (!selectedScenario) {
      return;
    }
    updateScenario(selectedScenario.id, (scenario) => ({
      ...scenario,
      label
    }));
  };

  const handleEbitdaChange = (year: number, value: number) => {
    if (!selectedScenario) {
      return;
    }
    updateScenario(selectedScenario.id, (scenario) => ({
      ...scenario,
      ebitdaData: {
        ...scenario.ebitdaData,
        [year]: value
      }
    }));
  };

  const handleParametersChange = (updated: Partial<DCFParameters>) => {
    if (!selectedScenario) {
      return;
    }
    updateScenario(selectedScenario.id, (scenario) => ({
      ...scenario,
      parameters: {
        ...scenario.parameters,
        ...updated
      }
    }));
  };

  const handleIncomeStatementToggle = (useIncomeStatement: boolean) => {
    if (!selectedScenario) {
      return;
    }
    updateScenario(selectedScenario.id, (scenario) => ({
      ...scenario,
      useIncomeStatement,
      // Initialize income statement data if switching to income statement mode
      incomeStatementData: useIncomeStatement && !scenario.incomeStatementData 
        ? initializeIncomeStatementData(scenario.ebitdaData)
        : scenario.incomeStatementData,
      incomeStatementAdjustments: useIncomeStatement && !scenario.incomeStatementAdjustments
        ? initializeIncomeStatementAdjustments(scenario.ebitdaData)
        : scenario.incomeStatementAdjustments
    }));
  };

  const handleIncomeStatementChange = (year: number, field: keyof IncomeStatementData[number], value: number) => {
    if (!selectedScenario) {
      return;
    }
    updateScenario(selectedScenario.id, (scenario) => ({
      ...scenario,
      incomeStatementData: (() => {
        const cloned =
          cloneIncomeStatementData(scenario.incomeStatementData) ??
          initializeIncomeStatementData(scenario.ebitdaData);
        const baseEntry =
          cloned[year] ?? buildIncomeStatementEntry(scenario.ebitdaData[year] ?? 0);
        cloned[year] = {
          ...baseEntry,
          [field]: value
        };
        return cloned;
      })()
    }));
  };

  const handleAdjustmentChange = (year: number, field: keyof IncomeStatementAdjustments[number], value: number) => {
    if (!selectedScenario) {
      return;
    }
    updateScenario(selectedScenario.id, (scenario) => ({
      ...scenario,
      incomeStatementAdjustments: (() => {
        const cloned =
          cloneIncomeStatementAdjustments(scenario.incomeStatementAdjustments) ??
          initializeIncomeStatementAdjustments(scenario.ebitdaData);
        const baseEntry =
          cloned[year] ?? {
            revenueAdjustment: 0,
            cogsAdjustment: 0,
            sgaAdjustment: 0
          };
        cloned[year] = {
          ...baseEntry,
          [field]: value
        };
        return cloned;
      })()
    }));
  };

  const headerContent = useMemo(() => {
    // Only show header content for non-Corporate Finance sections
    if (activeSection === 'corporate-finance') {
      return null;
    }
    
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="text-sm text-gray-600">
              Welcome to ReturnPro Analytics
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Sign in to access Corporate Finance features
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <UserProfile />
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setShowAuthModal(true);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthModalMode('signup');
                  setShowAuthModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }, [activeSection, isAuthenticated, setAuthModalMode, setShowAuthModal]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReturnProLayout 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
        headerContent={headerContent}
      >
        {activeSection === 'corporate-finance' ? (
          <CorporateFinanceWrapper onSectionChange={setActiveSection} />
        ) : (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center max-w-md">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {activeSection === 'dcf' ? 'DCF Calculator' : 
                 activeSection === 'financial-data' ? 'Financial Data' : 
                 activeSection === 'comparison' ? 'Scenario Comparison' : 
                 'ReturnPro Analytics'}
              </h2>
              <p className="text-gray-600 mb-6">
                This feature has been moved to Corporate Finance. Click on Corporate Finance in the sidebar to access all DCF functionality.
              </p>
              {(
                <button
                  onClick={() => setActiveSection('corporate-finance')}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Go to Corporate Finance
                </button>
              )}
            </div>
          </div>
        )}
      </ReturnProLayout>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <AppContent />
      </CurrencyProvider>
    </AuthProvider>
  );
};

export default App;
