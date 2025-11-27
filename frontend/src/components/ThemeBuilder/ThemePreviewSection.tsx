import { ThemeColors } from '@/types/theme'
import styles from './ThemePreviewSection.module.css'

interface ThemePreviewSectionProps {
  type: 'sidebar' | 'header' | 'content' | 'full'
  colors: ThemeColors
}

export function ThemePreviewSection({ type, colors }: ThemePreviewSectionProps) {
  if (type === 'sidebar') {
    return (
      <div className={styles.previewContainer}>
        <div className={styles.sidebarPreview} style={{ backgroundColor: colors.sidebarBg, borderColor: colors.sidebarBorder }}>
          <div className={styles.sidebarItem} style={{ color: colors.sidebarText }}>
            <div className={styles.sidebarIcon} style={{ backgroundColor: colors.sidebarIcon }}></div>
            <div className={styles.sidebarText} style={{ backgroundColor: colors.sidebarText }}></div>
          </div>
          <div className={`${styles.sidebarItem} ${styles.active}`} style={{ 
            backgroundColor: colors.sidebarActive + '20',
            color: colors.sidebarActive 
          }}>
            <div className={styles.sidebarIcon} style={{ backgroundColor: colors.sidebarActive }}></div>
            <div className={styles.sidebarText} style={{ backgroundColor: colors.sidebarActive }}></div>
          </div>
          <div className={styles.sidebarItem} style={{ color: colors.sidebarText }}>
            <div className={styles.sidebarIcon} style={{ backgroundColor: colors.sidebarIcon }}></div>
            <div className={styles.sidebarText} style={{ backgroundColor: colors.sidebarText }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'header') {
    return (
      <div className={styles.previewContainer}>
        <div className={styles.headerPreview} style={{ backgroundColor: colors.headerBg, borderBottomColor: colors.headerBorder }}>
          <div className={styles.headerTitle}>
            <div className={styles.headerIcon} style={{ backgroundColor: colors.headerTitleIcon }}></div>
            <div className={styles.headerTitleText} style={{ backgroundColor: colors.headerTitleText }}></div>
          </div>
          <div className={styles.headerUser}>
            <div className={styles.headerAvatar} style={{ backgroundColor: colors.headerAvatarBg }}></div>
            <div className={styles.headerUserName} style={{ backgroundColor: colors.headerUserName }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'content') {
    return (
      <div className={styles.previewContainer}>
        <div className={styles.contentPreview} style={{ backgroundColor: colors.contentBg }}>
          <div className={styles.contentCard} style={{ backgroundColor: colors.panel }}>
            <div className={styles.contentTitle} style={{ backgroundColor: colors.contentText }}></div>
            <div className={styles.contentText} style={{ backgroundColor: colors.contentTextSecondary }}></div>
            <div className={styles.contentButton} style={{ backgroundColor: colors.contentButton }}></div>
          </div>
        </div>
      </div>
    )
  }

  // Full preview
  return (
    <div className={styles.fullPreview}>
      <div className={styles.fullSidebar} style={{ backgroundColor: colors.sidebarBg, borderRightColor: colors.sidebarBorder }}>
        <div className={styles.fullSidebarItem} style={{ color: colors.sidebarText }}>
          <div className={styles.fullSidebarIcon} style={{ backgroundColor: colors.sidebarIcon }}></div>
        </div>
        <div className={`${styles.fullSidebarItem} ${styles.active}`} style={{ 
          backgroundColor: colors.sidebarActive + '20',
          color: colors.sidebarActive 
        }}>
          <div className={styles.fullSidebarIcon} style={{ backgroundColor: colors.sidebarActive }}></div>
        </div>
      </div>
      <div className={styles.fullMain}>
        <div className={styles.fullHeader} style={{ backgroundColor: colors.headerBg, borderBottomColor: colors.headerBorder }}>
          <div className={styles.fullHeaderTitle}>
            <div className={styles.fullHeaderIcon} style={{ backgroundColor: colors.headerTitleIcon }}></div>
            <div className={styles.fullHeaderText} style={{ backgroundColor: colors.headerTitleText }}></div>
          </div>
          <div className={styles.fullHeaderUser}>
            <div className={styles.fullHeaderAvatar} style={{ backgroundColor: colors.headerAvatarBg }}></div>
          </div>
        </div>
        <div className={styles.fullContent} style={{ backgroundColor: colors.contentBg }}>
          <div className={styles.fullContentCard} style={{ backgroundColor: colors.panel }}>
            <div className={styles.fullContentTitle} style={{ backgroundColor: colors.contentText }}></div>
            <div className={styles.fullContentText} style={{ backgroundColor: colors.contentTextSecondary }}></div>
            <div className={styles.fullContentButton} style={{ backgroundColor: colors.contentButton }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

