import styles from './Modules.module.css'

interface Module {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'pending'
  icon: string
}

const modules: Module[] = [
  {
    id: '1',
    name: 'AI Assistant',
    description: 'Personal AI assistant for task management and module control',
    status: 'active',
    icon: '🤖',
  },
  {
    id: '2',
    name: 'Storage',
    description: 'File and data storage management',
    status: 'pending',
    icon: '📦',
  },
  {
    id: '3',
    name: 'Analytics',
    description: 'Data analytics and insights',
    status: 'pending',
    icon: '📊',
  },
]

export function Modules() {
  return (
    <div className={styles.modules}>
      <h1>Modules</h1>
      <div className={styles.moduleGrid}>
        {modules.map((module) => (
          <div key={module.id} className={styles.moduleCard}>
            <div className={styles.moduleIcon}>{module.icon}</div>
            <h3>{module.name}</h3>
            <p>{module.description}</p>
            <div className={styles.moduleActions}>
              <span className={`${styles.status} ${styles[module.status]}`}>
                {module.status}
              </span>
              <button className={styles.actionButton}>
                {module.status === 'active' ? 'Configure' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

