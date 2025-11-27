import { ReactNode, useEffect, useRef, useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { FloatingButton } from './FloatingButton'
import { MobilePopups } from './MobilePopups'
import { useLayout } from '@/contexts/LayoutContext'
import styles from './Layout.module.css'

interface LayoutProps {
  children: ReactNode
  title?: string
  breadcrumbs?: Array<{ label: string; path: string }>
}

export function Layout({ children, title, breadcrumbs }: LayoutProps) {
  const { preferences } = useLayout()
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem('oneapp_sidebar_collapsed')
        return stored === '1'
      }
    } catch {
      // Ignore errors
    }
    return false
  })

  const [mobileOpen, setMobileOpen] = useState(false)
  const [floatingMenuOpen, setFloatingMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Apply dynamic sidebar width and header height
  useEffect(() => {
    const root = rootRef.current
    const documentRoot = document.documentElement
    if (root) {
      const sidebarWidth = collapsed ? 72 : preferences.sidebarWidth
      root.style.setProperty('--sidebar-width', `${sidebarWidth}px`)
      root.style.setProperty('--sidebar-collapsed-width', '72px')
      root.style.setProperty('--header-height', `${preferences.headerHeight}px`)
      // Also set on document root for header to access
      documentRoot.style.setProperty('--header-height', `${preferences.headerHeight}px`)
    }
  }, [preferences.sidebarWidth, preferences.headerHeight, collapsed])

  useEffect(() => {
    if (!mobileOpen) return

    const onClick = (e: MouseEvent) => {
      if (!rootRef.current) return
      const sidebar = rootRef.current.querySelector(`.${styles.sidebar}`)
      if (sidebar && !sidebar.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [mobileOpen])

  const handleToggle = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('oneapp_sidebar_collapsed', next ? '1' : '0')
        }
      } catch {
        // Ignore errors
      }
      return next
    })
  }

  const handleMobileToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const isOpening = !mobileOpen
    setMobileOpen(isOpening)
    
    // When opening on mobile, always expand the sidebar
    if (isOpening && window.innerWidth <= 768) {
      setCollapsed(false)
    }
  }

  const useFloatingLayout = isMobile && preferences.mobileLayoutType === 'floating'

  return (
    <>
      {useFloatingLayout ? (
        <>
          <FloatingButton 
            onClick={() => setFloatingMenuOpen(!floatingMenuOpen)} 
            hidden={floatingMenuOpen}
          />
          <div className={styles.root}>
            <div className={styles.main}>
              <main className={styles.content}>{children}</main>
            </div>
          </div>
          <MobilePopups
            open={floatingMenuOpen}
            onClose={() => setFloatingMenuOpen(false)}
            title={title || 'Dashboard'}
            breadcrumbs={breadcrumbs}
          />
        </>
      ) : (
        <div
          ref={rootRef}
          className={`${styles.root} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''} ${preferences.layoutStyle === 'block' ? styles.blockStyle : ''}`}
          data-layout-style={preferences.layoutStyle}
        >
          <Sidebar
            collapsed={collapsed}
            onToggle={handleToggle}
            onNavigate={() => setMobileOpen(false)}
            onMobileClose={() => setMobileOpen(false)}
            mobileOpen={mobileOpen}
            style={preferences.layoutStyle === 'block' ? { borderRadius: '12px' } : undefined}
          />
          {mobileOpen && (
            <div className={styles.overlay} onClick={() => setMobileOpen(false)} />
          )}
          <div className={styles.main}>
            <Header
              title={title || 'Dashboard'}
              breadcrumbs={breadcrumbs}
              mobileMenuOpen={mobileOpen}
              onMobileMenuToggle={handleMobileToggle}
              style={preferences.layoutStyle === 'block' ? { borderRadius: '12px 12px 0 0' } : undefined}
            />
            <main className={styles.content}>{children}</main>
          </div>
        </div>
      )}
    </>
  )
}
