import { IconEdit, IconTrash, IconPlay, IconEye, IconDatabase, IconMoreVertical } from '@/components/Icons'
import { useState, useRef, useEffect } from 'react'
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
  onViewDetail?: (agent: Agent) => void
  onRename?: (agent: Agent) => void
}

export function AIAgentCard({
  agent,
  onEdit,
  onDelete,
  onToggle,
  onViewMemory,
  onTestConnection,
  onViewDetail,
  onRename,
}: AIAgentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setMenuOpen(!menuOpen)
  }

  const getModelDisplay = (model: string): string => {
    if (model.toLowerCase().includes('gemini')) {
      const match = model.match(/(\d+)/)
      return match ? `Gemini ${match[1]}` : 'Gemini'
    }
    if (model.toLowerCase().includes('gpt')) {
      const match = model.match(/(\d+)/)
      return match ? `GPT-${match[1]}` : 'GPT'
    }
    return model
  }

  return (
    <div className={styles.agentCard} onClick={() => onViewDetail?.(agent)}>
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
              <span className={styles.modelBadge}>{getModelDisplay(agent.model)}</span>
              <span className={`${styles.statusBadge} ${agent.is_active ? styles.active : styles.inactive}`}>
                {agent.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.cardActions}>
          <button
            className={styles.menuButton}
            onClick={handleMenuClick}
            aria-label="More options"
          >
            <IconMoreVertical />
          </button>
          {menuOpen && (
            <div ref={menuRef} className={styles.menu}>
              {onViewDetail && (
                <button className={styles.menuItem} onClick={(e) => { e.stopPropagation(); onViewDetail(agent); setMenuOpen(false); }}>
                  <IconEye />
                  <span>View detail</span>
                </button>
              )}
              {onRename && (
                <button className={styles.menuItem} onClick={(e) => { e.stopPropagation(); onRename(agent); setMenuOpen(false); }}>
                  <IconEdit />
                  <span>Rename</span>
                </button>
              )}
              <button className={styles.menuItem} onClick={(e) => { e.stopPropagation(); onToggle(agent); setMenuOpen(false); }}>
                <span>{agent.is_active ? 'Deactivate' : 'Activate'}</span>
              </button>
              {!agent.is_default && (
                <button className={`${styles.menuItem} ${styles.deleteItem}`} onClick={(e) => { e.stopPropagation(); onDelete(agent.id); setMenuOpen(false); }}>
                  <IconTrash />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {agent.description && (
        <p className={styles.description} title={agent.description}>
          {agent.description.length > 100 
            ? agent.description.slice(0, 100) + '...' 
            : agent.description}
        </p>
      )}
    </div>
  )
}

