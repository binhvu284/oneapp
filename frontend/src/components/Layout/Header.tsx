import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import styles from './Header.module.css'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h2>Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}</h2>
      </div>
      <div className={styles.right}>
        <button onClick={toggleTheme} className={styles.themeButton} aria-label="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className={styles.user}>
          <div className={styles.avatar}>
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}

