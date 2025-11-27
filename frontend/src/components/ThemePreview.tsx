import { ThemeTemplate, CustomTheme } from '@/types/theme'
import styles from './ThemePreview.module.css'

interface ThemePreviewProps {
  theme: ThemeTemplate | CustomTheme
  isActive?: boolean
  onClick?: () => void
  onApply?: () => void
  onDetail?: () => void
  showActions?: boolean
}

export function ThemePreview({ theme, isActive, onClick, onApply, onDetail, showActions }: ThemePreviewProps) {
  const applyPreviewStyles = () => {
    const root = document.documentElement
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--preview-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value)
    })
  }

  const handlePreviewClick = (e: React.MouseEvent) => {
    // Don't trigger onClick if clicking on action buttons
    if ((e.target as HTMLElement).closest(`.${styles.previewActions}`)) {
      return
    }
    onClick?.()
  }

  return (
    <div 
      className={`${styles.preview} ${isActive ? styles.active : ''}`}
      onClick={handlePreviewClick}
      onMouseEnter={applyPreviewStyles}
    >
      <div className={styles.previewContainer}>
        <div className={styles.previewSidebar} style={{ backgroundColor: theme.colors.sidebarBg }}>
          <div className={styles.previewSidebarItem} style={{ color: theme.colors.sidebarText }}></div>
          <div className={styles.previewSidebarItem} style={{ color: theme.colors.sidebarText }}></div>
          <div 
            className={`${styles.previewSidebarItem} ${styles.active}`} 
            style={{ 
              backgroundColor: theme.colors.sidebarActive + '20',
              color: theme.colors.sidebarActive 
            }}
          ></div>
        </div>
        <div className={styles.previewMain}>
          <div className={styles.previewHeader} style={{ backgroundColor: theme.colors.headerBg }}>
            <div className={styles.previewHeaderBar} style={{ backgroundColor: theme.colors.primary }}></div>
          </div>
          <div className={styles.previewContent} style={{ backgroundColor: theme.colors.contentBg }}>
            <div className={styles.previewCard} style={{ backgroundColor: theme.colors.panel }}>
              <div className={styles.previewCardLine} style={{ backgroundColor: theme.colors.textSecondary }}></div>
              <div className={styles.previewCardLine} style={{ backgroundColor: theme.colors.textSecondary }}></div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.previewInfo}>
        <h3 className={styles.previewName}>{theme.name}</h3>
        <p className={styles.previewDescription}>{theme.description}</p>
        {showActions && (
          <div className={styles.previewActions}>
            {onApply && (
              <button
                className={`${styles.previewActionButton} ${styles.applyButton}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onApply()
                }}
              >
                Apply
              </button>
            )}
            {onDetail && (
              <button
                className={styles.previewActionButton}
                onClick={(e) => {
                  e.stopPropagation()
                  onDetail()
                }}
              >
                Detail
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

