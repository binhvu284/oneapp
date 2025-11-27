import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { AIAssistant } from './pages/AIAssistant'
import { Modules } from './pages/Modules'
import { Settings } from './pages/Settings'
import { Interface } from './pages/Interface'
import { ThemeSettings } from './pages/ThemeSettings'
import { LayoutOptions } from './pages/LayoutOptions'
import { DisplayOptions } from './pages/DisplayOptions'
import { SystemAdmin } from './pages/SystemAdmin'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LayoutProvider } from './contexts/LayoutContext'
import { DisplayProvider } from './contexts/DisplayContext'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/ai': 'AI Assistant',
  '/modules': 'Modules',
  '/settings': 'Settings',
  '/customization/interface': 'Interface',
  '/customization/interface/theme': 'Theme Settings',
  '/customization/interface/layout': 'Layout Options',
  '/customization/interface/display': 'Display Settings',
  '/customization/system-admin': 'System Admin',
}

const pageBreadcrumbs: Record<string, Array<{ label: string; path: string }>> = {
  '/customization/interface/theme': [
    { label: 'Interface', path: '/customization/interface' },
    { label: 'Theme Settings', path: '/customization/interface/theme' },
  ],
  '/customization/interface/layout': [
    { label: 'Interface', path: '/customization/interface' },
    { label: 'Layout Options', path: '/customization/interface/layout' },
  ],
  '/customization/interface/display': [
    { label: 'Interface', path: '/customization/interface' },
    { label: 'Display Settings', path: '/customization/interface/display' },
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
        <Route path="/customization/interface/layout" element={<LayoutOptions />} />
        <Route path="/customization/interface/display" element={<DisplayOptions />} />
        <Route path="/customization/system-admin" element={<SystemAdmin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <ThemeProvider>
      <LayoutProvider>
        <DisplayProvider>
          <AuthProvider>
            <Router>
              <AppContent />
            </Router>
          </AuthProvider>
        </DisplayProvider>
      </LayoutProvider>
    </ThemeProvider>
  )
}

export default App

