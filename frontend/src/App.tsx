import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { AIAssistant } from './pages/AIAssistant'
import { Modules } from './pages/Modules'
import { Settings } from './pages/Settings'
import { Interface } from './pages/Interface'
import { ThemeSettings } from './pages/ThemeSettings'
import { SystemAdmin } from './pages/SystemAdmin'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/ai': 'AI Assistant',
  '/modules': 'Modules',
  '/settings': 'Settings',
  '/customization/interface': 'Interface',
  '/customization/interface/theme': 'Theme Settings',
  '/customization/system-admin': 'System Admin',
}

const pageBreadcrumbs: Record<string, Array<{ label: string; path: string }>> = {
  '/customization/interface/theme': [
    { label: 'Interface', path: '/customization/interface' },
    { label: 'Theme Settings', path: '/customization/interface/theme' },
  ],
}

function AppContent() {
  const location = useLocation()
  const pageTitle = pageTitles[location.pathname] || 'Dashboard'
  const breadcrumbs = pageBreadcrumbs[location.pathname]

  return (
    <Layout title={pageTitle} breadcrumbs={breadcrumbs}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ai" element={<AIAssistant />} />
        <Route path="/modules" element={<Modules />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/customization/interface" element={<Interface />} />
        <Route path="/customization/interface/theme" element={<ThemeSettings />} />
        <Route path="/customization/system-admin" element={<SystemAdmin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

