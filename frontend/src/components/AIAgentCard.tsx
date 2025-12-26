import { IconEdit, IconTrash, IconPlay, IconEye, IconDatabase } from '@/components/Icons'
import styles from './AIAgentCard.module.css'

interface Agent {
  id: string
  name: string
  avatar_url?: string
  model: string
  is_active: boolean
  is_default: boolean
  memory_enabled: boolean
  memory_size_bytes: number
  memory_token_estimate: number
  description?: string
}

interface AIAgentCardProps {
  agent: Agent
  onEdit: (agent: Agent) => void
  onDelete: (id: string) => void
  onToggle: (agent: Agent) => void
  onViewMemory: (agent: Agent) => void
  onTestConnection?: (id: string) => void
}

export function AIAgentCard({
  agent,
  onEdit,
  onDelete,
  onToggle,
  onViewMemory,
  onTestConnection,
}: AIAgentCardProps) {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatTokens = (tokens: number): string => {
    if (tokens < 1000) return `${tokens} tokens`
    return `${(tokens / 1000).toFixed(1)}k tokens`
  }

  return (
    <div className={styles.agentCard}>
      <div className={styles.cardHeader}>
        <div className={styles.agentInfo}>
          {agent.avatar_url ? (
            <img src={agent.avatar_url} alt={agent.name} className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>{agent.name.charAt(0)}</div>
          )}
          <div className={styles.agentDetails}>
            <h3 className={styles.agentName}>{agent.name}</h3>
            <div className={styles.agentMeta}>
              <span className={styles.modelBadge}>{agent.model}</span>
              {agent.is_default && <span className={styles.defaultBadge}>Default</span>}
            </div>
          </div>
        </div>
        <div className={styles.cardActions}>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={agent.is_active}
              onChange={() => onToggle(agent)}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
      </div>

      {agent.description && (
        <p className={styles.description}>{agent.description}</p>
      )}

      <div className={styles.cardFooter}>
        <div className={styles.memoryInfo}>
          <IconDatabase className={styles.memoryIcon} />
          <div className={styles.memoryDetails}>
            <span className={styles.memorySize}>{formatBytes(agent.memory_size_bytes)}</span>
            <span className={styles.memoryTokens}>{formatTokens(agent.memory_token_estimate)}</span>
          </div>
        </div>
        <div className={styles.actionButtons}>
          <button
            className={styles.actionButton}
            onClick={() => onViewMemory(agent)}
            title="View Memory"
          >
            <IconEye />
          </button>
          {onTestConnection && (
            <button
              className={styles.actionButton}
              onClick={() => onTestConnection(agent.id)}
              title="Test Connection"
            >
              <IconPlay />
            </button>
          )}
          <button
            className={styles.actionButton}
            onClick={() => onEdit(agent)}
            title="Edit"
          >
            <IconEdit />
          </button>
          {!agent.is_default && (
            <button
              className={styles.actionButton}
              onClick={() => onDelete(agent.id)}
              title="Delete"
            >
              <IconTrash />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

