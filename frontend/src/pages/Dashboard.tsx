import styles from './Dashboard.module.css'

export function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome to OneApp</h1>
        <p className={styles.subtitle}>Your personal software ecosystem</p>
      </div>
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>📊</div>
          <h3>Quick Stats</h3>
          <p>Overview of your OneApp usage and activity</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>🔄</div>
          <h3>Recent Activity</h3>
          <p>Your recent actions and updates</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>🧩</div>
          <h3>Modules</h3>
          <p>Manage and configure your modules</p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>🤖</div>
          <h3>AI Assistant</h3>
          <p>Get help from your AI assistant</p>
        </div>
      </div>
    </div>
  )
}

