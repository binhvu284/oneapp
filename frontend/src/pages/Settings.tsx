import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import styles from './Settings.module.css'

export function Settings() {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()

  return (
    <div className={styles.settings}>
      <h1>Settings</h1>
      <div className={styles.settingsGrid}>
        <div className={styles.settingSection}>
          <h2>Appearance</h2>
          <div className={styles.settingItem}>
            <label>Theme</label>
            <button onClick={toggleTheme} className={styles.themeToggle}>
              Current: {theme === 'dark' ? 'Dark' : 'Light'}
            </button>
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

