import { IconSettings, IconUser, IconSystemAdmin, IconAnalytics } from '@/components/Icons'
import styles from './SystemAdmin.module.css'

export function SystemAdmin() {
  return (
    <div className={styles.systemAdmin}>
      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.iconWrapper}>
              <IconSettings />
            </div>
            <div className={styles.sectionContent}>
              <h2>System Configuration</h2>
              <p className={styles.description}>
                Configure system-wide settings and preferences.
              </p>
            </div>
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.iconWrapper}>
              <IconUser />
            </div>
            <div className={styles.sectionContent}>
              <h2>User Management</h2>
              <p className={styles.description}>
                Manage users, roles, and permissions.
              </p>
            </div>
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.iconWrapper}>
              <IconSystemAdmin />
            </div>
            <div className={styles.sectionContent}>
              <h2>Security Settings</h2>
              <p className={styles.description}>
                Configure security policies and access controls.
              </p>
            </div>
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.iconWrapper}>
              <IconAnalytics />
            </div>
            <div className={styles.sectionContent}>
              <h2>System Logs</h2>
              <p className={styles.description}>
                View and manage system logs and audit trails.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

