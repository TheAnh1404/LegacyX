import { useState, useEffect } from 'react';
import { AppStateProvider, useAppState } from './mock/store';
import { AppShell } from './components/layouts/AppShell';
import { GradientButton } from './components/ui/GradientButton';
import { LandingPage } from './pages/LandingPage';
import { ConnectWalletPage } from './pages/ConnectWalletPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateWillPage } from './pages/CreateWillPage';
import { WillDetailsPage } from './pages/WillDetailsPage';
import { BeneficiaryDashboardPage } from './pages/BeneficiaryDashboardPage';
import { TransactionHistoryPage } from './pages/TransactionHistoryPage';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const { isConnected } = useAppState();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [willDetailsId, setWillDetailsId] = useState<string | null>(null);

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  // Handle custom navigation routing
  const handleNavigate = (page: string, targetId?: string) => {
    if (page === 'will-details' && targetId) {
      setWillDetailsId(targetId);
      setCurrentPage('will-details');
    } else {
      setWillDetailsId(null);
      setCurrentPage(page);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'connect-wallet':
        return <ConnectWalletPage onNavigate={handleNavigate} />;
      case 'onboarding':
        return <OnboardingPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'create-will':
        return <CreateWillPage onNavigate={handleNavigate} />;
      case 'will-details':
        return <WillDetailsPage willId={willDetailsId || ''} onNavigate={handleNavigate} />;
      case 'beneficiary':
        return <BeneficiaryDashboardPage onNavigate={handleNavigate} />;
      case 'history':
        return <TransactionHistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  // The Landing page is displayed without the dashboard shell (full screen layout)
  if (currentPage === 'landing' || currentPage === 'connect-wallet') {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="flex items-center justify-between h-[70px] bg-[#050816]/40 border-b border-white/5 px-6 md:px-12 relative z-20">
          <div 
            onClick={() => handleNavigate('landing')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="bg-[#8b5cf6] p-1.5 rounded-lg text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-wide bg-gradient-brand-text -webkit-background-clip-text -webkit-text-fill-color-transparent">
              LegacyX
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isConnected ? (
              <GradientButton 
                variant="primary" 
                size="sm"
                onClick={() => handleNavigate('dashboard')}
              >
                Go to Dashboard
              </GradientButton>
            ) : (
              <GradientButton 
                variant="primary" 
                size="sm"
                onClick={() => handleNavigate('connect-wallet')}
              >
                Connect Wallet
              </GradientButton>
            )}
          </div>
        </header>
        <main className="flex-1 w-full max-w-6xl mx-auto px-6 md:px-12 py-10 page-transition">
          {renderPage()}
        </main>
        <footer className="h-16 border-t border-white/5 bg-[#050816] flex items-center justify-center text-xs text-white/30">
          <span>&copy; 2026 LegacyX Platform. Built on Stellar Soroban.</span>
        </footer>
      </div>
    );
  }

  // Dashboard and internal wizard pages render within the Sidebar Shell layout
  return (
    <AppShell currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </AppShell>
  );
}

function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}

export default App;
