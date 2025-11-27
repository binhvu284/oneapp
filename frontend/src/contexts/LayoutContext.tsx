import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type LayoutStyle = 'default' | 'block'
export type MobileLayoutType = 'default' | 'floating'

interface LayoutPreferences {
  sidebarWidth: number
  layoutStyle: LayoutStyle
  headerHeight: number
  mobileLayoutType: MobileLayoutType
}

interface LayoutContextType {
  preferences: LayoutPreferences
  setSidebarWidth: (width: number) => void
  setLayoutStyle: (style: LayoutStyle) => void
  setHeaderHeight: (height: number) => void
  setMobileLayoutType: (type: MobileLayoutType) => void
  resetToDefaults: () => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

const DEFAULT_PREFERENCES: LayoutPreferences = {
  sidebarWidth: 260,
  layoutStyle: 'default',
  headerHeight: 56,
  mobileLayoutType: 'default',
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<LayoutPreferences>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('oneapp_layout_preferences')
        if (saved) {
        const parsed = JSON.parse(saved)
        return {
          sidebarWidth: parsed.sidebarWidth || DEFAULT_PREFERENCES.sidebarWidth,
          layoutStyle: parsed.layoutStyle || DEFAULT_PREFERENCES.layoutStyle,
          headerHeight: parsed.headerHeight || DEFAULT_PREFERENCES.headerHeight,
          mobileLayoutType: parsed.mobileLayoutType || DEFAULT_PREFERENCES.mobileLayoutType,
        }
        }
      }
    } catch {
      // Ignore errors
    }
    return DEFAULT_PREFERENCES
  })

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('oneapp_layout_preferences', JSON.stringify(preferences))
      }
    } catch {
      // Ignore errors
    }
  }, [preferences])

  const setSidebarWidth = (width: number) => {
    setPreferences((prev) => ({ ...prev, sidebarWidth: Math.max(200, Math.min(400, width)) }))
  }

  const setLayoutStyle = (style: LayoutStyle) => {
    setPreferences((prev) => ({ ...prev, layoutStyle: style }))
  }

  const setHeaderHeight = (height: number) => {
    setPreferences((prev) => ({ ...prev, headerHeight: Math.max(48, Math.min(80, height)) }))
  }

  const setMobileLayoutType = (type: MobileLayoutType) => {
    setPreferences((prev) => ({ ...prev, mobileLayoutType: type }))
  }

  const resetToDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES)
  }

  return (
    <LayoutContext.Provider value={{ preferences, setSidebarWidth, setLayoutStyle, setHeaderHeight, setMobileLayoutType, resetToDefaults }}>
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}

