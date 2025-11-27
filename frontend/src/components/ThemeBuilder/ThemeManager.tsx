import { useState, useEffect } from 'react'
import { CustomTheme } from '@/types/theme'
import { ThemeBuilder } from './ThemeBuilder'
import { ThemePreview } from '../ThemePreview'
import styles from './ThemeManager.module.css'

interface ThemeManagerProps {
  onSelectTheme: (theme: CustomTheme) => void
  onApplyTheme: (theme: CustomTheme) => void
  onDeleteTheme: (themeId: string) => void
}

export function ThemeManager({ onSelectTheme, onApplyTheme, onDeleteTheme }: ThemeManagerProps) {
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>([])
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingTheme, setEditingTheme] = useState<CustomTheme | null>(null)

  useEffect(() => {
    loadCustomThemes()
  }, [])

  const loadCustomThemes = () => {
    try {
      const stored = localStorage.getItem('oneapp_custom_themes')
      if (stored) {
        const themes = JSON.parse(stored) as CustomTheme[]
        setCustomThemes(themes)
      }
    } catch (error) {
      console.error('Failed to load custom themes:', error)
    }
  }

  const saveCustomThemes = (themes: CustomTheme[]) => {
    try {
      localStorage.setItem('oneapp_custom_themes', JSON.stringify(themes))
      setCustomThemes(themes)
    } catch (error) {
      console.error('Failed to save custom themes:', error)
    }
  }

  const handleCreate = () => {
    setEditingTheme(null)
    setShowBuilder(true)
  }

  const handleEdit = (theme: CustomTheme) => {
    setEditingTheme(theme)
    setShowBuilder(true)
  }

  const handleDelete = (themeId: string) => {
    if (confirm('Are you sure you want to delete this theme?')) {
      const updated = customThemes.filter(t => t.id !== themeId)
      saveCustomThemes(updated)
      onDeleteTheme(themeId)
    }
  }

  const handleSave = (theme: CustomTheme) => {
    const existingIndex = customThemes.findIndex(t => t.id === theme.id)
    let updated: CustomTheme[]
    
    if (existingIndex >= 0) {
      // Update existing
      updated = [...customThemes]
      updated[existingIndex] = theme
    } else {
      // Add new
      updated = [...customThemes, theme]
    }
    
    saveCustomThemes(updated)
    setShowBuilder(false)
    setEditingTheme(null)
  }

  const handleCancel = () => {
    setShowBuilder(false)
    setEditingTheme(null)
  }

  if (showBuilder) {
    return (
      <ThemeBuilder
        theme={editingTheme}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <div className={styles.manager}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Custom Themes</h2>
        <button className={styles.createButton} onClick={handleCreate}>
          + Create New Theme
        </button>
      </div>

      {customThemes.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>No custom themes yet.</p>
          <p className={styles.emptySubtext}>Create your first custom theme to get started!</p>
          <button className={styles.createButton} onClick={handleCreate}>
            Create Your First Theme
          </button>
        </div>
      ) : (
        <div className={styles.themeList}>
          {customThemes.map((theme) => (
            <div key={theme.id} className={styles.themeCard}>
              <div className={styles.themePreview}>
                <ThemePreview 
                  theme={theme} 
                  onClick={() => onSelectTheme(theme)}
                />
              </div>
              <div className={styles.themeActions}>
                <button
                  className={`${styles.actionButton} ${styles.applyButton}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onApplyTheme(theme)
                  }}
                >
                  Apply
                </button>
                <button
                  className={styles.actionButton}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEdit(theme)
                  }}
                >
                  Edit
                </button>
                <button
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(theme.id)
                  }}
                >
                  Delete
                </button>
              </div>
              <div className={styles.themeInfo}>
                <h3 className={styles.themeName}>{theme.name}</h3>
                <p className={styles.themeDate}>
                  Updated: {new Date(theme.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

