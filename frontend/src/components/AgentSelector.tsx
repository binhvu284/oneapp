import { useState, useEffect } from 'react'
import api from '@/services/api'
import { IconChevronDown, IconCheckCircle } from '@/components/Icons'
import geminiLogo from '@/logo/gemeni.png'
import chatgptLogo from '@/logo/ChatGPT.png'
import styles from './AgentSelector.module.css'

interface Agent {
  id: string
  name: string
  avatar_url?: string
  model: string
  model_provider?: string
  api_key?: string
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

  // Helper function to get agent logo
  const getAgentLogo = (agent: Agent) => {
    if (agent.avatar_url) {
      return agent.avatar_url
    }
    // For default models, use the correct logo
    if (agent.is_default) {
      if (agent.model === 'gemini' || agent.model_provider === 'google') {
        return geminiLogo
      }
      if (agent.model === 'chatgpt' || agent.model_provider === 'openai') {
        return chatgptLogo
      }
    }
    return null
  }

  // Helper function to get model version
  const getModelVersion = (agent: Agent): string => {
    if (agent.is_default) {
      if (agent.model === 'gemini' || agent.model_provider === 'google') {
        return agent.api_key ? 'Gemini Flash' : ''
      }
      if (agent.model === 'chatgpt' || agent.model_provider === 'openai') {
        return agent.api_key ? 'GPT-3.5 Turbo' : ''
      }
    }
    // For custom agents, show the model name
    return agent.model || ''
  }

  return (
    <div className={`${styles.agentSelector} ${className || ''}`}>
      <button
        className={styles.selectorButton}
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || agents.length === 0}
      >
        {selectedAgent ? (
          <>
            {(() => {
              const logo = getAgentLogo(selectedAgent)
              return logo ? (
                <img 
                  src={logo} 
                  alt={selectedAgent.name} 
                  className={`${styles.avatar} ${selectedAgent.is_default && (selectedAgent.model === 'chatgpt' || selectedAgent.model_provider === 'openai') ? styles.chatgptAvatar : ''}`} 
                />
              ) : (
                <div className={styles.avatarPlaceholder}>{selectedAgent.name.charAt(0)}</div>
              )
            })()}
            <span className={styles.agentName}>{selectedAgent.name}</span>
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
            {agents.map((agent) => {
              const agentLogo = getAgentLogo(agent)
              const modelVersion = getModelVersion(agent)
              return (
                <button
                  key={agent.id}
                  className={`${styles.option} ${selectedAgentId === agent.id ? styles.selected : ''}`}
                  onClick={() => {
                    onSelect(agent.id)
                    setIsOpen(false)
                  }}
                >
                  {agentLogo ? (
                    <img 
                      src={agentLogo} 
                      alt={agent.name} 
                      className={`${styles.optionAvatar} ${agent.is_default && (agent.model === 'chatgpt' || agent.model_provider === 'openai') ? styles.chatgptOptionAvatar : ''}`} 
                    />
                  ) : (
                    <div className={styles.optionAvatarPlaceholder}>{agent.name.charAt(0)}</div>
                  )}
                  <div className={styles.optionInfo}>
                    <div className={styles.optionName}>{agent.name}</div>
                    {modelVersion && (
                      <div className={styles.optionModel}>{modelVersion}</div>
                    )}
                  </div>
                  {selectedAgentId === agent.id && (
                    <IconCheckCircle className={styles.checkIcon} />
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

