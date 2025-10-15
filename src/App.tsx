import { useMemo, useState } from 'react';
import { ReturnProLayout, type ReturnProSection } from '@/layouts/ReturnProLayout';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CurrencyProvider, useCurrency } from '@/contexts/CurrencyContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserProfile } from '@/components/auth/UserProfile';
import { CorporateFinanceWrapper } from '@/components/corporate-finance/CorporateFinanceWrapper';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState<ReturnProSection>('corporate-finance');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  
  const isAuthenticated = !!user;

  const headerContent = useMemo(() => {
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
  }, [isAuthenticated, setAuthModalMode, setShowAuthModal]);

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
        <CorporateFinanceWrapper onSectionChange={setActiveSection} />
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