import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface NavigationItem {
  id: string
  path: string
  label: string
  icon: string // Icon component name
  enabled: boolean
}

export interface CustomSection {
  id: string
  label: string
  items: NavigationItem[]
  expanded: boolean
}

interface NavigationConfig {
  basicItems: NavigationItem[]
  customSections: CustomSection[]
}

interface NavigationContextType {
  config: NavigationConfig
  toggleBasicItem: (id: string) => void
  addCustomSection: (label: string) => void
  deleteCustomSection: (id: string) => void
  updateCustomSectionLabel: (id: string, label: string) => void
  addItemToSection: (sectionId: string, item: Omit<NavigationItem, 'id' | 'enabled'>) => void
  removeItemFromSection: (sectionId: string, itemId: string) => void
  toggleSectionExpanded: (sectionId: string) => void
  reorderSections: (sections: CustomSection[]) => void
  reorderSectionItems: (sectionId: string, items: NavigationItem[]) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

const DEFAULT_BASIC_ITEMS: NavigationItem[] = [
  { id: 'dashboard', path: '/', label: 'Dashboard', icon: 'IconDashboard', enabled: true },
  { id: 'notifications', path: '/notifications', label: 'Notification', icon: 'IconBell', enabled: false },
  { id: 'library', path: '/library', label: 'OneLibrary', icon: 'IconLibrary', enabled: false },
]

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<NavigationConfig>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('oneapp_navigation_config')
        if (saved) {
          const parsed = JSON.parse(saved)
          // Validate the parsed data
          if (parsed && Array.isArray(parsed.basicItems) && Array.isArray(parsed.customSections)) {
            // Only allow Dashboard, Notification, OneLibrary - filter out any other items
            const validItemIds = ['dashboard', 'notifications', 'library']
            const validBasicItems = parsed.basicItems.filter((item: NavigationItem) =>
              validItemIds.includes(item.id)
            )
            
            // If we have invalid items or missing items, reset to default
            if (validBasicItems.length !== 3 || validItemIds.some(id => !validBasicItems.find((item: NavigationItem) => item.id === id))) {
              return {
                basicItems: DEFAULT_BASIC_ITEMS,
                customSections: parsed.customSections || [],
              }
            }
            
            return {
              basicItems: validBasicItems,
              customSections: parsed.customSections || [],
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading navigation config:', error)
      // Fall through to default
    }
    return {
      basicItems: DEFAULT_BASIC_ITEMS,
      customSections: [],
    }
  })

  // Validate and clean up config on mount and when config changes
  useEffect(() => {
    const validItemIds = ['dashboard', 'notifications', 'library']
    const hasInvalidItems = config.basicItems.some((item) => !validItemIds.includes(item.id))
    const missingItems = validItemIds.filter((id) => !config.basicItems.find((item) => item.id === id))
    
    if (hasInvalidItems || missingItems.length > 0) {
      // Reset to default if invalid
      setConfig({
        basicItems: DEFAULT_BASIC_ITEMS,
        customSections: config.customSections,
      })
      return
    }
    
    // Save to localStorage
    try {
      if (typeof window !== 'undefined' && config) {
        localStorage.setItem('oneapp_navigation_config', JSON.stringify(config))
      }
    } catch (error) {
      console.error('Error saving navigation config:', error)
      // Ignore errors
    }
  }, [config])

  const toggleBasicItem = (id: string) => {
    setConfig((prev) => {
      const enabledCount = prev.basicItems.filter((item) => item.enabled).length
      const item = prev.basicItems.find((i) => i.id === id)
      
      // Check if we're trying to enable and already have max 3 enabled
      if (!item?.enabled && enabledCount >= 3) {
        return prev // Don't allow more than 3 enabled items
      }

      return {
        ...prev,
        basicItems: prev.basicItems.map((item) =>
          item.id === id ? { ...item, enabled: !item.enabled } : item
        ),
      }
    })
  }

  const addCustomSection = (label: string) => {
    const newSection: CustomSection = {
      id: `section-${Date.now()}`,
      label,
      items: [],
      expanded: true,
    }
    setConfig((prev) => ({
      ...prev,
      customSections: [...prev.customSections, newSection],
    }))
  }

  const deleteCustomSection = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      customSections: prev.customSections.filter((section) => section.id !== id),
    }))
  }

  const updateCustomSectionLabel = (id: string, label: string) => {
    setConfig((prev) => ({
      ...prev,
      customSections: prev.customSections.map((section) =>
        section.id === id ? { ...section, label } : section
      ),
    }))
  }

  const addItemToSection = (sectionId: string, item: Omit<NavigationItem, 'id' | 'enabled'>) => {
    const newItem: NavigationItem = {
      ...item,
      id: `item-${Date.now()}`,
      enabled: true,
    }
    setConfig((prev) => ({
      ...prev,
      customSections: prev.customSections.map((section) =>
        section.id === sectionId
          ? { ...section, items: [...section.items, newItem] }
          : section
      ),
    }))
  }

  const removeItemFromSection = (sectionId: string, itemId: string) => {
    setConfig((prev) => ({
      ...prev,
      customSections: prev.customSections.map((section) =>
        section.id === sectionId
          ? { ...section, items: section.items.filter((item) => item.id !== itemId) }
          : section
      ),
    }))
  }

  const toggleSectionExpanded = (sectionId: string) => {
    setConfig((prev) => ({
      ...prev,
      customSections: prev.customSections.map((section) =>
        section.id === sectionId ? { ...section, expanded: !section.expanded } : section
      ),
    }))
  }

  const reorderSections = (sections: CustomSection[]) => {
    setConfig((prev) => ({
      ...prev,
      customSections: sections,
    }))
  }

  const reorderSectionItems = (sectionId: string, items: NavigationItem[]) => {
    setConfig((prev) => ({
      ...prev,
      customSections: prev.customSections.map((section) =>
        section.id === sectionId ? { ...section, items } : section
      ),
    }))
  }

  return (
    <NavigationContext.Provider
      value={{
        config,
        toggleBasicItem,
        addCustomSection,
        deleteCustomSection,
        updateCustomSectionLabel,
        addItemToSection,
        removeItemFromSection,
        toggleSectionExpanded,
        reorderSections,
        reorderSectionItems,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}

