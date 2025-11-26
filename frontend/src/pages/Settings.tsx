import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import styles from './Settings.module.css'

export function Settings() {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()

  return (
    <div className={styles.settings}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your OneApp preferences</p>
      </div>
      <div className={styles.settingsGrid}>
        <div className={styles.settingSection}>
          <h2>Appearance</h2>
          <div className={styles.settingItem}>
            <label>Theme</label>
            <div className={styles.themeOptions}>
              <button
                onClick={() => setTheme('light')}
                className={`${styles.themeButton} ${theme === 'light' ? styles.active : ''}`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`${styles.themeButton} ${theme === 'dark' ? styles.active : ''}`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>

        <div className={styles.settingSection}>
          <h2>Account</h2>
          <div className={styles.settingItem}>
            <label>Email</label>
            <span>{user?.email || 'Not signed in'}</span>
          </div>
          <div className={styles.settingItem}>
            <button onClick={signOut} className={styles.signOutButton}>
              Sign Out
            </button>
          </div>
        </div>

        <div className={styles.settingSection}>
          <h2>About</h2>
          <div className={styles.settingItem}>
            <p>OneApp v1.0.0</p>
            <p>Personal Software Ecosystem</p>
          </div>
        </div>
      </div>
    </div>
  )
}

