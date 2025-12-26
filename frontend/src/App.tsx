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
import { ApplicationManagement } from './pages/ApplicationManagement'
import { SidebarConfiguration } from './pages/SidebarConfiguration'
import { HeaderSetting } from './pages/HeaderSetting'
import { Library } from './pages/Library'
import { AppDetail } from './pages/AppDetail'
import { Notifications } from './pages/Notifications'
import { OneAppDeveloper } from './pages/OneAppDeveloper'
import { OneAppData } from './pages/OneAppData'
import { OnlyAPI } from './pages/OnlyAPI'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LayoutProvider } from './contexts/LayoutContext'
import { DisplayProvider } from './contexts/DisplayContext'
import { NavigationProvider } from './contexts/NavigationContext'
import { HeaderProvider } from './contexts/HeaderContext'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/home': 'OneApp',
  '/login': 'Login',
  '/signup': 'Sign Up',
  '/oneapp-developer': 'OneApp Developer',
  '/oneapp-data': 'OneApp Data',
  '/onlyapi': 'OnlyAPI',
  '/ai': 'AI Assistant',
  '/ai/chat': 'AI Chat',
  '/ai/popup': 'AI Popup',
  '/ai/translate': 'AI Translate',
  '/modules': 'Modules',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
  '/library': 'Library',
  '/library/:appId': 'App Details',
  '/customization/interface': 'Interface',
  '/customization/interface/theme': 'Theme Settings',
  '/customization/interface/layout': 'Layout Options',
  '/customization/interface/display': 'Display Settings',
  '/customization/interface/sidebar': 'Sidebar Setting',
  '/customization/interface/header': 'Header Setting',
  '/customization/system-admin': 'System Admin',
  '/customization/system-admin/application-management': 'Application Management',
}

const pageBreadcrumbs: Record<string, Array<{ label: string; path: string }>> = {
  '/ai/chat': [
    { label: 'AI Assistant', path: '/ai' },
    { label: 'AI Chat', path: '/ai/chat' },
  ],
  '/ai/popup': [
    { label: 'AI Assistant', path: '/ai' },
    { label: 'AI Popup', path: '/ai/popup' },
  ],
  '/ai/translate': [
    { label: 'AI Assistant', path: '/ai' },
    { label: 'AI Translate', path: '/ai/translate' },
  ],
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
  '/customization/interface/sidebar': [
    { label: 'Interface', path: '/customization/interface' },
    { label: 'Sidebar Setting', path: '/customization/interface/sidebar' },
  ],
  '/customization/interface/header': [
    { label: 'Interface', path: '/customization/interface' },
    { label: 'Header Setting', path: '/customization/interface/header' },
  ],
  '/customization/system-admin/application-management': [
    { label: 'System Admin', path: '/customization/system-admin' },
    { label: 'Application Management', path: '/customization/system-admin/application-management' },
  ],
}

function AppContent() {
  const location = useLocation()
  const { user, loading } = useAuth()
  const pageTitle = pageTitles[location.pathname] || 'Dashboard'
  const breadcrumbs = pageBreadcrumbs[location.pathname]

  // Public routes that don't require authentication
  const publicRoutes = ['/home', '/login', '/signup']
  const isPublicRoute = publicRoutes.includes(location.pathname)

  // Show loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div>Loading...</div>
      </div>
    )
  }

  // Redirect to home if not authenticated and trying to access protected route
  if (!user && !isPublicRoute && location.pathname !== '/') {
    return <Navigate to="/home" replace />
  }

  // Redirect to dashboard if authenticated and on public auth pages
  if (user && (location.pathname === '/login' || location.pathname === '/signup')) {
    return <Navigate to="/" replace />
  }

  // Public pages without layout
  if (isPublicRoute) {
    return (
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    )
  }

  return (
    <Layout title={pageTitle} breadcrumbs={breadcrumbs}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ai" element={<AIAssistant />} />
        <Route path="/ai/chat" element={<AIAssistant />} />
        <Route path="/ai/popup" element={<AIAssistant />} />
        <Route path="/ai/translate" element={<AIAssistant />} />
        <Route path="/modules" element={<Modules />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/library" element={<Library />} />
        <Route path="/library/:appId" element={<AppDetail />} />
        <Route path="/customization/interface" element={<Interface />} />
        <Route path="/customization/interface/theme" element={<ThemeSettings />} />
        <Route path="/customization/interface/layout" element={<LayoutOptions />} />
        <Route path="/customization/interface/display" element={<DisplayOptions />} />
        <Route path="/customization/interface/sidebar" element={<SidebarConfiguration />} />
        <Route path="/customization/interface/header" element={<HeaderSetting />} />
        <Route path="/customization/system-admin" element={<SystemAdmin />} />
        <Route path="/customization/system-admin/application-management" element={<ApplicationManagement />} />
        <Route path="/oneapp-developer" element={<OneAppDeveloper />} />
        <Route path="/oneapp-data" element={<OneAppData />} />
        <Route path="/onlyapi" element={<OnlyAPI />} />
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
          <NavigationProvider>
            <HeaderProvider>
              <AuthProvider>
                <Router>
                  <AppContent />
                </Router>
              </AuthProvider>
            </HeaderProvider>
          </NavigationProvider>
        </DisplayProvider>
      </LayoutProvider>
    </ThemeProvider>
  )
}

export default App

