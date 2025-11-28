import { useEffect, useRef } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import styles from './MobilePopups.module.css'

interface MobilePopupsProps {
  open: boolean
  onClose: () => void
  title: string
  breadcrumbs?: Array<{ label: string; path: string }>
}

export function MobilePopups({ open, onClose, title, breadcrumbs }: MobilePopupsProps) {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      
      // Check if click is outside sidebar (header is hidden in floating mode)
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(target)
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div ref={sidebarRef} className={styles.sidebarPopup}>
        <Sidebar
          collapsed={false}
          onToggle={() => {}}
          onNavigate={onClose}
          onMobileClose={onClose}
          mobileOpen={true}
          hideToggle={true}
        />
      </div>
      {/* Header popup hidden in floating button mode */}
      <div ref={headerRef} className={`${styles.headerPopup} ${styles.hidden}`}>
        <Header
          title={title}
          breadcrumbs={breadcrumbs}
          mobileMenuOpen={true}
          onMobileMenuToggle={() => {}}
        />
      </div>
    </>
  )
}

