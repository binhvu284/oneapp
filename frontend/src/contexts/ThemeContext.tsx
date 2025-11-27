import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ThemeColors, ThemeTemplate } from '@/types/theme'
import { themeTemplates } from '@/data/themes'

type Theme = 'dark' | 'light' | 'custom'

interface ThemeContextType {
  theme: Theme
  currentTheme: ThemeTemplate | null
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  applyThemeTemplate: (templateId: string) => void
  applyCustomTheme: (colors: ThemeColors, themeId?: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('oneapp_theme') as Theme
        return savedTheme || 'light'
      }
    } catch {
      // Ignore errors
    }
    return 'light'
  })

  const [currentTheme, setCurrentTheme] = useState<ThemeTemplate | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedThemeId = localStorage.getItem('oneapp_theme_id')
        if (savedThemeId) {
          const template = themeTemplates.find((t) => t.id === savedThemeId)
          return template || themeTemplates[0]
        }
      }
    } catch {
      // Ignore errors
    }
    return themeTemplates[0]
  })

  const applyThemeColors = (colors: ThemeColors) => {
    const root = document.documentElement
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value)
    })
  }

  useEffect(() => {
    if (currentTheme) {
      applyThemeColors(currentTheme.colors)
      document.documentElement.setAttribute('data-theme', theme)
      try {
        localStorage.setItem('oneapp_theme', theme)
        localStorage.setItem('oneapp_theme_id', currentTheme.id)
      } catch {
        // Ignore errors
      }
    }
  }, [theme, currentTheme])

  const toggleTheme = () => {
    setThemeState((prev) => {
      const newTheme = prev === 'dark' ? 'light' : 'dark'
      const template = themeTemplates.find((t) => t.id === newTheme)
      if (template) {
        setCurrentTheme(template)
      }
      return newTheme
    })
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    if (newTheme !== 'custom') {
      const template = themeTemplates.find((t) => t.id === newTheme)
      if (template) {
        setCurrentTheme(template)
      }
    }
  }

  const applyThemeTemplate = (templateId: string) => {
    const template = themeTemplates.find((t) => t.id === templateId)
    if (template) {
      setCurrentTheme(template)
      setThemeState(template.id === 'dark' ? 'dark' : template.id === 'light' ? 'light' : 'custom')
    }
  }

  const applyCustomTheme = (colors: ThemeColors, themeId?: string) => {
    applyThemeColors(colors)
    setThemeState('custom')
    // Create a temporary theme template for currentTheme state
    const customThemeTemplate: ThemeTemplate = {
      id: themeId || 'custom',
      name: 'Custom Theme',
      description: 'Custom theme',
      colors: colors,
    }
    setCurrentTheme(customThemeTemplate)
    try {
      localStorage.setItem('oneapp_custom_theme', JSON.stringify(colors))
      if (themeId) {
        localStorage.setItem('oneapp_custom_theme_id', themeId)
      } else {
        localStorage.removeItem('oneapp_custom_theme_id')
      }
    } catch {
      // Ignore errors
    }
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      currentTheme,
      toggleTheme, 
      setTheme,
      applyThemeTemplate,
      applyCustomTheme
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

