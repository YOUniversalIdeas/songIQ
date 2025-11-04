import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { AuthProvider } from './components/AuthProvider';
import { TradingWebSocketProvider } from './contexts/TradingWebSocketContext';
import { registerServiceWorker } from './utils/pwaUtils';

// Core Components (not lazy-loaded)
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import ToastProvider from './components/Toast';
import { PageLoader } from './components/LoadingStates';
import MobileNav from './components/MobileNav';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import VerificationGuard from './components/VerificationGuard';

// Lazy-loaded pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));
const AnalysisPage = lazy(() => import('./pages/AnalysisPage'));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage'));
const TrendsPage = lazy(() => import('./pages/TrendsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const UserActivityPage = lazy(() => import('./pages/UserActivityPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'));
const VerificationPage = lazy(() => import('./pages/VerificationPage'));
const SpotifyIntegration = lazy(() => import('./components/SpotifyIntegration'));
const YouTubeMusicIntegration = lazy(() => import('./components/YouTubeMusicIntegration'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsConditionsPage = lazy(() => import('./pages/TermsConditionsPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const MarketsHub = lazy(() => import('./pages/MarketsHub'));
const MarketDetailPage = lazy(() => import('./pages/MarketDetailPage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const WalletsPage = lazy(() => import('./pages/WalletsPage'));
const CurrencyExchangePage = lazy(() => import('./pages/CurrencyExchangePage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const TradingPageRealtime = lazy(() => import('./pages/TradingPageRealtime'));
const AuthGateTest = lazy(() => import('./components/AuthGateTest'));

// Mobile Styles
import './styles/mobile.css';

function App() {
  // Register service worker for PWA on mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <ErrorBoundary>
      <DarkModeProvider>
        <ToastProvider>
          <AuthProvider>
            <TradingWebSocketProvider>
              <Router>
                <Layout>
                  <VerificationGuard>
                    <Suspense fallback={<PageLoader message="Loading page..." />}>
                      <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/analysis" element={<AnalysisPage />} />
                <Route path="/analysis/:songId" element={<AnalysisPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/trends" element={<TrendsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/user-activity" element={<UserActivityPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/dashboard/:songId" element={<DashboardPage />} />
                <Route path="/verify" element={<VerificationPage />} />
                <Route path="/comparison" element={<ComparisonPage />} />
                <Route path="/spotify" element={<SpotifyIntegration />} />
                <Route path="/youtube-music" element={<YouTubeMusicIntegration />} />
                <Route path="/markets" element={<MarketsHub />} />
                <Route path="/markets/:id" element={<MarketDetailPage />} />
                <Route path="/profile/:userId" element={<UserProfilePage />} />
                <Route path="/trading" element={<TradingPageRealtime />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/wallets" element={<WalletsPage />} />
                <Route path="/exchange" element={<CurrencyExchangePage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsConditionsPage />} />
                <Route path="/test" element={<HomePage />} />
                <Route path="/auth-gate-test" element={<AuthGateTest />} />
                      </Routes>
                    </Suspense>
                  </VerificationGuard>
                  
                  {/* Mobile Navigation */}
                  <MobileNav />
                  
                  {/* PWA Install Prompt */}
                  <PWAInstallPrompt />
                </Layout>
              </Router>
            </TradingWebSocketProvider>
          </AuthProvider>
        </ToastProvider>
      </DarkModeProvider>
    </ErrorBoundary>
  );
}

export default App; 