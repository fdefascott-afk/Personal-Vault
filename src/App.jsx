import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import VerificationPage from './pages/VerificationPage'
import DashboardPage from './pages/DashboardPage'
import FilesPage from './pages/FilesPage'
import ActivitiesPage from './pages/ActivitiesPage'

function App() {
  const [user, setUser] = useState(null)

  const requireAuth = (element) => (user ? element : <Navigate to="/" replace />)

  return (
    <BrowserRouter>
      <Layout user={user} setUser={setUser}>
        <Routes>
          <Route path="/" element={<LoginPage user={user} setUser={setUser} />} />
          <Route path="/verificacion" element={requireAuth(<VerificationPage user={user} />)} />
          <Route path="/dashboard" element={requireAuth(<DashboardPage user={user} />)} />
          <Route path="/archivos" element={requireAuth(<FilesPage user={user} />)} />
          <Route path="/actividades" element={requireAuth(<ActivitiesPage />)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
