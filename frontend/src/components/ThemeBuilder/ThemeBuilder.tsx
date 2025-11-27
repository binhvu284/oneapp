import { useState, useEffect } from 'react'
import { ThemeColors, CustomTheme } from '@/types/theme'
import { useTheme } from '@/contexts/ThemeContext'
import { ColorPicker } from './ColorPicker'
import { ThemePreviewSection } from './ThemePreviewSection'
import styles from './ThemeBuilder.module.css'

interface ThemeBuilderProps {
  theme?: CustomTheme | null
  onSave: (theme: CustomTheme) => void
  onCancel: () => void
}

export function ThemeBuilder({ theme, onSave, onCancel }: ThemeBuilderProps) {
  const { currentTheme } = useTheme()
  
  const [themeName, setThemeName] = useState(theme?.name || 'My Custom Theme')
  const [colors, setColors] = useState<ThemeColors>(() => {
    if (theme) {
      return theme.colors
    }
    // Start with current theme colors
    return currentTheme?.colors || {
      bg: '#f6f8fb',
      panel: '#ffffff',
      bgSecondary: '#f9fafb',
      bgHover: '#f3f4f6',
      text: '#101828',
      textPrimary: '#101828',
      textSecondary: '#475467',
      muted: '#475467',
      primary: '#2563eb',
      primaryDark: '#1d4ed8',
      primaryLight: '#dbeafe',
      success: '#10b981',
      successLight: '#d1fae5',
      danger: '#ef4444',
      dangerDark: '#dc2626',
      dangerLight: '#fef2f2',
      warning: '#f59e0b',
      warningLight: '#fef3c7',
      info: '#3b82f6',
      infoLight: '#dbeafe',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      sidebarBg: '#ffffff',
      sidebarText: '#475467',
      sidebarActive: '#2563eb',
      sidebarIcon: '#475467',
      sidebarBorder: '#e5e7eb',
      headerBg: '#ffffff',
      headerText: '#101828',
      headerTitleText: '#101828',
      headerTitleIcon: '#2563eb',
      headerAvatarBg: '#2563eb',
      headerUserName: '#101828',
      headerBorder: '#e5e7eb',
      contentBg: '#f6f8fb',
      contentText: '#101828',
      contentTextSecondary: '#475467',
      contentButton: '#2563eb',
    } as ThemeColors
  })

  const [useAutoSidebar, setUseAutoSidebar] = useState(theme?.useAutoSidebar ?? true)
  const [useAutoHeader, setUseAutoHeader] = useState(theme?.useAutoHeader ?? true)
  const [useAutoContent, setUseAutoContent] = useState(theme?.useAutoContent ?? true)

  // Auto-apply main theme colors when auto is enabled
  useEffect(() => {
    if (useAutoSidebar) {
      setColors(prev => ({
        ...prev,
        sidebarBg: prev.panel,
        sidebarText: prev.textSecondary,
        sidebarIcon: prev.textSecondary,
        sidebarBorder: prev.border,
      }))
    }
  }, [useAutoSidebar, colors.panel, colors.textSecondary, colors.border])

  useEffect(() => {
    if (useAutoHeader) {
      setColors(prev => ({
        ...prev,
        headerBg: prev.panel,
        headerText: prev.text,
        headerTitleText: prev.text,
        headerTitleIcon: prev.primary,
        headerAvatarBg: prev.primary,
        headerUserName: prev.text,
        headerBorder: prev.border,
      }))
    }
  }, [useAutoHeader, colors.panel, colors.text, colors.primary, colors.border])

  useEffect(() => {
    if (useAutoContent) {
      setColors(prev => ({
        ...prev,
        contentBg: prev.bg,
        contentText: prev.text,
        contentTextSecondary: prev.textSecondary,
        contentButton: prev.primary,
      }))
    }
  }, [useAutoContent, colors.bg, colors.text, colors.textSecondary, colors.primary])

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    const customTheme: CustomTheme = {
      id: theme?.id || `custom-${Date.now()}`,
      name: themeName,
      description: `Custom theme: ${themeName}`,
      colors,
      useAutoSidebar,
      useAutoHeader,
      useAutoContent,
      createdAt: theme?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onSave(customTheme)
  }

  // Compute effective colors for preview
  const effectiveColors: ThemeColors = {
    ...colors,
    sidebarBg: useAutoSidebar ? colors.panel : colors.sidebarBg,
    sidebarText: useAutoSidebar ? colors.textSecondary : colors.sidebarText,
    sidebarIcon: useAutoSidebar ? colors.textSecondary : colors.sidebarIcon,
    sidebarBorder: useAutoSidebar ? colors.border : colors.sidebarBorder,
    headerBg: useAutoHeader ? colors.panel : colors.headerBg,
    headerText: useAutoHeader ? colors.text : colors.headerText,
    headerTitleText: useAutoHeader ? colors.text : colors.headerTitleText,
    headerTitleIcon: useAutoHeader ? colors.primary : colors.headerTitleIcon,
    headerAvatarBg: useAutoHeader ? colors.primary : colors.headerAvatarBg,
    headerUserName: useAutoHeader ? colors.text : colors.headerUserName,
    headerBorder: useAutoHeader ? colors.border : colors.headerBorder,
    contentBg: useAutoContent ? colors.bg : colors.contentBg,
    contentText: useAutoContent ? colors.text : colors.contentText,
    contentTextSecondary: useAutoContent ? colors.textSecondary : colors.contentTextSecondary,
    contentButton: useAutoContent ? colors.primary : colors.contentButton,
  }

  return (
    <div className={styles.builder}>
      <div className={styles.header}>
        <h2 className={styles.title}>{theme ? 'Edit Theme' : 'Create New Theme'}</h2>
        <div className={styles.nameInput}>
          <label htmlFor="theme-name">Theme Name</label>
          <input
            id="theme-name"
            type="text"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            placeholder="Enter theme name"
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.sections}>
          {/* Main Theme Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Main Theme</h3>
            <div className={styles.colorGrid}>
              <ColorPicker
                label="Main Theme Color"
                value={colors.primary}
                onChange={(value) => handleColorChange('primary', value)}
              />
              <ColorPicker
                label="Secondary Theme Color"
                value={colors.primaryDark}
                onChange={(value) => handleColorChange('primaryDark', value)}
              />
              <ColorPicker
                label="Main Text Color"
                value={colors.text}
                onChange={(value) => handleColorChange('text', value)}
              />
              <ColorPicker
                label="Secondary Text Color"
                value={colors.textSecondary}
                onChange={(value) => handleColorChange('textSecondary', value)}
              />
              <ColorPicker
                label="Background"
                value={colors.bg}
                onChange={(value) => handleColorChange('bg', value)}
              />
              <ColorPicker
                label="Panel Background"
                value={colors.panel}
                onChange={(value) => handleColorChange('panel', value)}
              />
            </div>
          </div>

          {/* Sidebar Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Sidebar</h3>
              <label className={styles.autoToggle}>
                <input
                  type="checkbox"
                  checked={useAutoSidebar}
                  onChange={(e) => setUseAutoSidebar(e.target.checked)}
                />
                <span>Auto (use Main Theme)</span>
              </label>
            </div>
            {!useAutoSidebar && (
              <div className={styles.colorGrid}>
                <ColorPicker
                  label="Background"
                  value={colors.sidebarBg}
                  onChange={(value) => handleColorChange('sidebarBg', value)}
                />
                <ColorPicker
                  label="Text"
                  value={colors.sidebarText}
                  onChange={(value) => handleColorChange('sidebarText', value)}
                />
                <ColorPicker
                  label="Icon"
                  value={colors.sidebarIcon}
                  onChange={(value) => handleColorChange('sidebarIcon', value)}
                />
                <ColorPicker
                  label="Border"
                  value={colors.sidebarBorder}
                  onChange={(value) => handleColorChange('sidebarBorder', value)}
                />
                <ColorPicker
                  label="Active Item"
                  value={colors.sidebarActive}
                  onChange={(value) => handleColorChange('sidebarActive', value)}
                />
              </div>
            )}
            <ThemePreviewSection type="sidebar" colors={effectiveColors} />
          </div>

          {/* Header Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Header</h3>
              <label className={styles.autoToggle}>
                <input
                  type="checkbox"
                  checked={useAutoHeader}
                  onChange={(e) => setUseAutoHeader(e.target.checked)}
                />
                <span>Auto (use Main Theme)</span>
              </label>
            </div>
            {!useAutoHeader && (
              <div className={styles.colorGrid}>
                <ColorPicker
                  label="Background"
                  value={colors.headerBg}
                  onChange={(value) => handleColorChange('headerBg', value)}
                />
                <ColorPicker
                  label="Title Text"
                  value={colors.headerTitleText}
                  onChange={(value) => handleColorChange('headerTitleText', value)}
                />
                <ColorPicker
                  label="Title Icon"
                  value={colors.headerTitleIcon}
                  onChange={(value) => handleColorChange('headerTitleIcon', value)}
                />
                <ColorPicker
                  label="Avatar Background"
                  value={colors.headerAvatarBg}
                  onChange={(value) => handleColorChange('headerAvatarBg', value)}
                />
                <ColorPicker
                  label="User Name"
                  value={colors.headerUserName}
                  onChange={(value) => handleColorChange('headerUserName', value)}
                />
                <ColorPicker
                  label="Border"
                  value={colors.headerBorder}
                  onChange={(value) => handleColorChange('headerBorder', value)}
                />
              </div>
            )}
            <ThemePreviewSection type="header" colors={effectiveColors} />
          </div>

          {/* Main Content Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Main Content</h3>
              <label className={styles.autoToggle}>
                <input
                  type="checkbox"
                  checked={useAutoContent}
                  onChange={(e) => setUseAutoContent(e.target.checked)}
                />
                <span>Auto (use Main Theme)</span>
              </label>
            </div>
            {!useAutoContent && (
              <div className={styles.colorGrid}>
                <ColorPicker
                  label="Background"
                  value={colors.contentBg}
                  onChange={(value) => handleColorChange('contentBg', value)}
                />
                <ColorPicker
                  label="Text"
                  value={colors.contentText}
                  onChange={(value) => handleColorChange('contentText', value)}
                />
                <ColorPicker
                  label="Secondary Text"
                  value={colors.contentTextSecondary}
                  onChange={(value) => handleColorChange('contentTextSecondary', value)}
                />
                <ColorPicker
                  label="Button Color"
                  value={colors.contentButton}
                  onChange={(value) => handleColorChange('contentButton', value)}
                />
              </div>
            )}
            <ThemePreviewSection type="content" colors={effectiveColors} />
          </div>
        </div>

        {/* Live Preview */}
        <div className={styles.preview}>
          <h3 className={styles.previewTitle}>Live Preview</h3>
          <ThemePreviewSection type="full" colors={effectiveColors} />
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
        <button className={styles.saveButton} onClick={handleSave}>
          Save Theme
        </button>
      </div>
    </div>
  )
}

