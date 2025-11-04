import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import UploadPage from './pages/UploadPage';
import AnalysisPage from './pages/AnalysisPage';
import RecommendationsPage from './pages/RecommendationsPage';
import TrendsPage from './pages/TrendsPage';
import ProfilePage from './pages/ProfilePage';
import PricingPage from './pages/PricingPage';
import UserActivityPage from './pages/UserActivityPage';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';
import ComparisonPage from './pages/ComparisonPage';
import VerificationPage from './pages/VerificationPage';
import SpotifyIntegration from './components/SpotifyIntegration';
import YouTubeMusicIntegration from './components/YouTubeMusicIntegration';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import MarketsPage from './pages/MarketsPage';
import PredictionMarketPage from './pages/PredictionMarketPage';
import TradingPage from './pages/TradingPage';
import TradingPageRealtime from './pages/TradingPageRealtime';
import PortfolioPage from './pages/PortfolioPage';
import WalletsPage from './pages/WalletsPage';
import CurrencyExchangePage from './pages/CurrencyExchangePage';
import TransactionsPage from './pages/TransactionsPage';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { AuthProvider } from './components/AuthProvider';
import { TradingWebSocketProvider } from './contexts/TradingWebSocketContext';
import VerificationGuard from './components/VerificationGuard';
import AuthGateTest from './components/AuthGateTest';

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <TradingWebSocketProvider>
          <Router>
            <Layout>
              <VerificationGuard>
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
                <Route path="/markets" element={<MarketsPage />} />
                <Route path="/markets/:id" element={<PredictionMarketPage />} />
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
              </VerificationGuard>
            </Layout>
          </Router>
        </TradingWebSocketProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App; 