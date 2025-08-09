import { Routes, Route } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { AuthProvider } from '@/components/AuthProvider'
import Layout from '@/components/Layout'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorBoundary from '@/components/ErrorBoundary'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/HomePage'))
const UploadPage = lazy(() => import('@/pages/UploadPage'))
const AnalysisPage = lazy(() => import('@/pages/AnalysisPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const ComparisonPage = lazy(() => import('@/pages/ComparisonPage'))
const TrendsPage = lazy(() => import('@/pages/TrendsPage'))
const RecommendationsPage = lazy(() => import('@/pages/RecommendationsPage'))
const AuthPage = lazy(() => import('@/pages/AuthPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const PricingPage = lazy(() => import('@/pages/PricingPage'))
const EmailVerificationPage = lazy(() => import('@/pages/EmailVerificationPage'))

function App() {
  useEffect(() => {
    // Enable dark mode by default
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="upload" element={<UploadPage />} />
              <Route path="analysis" element={<AnalysisPage />} />
              <Route path="analysis/:songId" element={<AnalysisPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="dashboard/:songId" element={<DashboardPage />} />
              <Route path="comparison" element={<ComparisonPage />} />
              <Route path="trends" element={<TrendsPage />} />
              <Route path="recommendations" element={<RecommendationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="pricing" element={<PricingPage />} />
            </Route>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App 