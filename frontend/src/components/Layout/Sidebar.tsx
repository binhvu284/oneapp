import { NavLink, useLocation } from 'react-router-dom'
import { IconDashboard, IconAI, IconModules, IconSettings, IconChevronLeft, IconChevronRight } from '../Icons'
import styles from './Sidebar.module.css'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onNavigate?: () => void
  onMobileClose?: () => void
}

const navigation = [
  { path: '/', label: 'Dashboard', icon: IconDashboard },
  { path: '/ai', label: 'AI Assistant', icon: IconAI },
  { path: '/modules', label: 'Modules', icon: IconModules },
  { path: '/settings', label: 'Settings', icon: IconSettings },
]

export function Sidebar({ collapsed, onToggle, onNavigate, onMobileClose }: SidebarProps) {
  const location = useLocation()

  const handleToggleClick = () => {
    // On mobile, close the sidebar
    if (onMobileClose && window.innerWidth <= 768) {
      onMobileClose()
    } else {
      // On desktop, toggle collapsed state
      onToggle()
    }
  }

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
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
    </aside>
  )
}
