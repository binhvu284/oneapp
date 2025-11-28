import { useNavigate } from 'react-router-dom'
import { IconTheme, IconLayout, IconDisplay, IconNavigation } from '@/components/Icons'
import styles from './Interface.module.css'

export function Interface() {
  const navigate = useNavigate()

  return (
    <div className={styles.interface}>
      <div className={styles.content}>
        <div className={`${styles.section} ${styles.clickable}`} onClick={() => navigate('/customization/interface/theme')}>
          <div className={styles.sectionHeader}>
            <div className={styles.iconWrapper}>
              <IconTheme />
            </div>
            <div className={styles.sectionContent}>
              <h2>Theme Settings</h2>
              <p className={styles.description}>
                Choose between light and dark themes, or customize colors to match your style.
              </p>
            </div>
          </div>
        </div>
        <div className={`${styles.section} ${styles.clickable}`} onClick={() => navigate('/customization/interface/layout')}>
          <div className={styles.sectionHeader}>
            <div className={styles.iconWrapper}>
              <IconLayout />
            </div>
            <div className={styles.sectionContent}>
              <h2>Layout Options</h2>
              <p className={styles.description}>
                Customize sidebar width, content density, and component spacing to optimize your workspace.
              </p>
            </div>
          </div>
        </div>
        <div className={`${styles.section} ${styles.clickable}`} onClick={() => navigate('/customization/interface/display')}>
          <div className={styles.sectionHeader}>
            <div className={styles.iconWrapper}>
              <IconDisplay />
            </div>
            <div className={styles.sectionContent}>
              <h2>Display Settings</h2>
              <p className={styles.description}>
                Adjust font sizes, icon sizes, and visual effects to improve readability and reduce eye strain.
              </p>
            </div>
          </div>
        </div>
        <div className={`${styles.section} ${styles.clickable}`} onClick={() => navigate('/customization/interface/sidebar')}>
          <div className={styles.sectionHeader}>
            <div className={styles.iconWrapper}>
              <IconNavigation />
            </div>
            <div className={styles.sectionContent}>
              <h2>Sidebar Setting</h2>
              <p className={styles.description}>
                Configure sidebar navigation items and create custom sections to organize your workspace.
              </p>
            </div>
          </div>
        </div>
        <div className={`${styles.section} ${styles.clickable}`} onClick={() => navigate('/customization/interface/header')}>
          <div className={styles.sectionHeader}>
            <div className={styles.iconWrapper}>
              <IconNavigation />
            </div>
            <div className={styles.sectionContent}>
              <h2>Header Setting</h2>
              <p className={styles.description}>
                Configure header navigation items and customize header appearance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

