import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type DisplayType = 'Toggle' | 'Dropdown' | 'Navigation'

export interface HeaderItem {
  id: string
  label: string
  icon: string
  enabled: boolean
  displayType: DisplayType
  toggleValues?: { value1: string; value2: string; currentValue: string } // For Toggle type
  dropdownValues?: string[] // For Dropdown type
  navigationPath?: string // For Navigation type
  lockToggle?: boolean // Lock toggle option (e.g., for Notification)
}

interface HeaderConfig {
  items: HeaderItem[]
}

interface HeaderContextType {
  config: HeaderConfig
  toggleItem: (id: string) => void
  updateItemDisplayType: (id: string, displayType: DisplayType) => void
  updateToggleValues: (id: string, value1: string, value2: string, currentValue: string) => void
  updateDropdownValues: (id: string, values: string[]) => void
  updateNavigationPath: (id: string, path: string) => void
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined)

const DEFAULT_HEADER_ITEMS: HeaderItem[] = [
  {
    id: 'theme',
    label: 'Theme',
    icon: 'IconTheme',
    enabled: false,
    displayType: 'Toggle',
    toggleValues: {
      value1: 'Light',
      value2: 'Dark',
      currentValue: 'Dark',
    },
  },
  {
    id: 'notification',
    label: 'Notification',
    icon: 'IconBell',
    enabled: false,
    displayType: 'Dropdown',
    dropdownValues: ['All', 'Mentions', 'None'],
    lockToggle: true, // Lock toggle option for Notification
  },
  {
    id: 'language',
    label: 'Language',
    icon: 'IconLanguage',
    enabled: false,
    displayType: 'Navigation',
    navigationPath: '/language',
  },
]

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<HeaderConfig>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('oneapp_header_config')
        if (saved) {
          const parsed = JSON.parse(saved)
          // Validate the parsed data
          if (parsed && Array.isArray(parsed.items)) {
            return parsed
          }
        }
      }
    } catch (error) {
      console.error('Error loading header config:', error)
      // Fall through to default
    }
    return {
      items: DEFAULT_HEADER_ITEMS,
    }
  })

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && config) {
        localStorage.setItem('oneapp_header_config', JSON.stringify(config))
      }
    } catch (error) {
      console.error('Error saving header config:', error)
      // Ignore errors
    }
  }, [config])

  const toggleItem = (id: string) => {
    setConfig((prev) => {
      const enabledCount = prev.items.filter((item) => item.enabled).length
      const item = prev.items.find((i) => i.id === id)
      
      // Check if we're trying to enable and already have max 2 enabled
      if (!item?.enabled && enabledCount >= 2) {
        return prev // Don't allow more than 2 enabled items
      }

      return {
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, enabled: !item.enabled } : item
        ),
      }
    })
  }

  const updateItemDisplayType = (id: string, displayType: DisplayType) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          // If trying to set Toggle but it's locked, don't allow
          if (displayType === 'Toggle' && item.lockToggle) {
            return item
          }
          return { ...item, displayType }
        }
        return item
      }),
    }))
  }

  const updateToggleValues = (id: string, value1: string, value2: string, currentValue: string) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id
          ? { ...item, toggleValues: { value1, value2, currentValue } }
          : item
      ),
    }))
  }

  const updateDropdownValues = (id: string, values: string[]) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, dropdownValues: values } : item
      ),
    }))
  }

  const updateNavigationPath = (id: string, path: string) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, navigationPath: path } : item
      ),
    }))
  }

  return (
    <HeaderContext.Provider
      value={{
        config,
        toggleItem,
        updateItemDisplayType,
        updateToggleValues,
        updateDropdownValues,
        updateNavigationPath,
      }}
    >
      {children}
    </HeaderContext.Provider>
  )
}

export function useHeader() {
  const context = useContext(HeaderContext)
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider')
  }
  return context
}

