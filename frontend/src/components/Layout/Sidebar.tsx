import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  IconDashboard, 
  IconAI, 
  IconModules, 
  IconSettings, 
  IconChevronLeft, 
  IconChevronRight,
  IconChevronDown,
  IconChevronUp,
  IconInterface,
  IconSystemAdmin,
  IconCustomization
} from '../Icons'
import styles from './Sidebar.module.css'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onNavigate?: () => void
  onMobileClose?: () => void
  mobileOpen?: boolean
}

const navigation = [
  { path: '/', label: 'Dashboard', icon: IconDashboard },
  { path: '/ai', label: 'AI Assistant', icon: IconAI },
  { path: '/modules', label: 'Modules', icon: IconModules },
  { path: '/settings', label: 'Settings', icon: IconSettings },
]

const customizationItems = [
  { path: '/customization/interface', label: 'Interface', icon: IconInterface },
  { path: '/customization/system-admin', label: 'System Admin', icon: IconSystemAdmin },
]

export function Sidebar({ collapsed, onToggle, onNavigate, onMobileClose, mobileOpen }: SidebarProps) {
  const location = useLocation()
  const [customizationOpen, setCustomizationOpen] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('oneapp_customization_open')
        return saved === '1'
      }
    } catch {
      // Ignore errors
    }
    return false
  })

  useEffect(() => {
    // Auto-open customization section if on a customization page
    if (location.pathname.startsWith('/customization')) {
      setCustomizationOpen(true)
    }
  }, [location.pathname])

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('oneapp_customization_open', customizationOpen ? '1' : '0')
      }
    } catch {
      // Ignore errors
    }
  }, [customizationOpen])

  const handleToggleClick = () => {
    // On mobile, close the sidebar
    if (onMobileClose && window.innerWidth <= 768) {
      onMobileClose()
    } else {
      // On desktop, toggle collapsed state
      onToggle()
    }
  }

  const toggleCustomization = () => {
    if (collapsed) return // Don't toggle when collapsed
    setCustomizationOpen(!customizationOpen)
  }

  const isCustomizationActive = location.pathname.startsWith('/customization')

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
      <div className={styles.logo}>
        {!collapsed && <span className={styles.logoText}>OneApp</span>}
        <button
          className={styles.toggleButton}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={handleToggleClick}
        >
          {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
        </button>
      </div>
      <nav className={styles.nav}>
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>
      <div className={styles.customizationSection}>
        {!collapsed ? (
          <>
            <button
              className={`${styles.sectionHeader} ${isCustomizationActive ? styles.active : ''}`}
              onClick={toggleCustomization}
              type="button"
            >
              <span className={styles.sectionTitle}>Customization</span>
              <span className={styles.sectionToggle}>
                {customizationOpen ? <IconChevronUp /> : <IconChevronDown />}
              </span>
            </button>
            <nav className={`${styles.sectionContent} ${customizationOpen ? styles.open : ''}`}>
              {customizationItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `${styles.sectionLink} ${isActive ? styles.active : ''}`
                    }
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </>
        ) : (
          <div className={styles.collapsedSection}>
            {customizationItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `${styles.sectionLink} ${isActive ? styles.active : ''}`
                  }
                  title={item.label}
                >
                  <Icon />
                </NavLink>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
