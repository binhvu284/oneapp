import { ReactNode, useEffect, useRef, useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import styles from './Layout.module.css'

interface LayoutProps {
  children: ReactNode
  title?: string
  breadcrumbs?: Array<{ label: string; path: string }>
}

export function Layout({ children, title, breadcrumbs }: LayoutProps) {
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
  const rootRef = useRef<HTMLDivElement | null>(null)

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

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}
    >
      <Sidebar
        collapsed={collapsed}
        onToggle={handleToggle}
        onNavigate={() => setMobileOpen(false)}
        onMobileClose={() => setMobileOpen(false)}
        mobileOpen={mobileOpen}
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
        />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  )
}
