import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import LyricsPage from './pages/LyricsPage';
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
import { DarkModeProvider } from './contexts/DarkModeContext';
import { AuthProvider } from './components/AuthProvider';
import VerificationGuard from './components/VerificationGuard';

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <VerificationGuard>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/lyrics" element={<LyricsPage />} />
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
                <Route path="/test" element={<HomePage />} />
              </Routes>
            </VerificationGuard>
          </Layout>
        </Router>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App; 