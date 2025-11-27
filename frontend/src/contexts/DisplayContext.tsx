import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type TextSize = 'small' | 'medium' | 'large'
export type FontFamily = 'system' | 'sans-serif' | 'serif' | 'monospace'
export type IconSize = 'small' | 'medium' | 'large'
export type BorderRadius = 'none' | 'small' | 'medium' | 'large'
interface DisplayPreferences {
  fontFamily: FontFamily
  textSize: TextSize
  lineHeight: number
  letterSpacing: number
  iconSize: IconSize
  borderRadius: BorderRadius
}

interface DisplayContextType {
  preferences: DisplayPreferences
  setFontFamily: (family: FontFamily) => void
  setTextSize: (size: TextSize) => void
  setLineHeight: (height: number) => void
  setLetterSpacing: (spacing: number) => void
  setIconSize: (size: IconSize) => void
  setBorderRadius: (radius: BorderRadius) => void
  resetToDefaults: () => void
}

const DisplayContext = createContext<DisplayContextType | undefined>(undefined)

const DEFAULT_PREFERENCES: DisplayPreferences = {
  fontFamily: 'system',
  textSize: 'medium',
  lineHeight: 1.5,
  letterSpacing: 0,
  iconSize: 'medium',
  borderRadius: 'medium',
}

export function DisplayProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<DisplayPreferences>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('oneapp_display_preferences')
        if (saved) {
          const parsed = JSON.parse(saved)
          return {
            fontFamily: parsed.fontFamily || DEFAULT_PREFERENCES.fontFamily,
            textSize: parsed.textSize || DEFAULT_PREFERENCES.textSize,
            lineHeight: parsed.lineHeight || DEFAULT_PREFERENCES.lineHeight,
            letterSpacing: parsed.letterSpacing ?? DEFAULT_PREFERENCES.letterSpacing,
            iconSize: parsed.iconSize || DEFAULT_PREFERENCES.iconSize,
            borderRadius: parsed.borderRadius || DEFAULT_PREFERENCES.borderRadius,
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
        localStorage.setItem('oneapp_display_preferences', JSON.stringify(preferences))
        applyDisplayPreferences(preferences)
      }
    } catch {
      // Ignore errors
    }
  }, [preferences])

  const applyDisplayPreferences = (prefs: DisplayPreferences) => {
    const root = document.documentElement

    // Font family
    const fontMap: Record<FontFamily, string> = {
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      'sans-serif': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      serif: 'Georgia, "Times New Roman", Times, serif',
      monospace: '"Fira Code", "Courier New", Courier, monospace',
    }
    root.style.setProperty('--font-family', fontMap[prefs.fontFamily])

    // Text size
    const textSizeMap: Record<TextSize, string> = {
      small: '14px',
      medium: '16px',
      large: '18px',
    }
    root.style.setProperty('--base-font-size', textSizeMap[prefs.textSize])

    // Line height
    root.style.setProperty('--line-height', prefs.lineHeight.toString())

    // Letter spacing
    root.style.setProperty('--letter-spacing', `${prefs.letterSpacing}px`)

    // Icon size
    const iconSizeMap: Record<IconSize, string> = {
      small: '16px',
      medium: '20px',
      large: '24px',
    }
    root.style.setProperty('--icon-size', iconSizeMap[prefs.iconSize])

    // Border radius
    const borderRadiusMap: Record<BorderRadius, string> = {
      none: '0px',
      small: '4px',
      medium: '8px',
      large: '12px',
    }
    root.style.setProperty('--border-radius', borderRadiusMap[prefs.borderRadius])
  }

  // Apply on mount
  useEffect(() => {
    applyDisplayPreferences(preferences)
  }, [])

  const setFontFamily = (family: FontFamily) => {
    setPreferences((prev) => ({ ...prev, fontFamily: family }))
  }

  const setTextSize = (size: TextSize) => {
    setPreferences((prev) => ({ ...prev, textSize: size }))
  }

  const setLineHeight = (height: number) => {
    setPreferences((prev) => ({ ...prev, lineHeight: Math.max(1, Math.min(2, height)) }))
  }

  const setLetterSpacing = (spacing: number) => {
    setPreferences((prev) => ({ ...prev, letterSpacing: Math.max(-1, Math.min(2, spacing)) }))
  }

  const setIconSize = (size: IconSize) => {
    setPreferences((prev) => ({ ...prev, iconSize: size }))
  }

  const setBorderRadius = (radius: BorderRadius) => {
    setPreferences((prev) => ({ ...prev, borderRadius: radius }))
  }

  const resetToDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES)
  }

  return (
    <DisplayContext.Provider
      value={{
        preferences,
        setFontFamily,
        setTextSize,
        setLineHeight,
        setLetterSpacing,
        setIconSize,
        setBorderRadius,
        resetToDefaults,
      }}
    >
      {children}
    </DisplayContext.Provider>
  )
}

export function useDisplay() {
  const context = useContext(DisplayContext)
  if (context === undefined) {
    throw new Error('useDisplay must be used within a DisplayProvider')
  }
  return context
}

