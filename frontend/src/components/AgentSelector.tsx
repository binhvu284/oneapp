import { useState, useEffect } from 'react'
import api from '@/services/api'
import { IconChevronDown, IconCheckCircle } from '@/components/Icons'
import styles from './AgentSelector.module.css'

interface Agent {
  id: string
  name: string
  avatar_url?: string
  model: string
  is_active: boolean
  is_default: boolean
}

interface AgentSelectorProps {
  selectedAgentId?: string
  onSelect: (agentId: string) => void
  className?: string
}

export function AgentSelector({ selectedAgentId, onSelect, className }: AgentSelectorProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const response = await api.get('/ai-agents?active=true')
      if (response.data.success) {
        setAgents(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedAgent = agents.find((a) => a.id === selectedAgentId)

  return (
    <div className={`${styles.agentSelector} ${className || ''}`}>
      <button
        className={styles.selectorButton}
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || agents.length === 0}
      >
        {selectedAgent ? (
          <>
            {selectedAgent.avatar_url ? (
              <img src={selectedAgent.avatar_url} alt={selectedAgent.name} className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>{selectedAgent.name.charAt(0)}</div>
            )}
            <span className={styles.agentName}>{selectedAgent.name}</span>
            <span className={styles.modelBadge}>{selectedAgent.model}</span>
          </>
        ) : (
          <span className={styles.placeholder}>Select an agent...</span>
        )}
        <IconChevronDown className={styles.chevron} />
      </button>

      {isOpen && agents.length > 0 && (
        <>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <div className={styles.dropdown}>
            {agents.map((agent) => (
              <button
                key={agent.id}
                className={`${styles.option} ${selectedAgentId === agent.id ? styles.selected : ''}`}
                onClick={() => {
                  onSelect(agent.id)
                  setIsOpen(false)
                }}
              >
                {agent.avatar_url ? (
                  <img src={agent.avatar_url} alt={agent.name} className={styles.optionAvatar} />
                ) : (
                  <div className={styles.optionAvatarPlaceholder}>{agent.name.charAt(0)}</div>
                )}
                <div className={styles.optionInfo}>
                  <div className={styles.optionName}>{agent.name}</div>
                  <div className={styles.optionModel}>{agent.model}</div>
                </div>
                {selectedAgentId === agent.id && (
                  <IconCheckCircle className={styles.checkIcon} />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

