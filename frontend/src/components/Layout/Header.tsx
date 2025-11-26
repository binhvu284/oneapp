import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { IconDashboard, IconAI, IconModules, IconSettings, IconMenu, IconUser, IconLogout } from '../Icons'
import { getAvatarInitial, getAvatarColor } from '@/utils/avatarUtils'
import styles from './Header.module.css'

interface HeaderProps {
  title: string
  mobileMenuOpen?: boolean
  onMobileMenuToggle?: (e: React.MouseEvent) => void
}

export function Header({ title, mobileMenuOpen, onMobileMenuToggle }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [settingOpen, setSettingOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

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
      return <IconDashboard style={{ marginRight: 8 }} />
    }
    if (location.pathname.startsWith('/ai')) {
      return <IconAI style={{ marginRight: 8 }} />
    }
    if (location.pathname.startsWith('/modules')) {
      return <IconModules style={{ marginRight: 8 }} />
    }
    if (location.pathname.startsWith('/settings')) {
      return <IconSettings style={{ marginRight: 8 }} />
    }
    return null
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
    <header className={styles.header}>
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
        <span>{title}</span>
      </div>
      <div className={styles.actions} ref={menuRef}>
        <button className={styles.userButton} onClick={() => setDropdownOpen(!dropdownOpen)}>
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
          <div className={styles.dropdown}>
            <button
              className={styles.dropdownItem}
              onClick={() => {
                setDropdownOpen(false)
                setProfileOpen(true)
              }}
            >
              <IconUser style={{ marginRight: 8 }} />
              Profile
            </button>
            <button
              className={styles.dropdownItem}
              onClick={() => {
                setDropdownOpen(false)
                setSettingOpen(true)
                navigate('/settings')
              }}
            >
              <IconSettings style={{ marginRight: 8 }} />
              Settings
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
