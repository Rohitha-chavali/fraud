import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { LumoraOrb } from './components/lumora/LumoraOrb';
import { LumoraChat } from './components/lumora/LumoraChat';
import { TransactionDetailModal } from './components/transactions/TransactionDetailModal';
import { ToastContainer } from './components/common/ToastContainer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { LoginPage } from './pages/LoginPage';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ScannerPage } from './pages/ScannerPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AlertsPage } from './pages/AlertsPage';
import { InvestigationsPage } from './pages/InvestigationsPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { SettingsPage } from './pages/SettingsPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/reset-password';

  const { activeTransactionModal, setActiveTransactionModal } = useApp();

  const getPageMeta = (path: string) => {
    switch (path) {
      case '/dashboard':
        return {
          title: 'Fraud Intelligence Overview',
          subtitle: 'Monitor transaction risk and emerging fraud patterns in real time.',
        };
      case '/transactions':
        return {
          title: 'Transactions Directory',
          subtitle: 'Live multi-channel payment clearing telemetry.',
        };
      case '/scan':
        return {
          title: 'Transaction Scanner',
          subtitle: 'Evaluate payment payloads against multi-signal anomaly tripwires.',
        };
      case '/alerts':
        return {
          title: 'Fraud Alerts Board',
          subtitle: 'Active critical and high-exposure anomaly tripwires.',
        };
      case '/investigations':
        return {
          title: 'Investigation Center',
          subtitle: 'Forensic case docket and analyst collaborative workspace.',
        };
      case '/intelligence':
        return {
          title: 'Fraud Intelligence & Network',
          subtitle: 'Syndicate entity links, temporal peaks, and AI pattern mining.',
        };
      case '/settings':
        return {
          title: 'Platform Preferences',
          subtitle: 'Configure Lumora reasoning parameters and notification tripwires.',
        };
      default:
        return {
          title: 'Fraud Shield AI',
          subtitle: 'Detect fraud before it becomes damage.',
        };
    }
  };

  const meta = getPageMeta(location.pathname);

  if (isAuthPage) {
    return <div className="min-h-screen bg-[#070b14]">{children}</div>;
  }

  if (isLanding) {
    return (
      <div className="min-h-screen bg-[#070b14]">
        {children}
        <LumoraOrb />
        <LumoraChat />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080d19] text-slate-100 flex">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Navbar title={meta.title} subtitle={meta.subtitle} />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Modals & Floatables */}
      <LumoraOrb />
      <LumoraChat />
      <TransactionDetailModal
        transaction={activeTransactionModal}
        onClose={() => setActiveTransactionModal(null)}
      />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppLayout>
            <Routes>
              {/* Auth routes bypass directly to dashboard */}
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/reset-password" element={<Navigate to="/dashboard" replace />} />

              {/* All Application Routes strictly protected behind authentication */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <LandingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <TransactionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scan"
                element={
                  <ProtectedRoute>
                    <ScannerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alerts"
                element={
                  <ProtectedRoute>
                    <AlertsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/investigations"
                element={
                  <ProtectedRoute>
                    <InvestigationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/intelligence"
                element={
                  <ProtectedRoute>
                    <IntelligencePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback to Dashboard (which redirects to /login if unauthenticated) */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppLayout>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
