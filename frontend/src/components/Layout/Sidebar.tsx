import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'

const navigation = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/ai', label: 'AI Assistant', icon: '🤖' },
  { path: '/modules', label: 'Modules', icon: '🧩' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <h1>OneApp</h1>
      </div>
      <nav className={styles.nav}>
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

