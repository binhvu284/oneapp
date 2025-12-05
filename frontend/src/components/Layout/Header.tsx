import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { 
  IconDashboard, 
  IconAI, 
  IconModules, 
  IconSettings, 
  IconMenu, 
  IconUser, 
  IconLogout,
  IconInterface,
  IconSystemAdmin,
  IconTheme,
  IconStorage,
  IconDeveloper,
  IconDatabase
} from '../Icons'
import { getAvatarInitial, getAvatarColor } from '@/utils/avatarUtils'
import styles from './Header.module.css'

interface HeaderProps {
  title: string
  breadcrumbs?: Array<{ label: string; path: string }>
  mobileMenuOpen?: boolean
  onMobileMenuToggle?: (e: React.MouseEvent) => void
  style?: React.CSSProperties
}

export function Header({ title, breadcrumbs, mobileMenuOpen, onMobileMenuToggle, style }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  // Calculate dropdown position when opening in mobile popup
  useEffect(() => {
    if (dropdownOpen && mobileMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right
      })
    } else {
      setDropdownPosition(null)
    }
  }, [dropdownOpen, mobileMenuOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  // Get icon for current route
  const iconForRoute = () => {
    if (location.pathname === '/' || location.pathname.startsWith('/dashboard')) {
      return <IconDashboard />
    }
    if (location.pathname.startsWith('/oneapp-developer')) {
      return <IconDeveloper />
    }
    if (location.pathname.startsWith('/oneapp-data')) {
      return <IconDatabase />
    }
    if (location.pathname.startsWith('/ai')) {
      return <IconAI />
    }
    if (location.pathname.startsWith('/modules')) {
      return <IconModules />
    }
    if (location.pathname.startsWith('/settings')) {
      return <IconSettings />
    }
    if (location.pathname.startsWith('/customization/interface/theme')) {
      return <IconTheme />
    }
    if (location.pathname.startsWith('/customization/interface')) {
      return <IconInterface />
    }
    if (location.pathname.startsWith('/customization/system-admin')) {
      return <IconSystemAdmin />
    }
    // Default icon for unknown routes
    return <IconDashboard />
  }

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const userName = user?.email?.split('@')[0] || user?.name || 'User'
  const avatarInitial = getAvatarInitial(userName)
  const avatarColor = getAvatarColor(userName)

  return (
    <header className={styles.header} style={style}>
      {onMobileMenuToggle && (
        <button
          className={styles.mobileToggle}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={onMobileMenuToggle}
        >
          <IconMenu />
        </button>
      )}
      <div className={styles.pageTitle}>
        {iconForRoute()}
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <div className={styles.breadcrumbs}>
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.path} className={styles.breadcrumb}>
                {index > 0 && <span className={styles.separator}>/</span>}
                {index === breadcrumbs.length - 1 ? (
                  <span className={styles.current}>{crumb.label}</span>
                ) : (
                  <button
                    className={styles.breadcrumbLink}
                    onClick={() => navigate(crumb.path)}
                  >
                    {crumb.label}
                  </button>
                )}
              </span>
            ))}
          </div>
        ) : (
          <span>{title}</span>
        )}
      </div>
      <div className={styles.actions} ref={menuRef}>
        <button 
          ref={buttonRef}
          className={styles.userButton} 
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div
            className={styles.avatar}
            style={{
              backgroundColor: avatarColor,
            }}
          >
            {avatarInitial}
          </div>
          <span className={styles.userName}>{userName}</span>
        </button>
        {dropdownOpen && (
          <div 
            className={styles.dropdown}
            style={dropdownPosition ? { 
              position: 'fixed', 
              top: `${dropdownPosition.top}px`, 
              right: `${dropdownPosition.right}px` 
            } : undefined}
          >
            <button
              className={styles.dropdownItem}
              onClick={() => {
                setDropdownOpen(false)
                // TODO: Open profile modal
              }}
            >
              <IconUser style={{ marginRight: 8 }} />
              Profile
            </button>
            <button
              className={styles.dropdownItem}
              onClick={() => {
                setDropdownOpen(false)
                navigate('/settings')
              }}
            >
              <IconSettings style={{ marginRight: 8 }} />
              Settings
            </button>
            <button
              className={styles.dropdownItem}
              onClick={() => {
                setDropdownOpen(false)
                navigate('/library')
              }}
            >
              <IconStorage style={{ marginRight: 8 }} />
              Library
            </button>
            <div className={styles.divider} />
            <button className={styles.dropdownItem} onClick={handleLogout}>
              <IconLogout style={{ marginRight: 8 }} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
