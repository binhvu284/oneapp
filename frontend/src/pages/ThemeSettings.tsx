import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { IconTheme } from '@/components/Icons'
import { themeTemplates } from '@/data/themes'
import { ThemeTemplate, CustomTheme } from '@/types/theme'
import { ThemePreview } from '@/components/ThemePreview'
import { ThemeDetail } from '@/components/ThemeDetail'
import { ThemeManager } from '@/components/ThemeBuilder/ThemeManager'
import styles from './ThemeSettings.module.css'

export function ThemeSettings() {
  const { currentTheme, theme, applyThemeTemplate, applyCustomTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<ThemeTemplate | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showTemplateList, setShowTemplateList] = useState(false)
  const [showCustomThemes, setShowCustomThemes] = useState(false)
  const [currentCustomTheme, setCurrentCustomTheme] = useState<CustomTheme | null>(null)

  // Load current custom theme from localStorage
  useEffect(() => {
    try {
      if (theme === 'custom') {
        const customThemeId = localStorage.getItem('oneapp_custom_theme_id')
        if (customThemeId) {
          const stored = localStorage.getItem('oneapp_custom_themes')
          if (stored) {
            const themes = JSON.parse(stored) as CustomTheme[]
            const customTheme = themes.find(t => t.id === customThemeId)
            if (customTheme) {
              setCurrentCustomTheme(customTheme)
              return
            }
          }
        }
      }
      setCurrentCustomTheme(null)
    } catch (error) {
      console.error('Failed to load custom themes:', error)
      setCurrentCustomTheme(null)
    }
  }, [theme, currentTheme?.id])

  const handleThemeClick = (theme: ThemeTemplate) => {
    setSelectedTheme(theme)
    setShowDetail(true)
  }

  const handleDetailClick = (theme: ThemeTemplate) => {
    setSelectedTheme(theme)
    setShowDetail(true)
  }

  const handleApplyTheme = () => {
    if (selectedTheme) {
      applyThemeTemplate(selectedTheme.id)
      setShowDetail(false)
      setSelectedTheme(null)
      setShowTemplateList(false)
    }
  }

  const handleCloseDetail = () => {
    setShowDetail(false)
    setSelectedTheme(null)
  }

  const handleSelectCustomTheme = (theme: CustomTheme) => {
    applyCustomTheme(theme.colors, theme.id)
    setCurrentCustomTheme(theme)
    setShowCustomThemes(false)
  }

  const handleApplyCustomTheme = (theme: CustomTheme) => {
    applyCustomTheme(theme.colors, theme.id)
    setCurrentCustomTheme(theme)
    setShowCustomThemes(false)
  }

  const handleDeleteCustomTheme = (themeId: string) => {
    // Theme deletion is handled in ThemeManager
    // If deleted theme was active, reset to default
    if (currentTheme?.id === themeId || currentCustomTheme?.id === themeId) {
      applyThemeTemplate('light')
      setCurrentCustomTheme(null)
    }
  }

  // Check if current theme is from templates (not custom)
  const isTemplateTheme = theme !== 'custom' && currentTheme && themeTemplates.some(t => t.id === currentTheme.id)

  if (showCustomThemes) {
    return (
      <div className={styles.themeSettings}>
        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <button
                className={styles.backButton}
                onClick={() => setShowCustomThemes(false)}
              >
                ← Back
              </button>
              <div className={styles.iconWrapper}>
                <IconTheme />
              </div>
              <div className={styles.sectionContent}>
                <h2>Customize Your Theme</h2>
                <p className={styles.description}>
                  Create, edit, and manage your custom themes. Each theme can be fully personalized with your preferred colors.
                </p>
              </div>
            </div>
            <ThemeManager
              onSelectTheme={handleSelectCustomTheme}
              onApplyTheme={handleApplyCustomTheme}
              onDeleteTheme={handleDeleteCustomTheme}
            />
          </div>
        </div>
      </div>
    )
  }

  if (showTemplateList) {
    return (
      <>
        <div className={styles.themeSettings}>
          <div className={styles.content}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <button
                  className={styles.backButton}
                  onClick={() => setShowTemplateList(false)}
                >
                  ← Back
                </button>
                <div className={styles.iconWrapper}>
                  <IconTheme />
                </div>
                <div className={styles.sectionContent}>
                  <h2>Choose from Templates</h2>
                  <p className={styles.description}>
                    Select a pre-built theme template. Click on any theme to view detailed color information and apply it.
                  </p>
                  <div className={styles.themeGrid}>
                    {themeTemplates.map((theme) => (
                      <ThemePreview
                        key={theme.id}
                        theme={theme}
                        isActive={currentTheme?.id === theme.id}
                        showActions={true}
                        onApply={() => {
                          applyThemeTemplate(theme.id)
                          setShowTemplateList(false)
                        }}
                        onDetail={() => handleDetailClick(theme)}
                        onClick={() => handleDetailClick(theme)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showDetail && selectedTheme && (
          <ThemeDetail
            theme={selectedTheme}
            onApply={handleApplyTheme}
            onClose={handleCloseDetail}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div className={styles.themeSettings}>
        <div className={styles.content}>
          {/* Choose from Templates Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.iconWrapper}>
                <IconTheme />
              </div>
              <div className={styles.sectionContent}>
                <h2>Choose from Templates</h2>
                <p className={styles.description}>
                  {isTemplateTheme
                    ? 'Currently using a pre-built theme template. Click Change to select a different template.'
                    : 'Select a pre-built theme template to get started.'}
                </p>
                {isTemplateTheme && currentTheme ? (
                  <div className={styles.currentTheme}>
                    <ThemePreview
                      theme={currentTheme}
                      isActive={true}
                      onClick={() => handleThemeClick(currentTheme)}
                    />
                    <button
                      className={styles.changeButton}
                      onClick={() => setShowTemplateList(true)}
                    >
                      Change Template
                    </button>
                  </div>
                ) : (
                  <button
                    className={styles.chooseButton}
                    onClick={() => setShowTemplateList(true)}
                  >
                    Choose Template
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Customize Your Theme Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.iconWrapper}>
                <IconTheme />
              </div>
              <div className={styles.sectionContent}>
                <h2>Customize Your Theme</h2>
                <p className={styles.description}>
                  {currentCustomTheme
                    ? 'Currently using a custom theme. Click Change to select a different custom theme or create a new one.'
                    : 'Create and save your own custom themes with personalized colors. Full control over every component\'s appearance.'}
                </p>
                {currentCustomTheme ? (
                  <div className={styles.currentTheme}>
                    <ThemePreview
                      theme={currentCustomTheme}
                      isActive={true}
                    />
                    <button
                      className={styles.changeButton}
                      onClick={() => setShowCustomThemes(true)}
                    >
                      Change Custom Theme
                    </button>
                  </div>
                ) : (
                  <button
                    className={styles.chooseButton}
                    onClick={() => setShowCustomThemes(true)}
                  >
                    Choose Custom Theme
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showDetail && selectedTheme && (
        <ThemeDetail
          theme={selectedTheme}
          onApply={handleApplyTheme}
          onClose={handleCloseDetail}
        />
      )}
    </>
  )
}

