import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import UploadPage from '@/pages/UploadPage'
import AnalysisPage from '@/pages/AnalysisPage'
import DashboardPage from '@/pages/DashboardPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="analysis/:songId" element={<AnalysisPage />} />
        <Route path="dashboard/:songId" element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}

export default App 