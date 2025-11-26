import styles from './Dashboard.module.css'

export function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <h1>Dashboard</h1>
      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Quick Stats</h3>
          <p>Overview of your OneApp usage</p>
        </div>
        <div className={styles.card}>
          <h3>Recent Activity</h3>
          <p>Your recent actions and updates</p>
        </div>
        <div className={styles.card}>
          <h3>Modules</h3>
          <p>Manage your modules</p>
        </div>
        <div className={styles.card}>
          <h3>AI Assistant</h3>
          <p>Get help from your AI assistant</p>
        </div>
      </div>
    </div>
  )
}

