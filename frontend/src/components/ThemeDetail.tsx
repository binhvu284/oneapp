import { ThemeTemplate } from '@/types/theme'
import { ThemePreviewSection } from './ThemeBuilder/ThemePreviewSection'
import styles from './ThemeDetail.module.css'

interface ThemeDetailProps {
  theme: ThemeTemplate
  onApply: () => void
  onClose: () => void
}

export function ThemeDetail({ theme, onApply, onClose }: ThemeDetailProps) {
  const colorGroups = [
    {
      title: 'Main Theme',
      colors: [
        { label: 'Main Theme Color', key: 'primary' },
        { label: 'Secondary Theme Color', key: 'primaryDark' },
        { label: 'Main Text Color', key: 'text' },
        { label: 'Secondary Text Color', key: 'textSecondary' },
        { label: 'Background', key: 'bg' },
        { label: 'Panel Background', key: 'panel' },
      ],
    },
    {
      title: 'Sidebar',
      colors: [
        { label: 'Background', key: 'sidebarBg' },
        { label: 'Text', key: 'sidebarText' },
        { label: 'Icon', key: 'sidebarIcon' },
        { label: 'Border', key: 'sidebarBorder' },
        { label: 'Active Item', key: 'sidebarActive' },
      ],
    },
    {
      title: 'Header',
      colors: [
        { label: 'Background', key: 'headerBg' },
        { label: 'Title Text', key: 'headerTitleText' },
        { label: 'Title Icon', key: 'headerTitleIcon' },
        { label: 'Avatar Background', key: 'headerAvatarBg' },
        { label: 'User Name', key: 'headerUserName' },
        { label: 'Border', key: 'headerBorder' },
      ],
    },
    {
      title: 'Main Content',
      colors: [
        { label: 'Background', key: 'contentBg' },
        { label: 'Text', key: 'contentText' },
        { label: 'Secondary Text', key: 'contentTextSecondary' },
        { label: 'Button Color', key: 'contentButton' },
      ],
    },
  ]

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{theme.name} Theme</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className={styles.content}>
          <p className={styles.description}>{theme.description}</p>
          <div className={styles.colorGroups}>
            {colorGroups.map((group) => (
              <div key={group.title} className={styles.colorGroup}>
                <h3 className={styles.groupTitle}>{group.title}</h3>
                <div className={styles.colorList}>
                  {group.colors.map((color) => {
                    const colorValue = theme.colors[color.key as keyof typeof theme.colors]
                    return (
                      <div key={color.key} className={styles.colorItem}>
                        <div className={styles.colorLabel}>{color.label}</div>
                        <div className={styles.colorValue}>
                          <div
                            className={styles.colorSwatch}
                            style={{ backgroundColor: colorValue }}
                          />
                          <code className={styles.colorCode}>{colorValue}</code>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {group.title === 'Sidebar' && (
                  <div className={styles.previewSection}>
                    <ThemePreviewSection type="sidebar" colors={theme.colors} />
                  </div>
                )}
                {group.title === 'Header' && (
                  <div className={styles.previewSection}>
                    <ThemePreviewSection type="header" colors={theme.colors} />
                  </div>
                )}
                {group.title === 'Main Content' && (
                  <div className={styles.previewSection}>
                    <ThemePreviewSection type="content" colors={theme.colors} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className={styles.fullPreviewSection}>
            <h3 className={styles.previewTitle}>Full Preview</h3>
            <ThemePreviewSection type="full" colors={theme.colors} />
          </div>
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.applyButton} onClick={onApply}>
            Apply Theme
          </button>
        </div>
      </div>
    </div>
  )
}

