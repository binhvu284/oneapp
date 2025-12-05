import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  IconChevronLeft, 
  IconChevronRight,
  IconChevronDown,
  IconChevronUp,
  IconInterface,
  IconSystemAdmin,
} from '../Icons'
import { useNavigation } from '@/contexts/NavigationContext'
import { getIcon } from '@/utils/iconUtils'
import styles from './Sidebar.module.css'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onNavigate?: () => void
  onMobileClose?: () => void
  mobileOpen?: boolean
  hideToggle?: boolean
  style?: React.CSSProperties
}

const customizationItems = [
  { path: '/customization/interface', label: 'Interface', icon: IconInterface },
  { path: '/customization/system-admin', label: 'System Admin', icon: IconSystemAdmin },
]

export function Sidebar({ collapsed, onToggle, onNavigate, onMobileClose, mobileOpen, hideToggle = false, style }: SidebarProps) {
  const location = useLocation()
  const { config } = useNavigation()
  const [customSectionsOpen, setCustomSectionsOpen] = useState<Record<string, boolean>>({})
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
    
    // Auto-open custom sections if on a page within that section
    if (config?.customSections) {
      const newSectionsOpen: Record<string, boolean> = {}
      config.customSections.forEach((section) => {
        const isActive = section.items?.some((item) => location.pathname === item.path) || false
        if (isActive) {
          newSectionsOpen[section.id] = true
        }
      })
      if (Object.keys(newSectionsOpen).length > 0) {
        setCustomSectionsOpen((prev) => ({ ...prev, ...newSectionsOpen }))
      }
    }
  }, [location.pathname, config?.customSections])

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
    setCustomizationOpen(!customizationOpen)
  }

  const toggleCustomSection = (sectionId: string) => {
    setCustomSectionsOpen((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }))
  }

  const isCustomizationActive = location.pathname.startsWith('/customization')

  // Get enabled basic items
  const enabledBasicItems = config?.basicItems?.filter((item) => item.enabled) || []
  const hasEnabledBasicItems = enabledBasicItems.length > 0
  const hasCustomSections = config?.customSections && config.customSections.length > 0

  return (
    <aside 
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''} ${hideToggle ? styles.hideToggle : ''}`}
      style={style}
      data-hide-toggle={hideToggle ? 'true' : 'false'}
    >
      <div className={styles.logo}>
        {!collapsed && (
          <div className={styles.logoContent}>
            <img 
              src="/icon.png" 
              alt="OneApp Logo" 
              className={styles.logoImage}
            />
            <span className={styles.logoText}>OneApp</span>
          </div>
        )}
        {!hideToggle && (
          <button
            className={styles.toggleButton}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={handleToggleClick}
          >
            {collapsed ? <IconChevronRight /> : <IconChevronLeft />}
          </button>
        )}
      </div>
      <div className={styles.sidebarContent}>
        {/* Basic Navigation Items */}
        {hasEnabledBasicItems && (
          <nav className={styles.nav}>
            {enabledBasicItems.map((item) => {
              const Icon = getIcon(item.icon)
              return (
                <NavLink
                  key={item.id}
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
        )}

        {/* Divider between Basic Navigation and Custom Sections */}
        {hasEnabledBasicItems && hasCustomSections && (
          <div className={styles.divider} />
        )}

        {/* Custom Sections - Scrollable */}
        {hasCustomSections && (
          <div className={styles.customSections}>
            {config.customSections.map((section) => {
              const isOpen = customSectionsOpen[section.id] ?? section.expanded
              return (
                <div key={section.id} className={styles.customSection}>
                  {!collapsed ? (
                    <>
                      <button
                        className={styles.sectionHeader}
                        onClick={() => toggleCustomSection(section.id)}
                        type="button"
                      >
                        <span className={styles.sectionTitle}>{section.label}</span>
                        <span className={styles.sectionToggle}>
                          {isOpen ? <IconChevronUp /> : <IconChevronDown />}
                        </span>
                      </button>
                      <nav className={`${styles.sectionContent} ${isOpen ? styles.open : ''}`}>
                        {section.items.map((item) => {
                          const Icon = getIcon(item.icon)
                          return (
                            <NavLink
                              key={item.id}
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
                    <>
                      <button
                        className={styles.collapsedSectionHeader}
                        onClick={() => toggleCustomSection(section.id)}
                        type="button"
                        title={section.label}
                      >
                        <span className={styles.sectionDot} />
                      </button>
                      {isOpen && (
                        <div className={styles.collapsedSection}>
                          {section.items.map((item) => {
                            const Icon = getIcon(item.icon)
                            return (
                              <NavLink
                                key={item.id}
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
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Customization Section */}
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
            <>
              <button
                className={`${styles.collapsedSectionHeader} ${styles.customizationHeader}`}
                onClick={toggleCustomization}
                type="button"
                title="Customization"
              >
                {customizationOpen ? <IconChevronUp /> : <IconChevronDown />}
              </button>
              {customizationOpen && (
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
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
