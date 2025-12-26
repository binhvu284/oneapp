import { useState, useEffect } from 'react'
import api from '@/services/api'
import { ToastContainer, type Toast } from '@/components/Toast'
import { AIAgentCard } from './AIAgentCard'
import { AIModelCard } from './AIModelCard'
import { AIAgentModal } from './AIAgentModal'
import { AgentMemoryView } from './AgentMemoryView'
import {
  IconPlus,
  IconSearch,
  IconFilter,
  IconCheckCircle,
  IconXCircle,
  IconRefreshCw,
} from '@/components/Icons'
import styles from './AIAgentManagement.module.css'

interface Agent {
  id: string
  name: string
  avatar_url?: string
  model: string
  model_provider?: string
  api_key?: string
  description?: string
  is_default: boolean
  is_active: boolean
  memory_enabled: boolean
  memory_size_bytes: number
  memory_token_estimate: number
  knowledge_files?: any[]
  metadata?: Record<string, any>
}

export function AIAgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterActive, setFilterActive] = useState<string>('all')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [showAgentModal, setShowAgentModal] = useState(false)
  const [showMemoryView, setShowMemoryView] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [viewingMemoryAgent, setViewingMemoryAgent] = useState<Agent | null>(null)
  const [testingAgentId, setTestingAgentId] = useState<string | null>(null)
  
  // State for default models (Gemini, ChatGPT)
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [chatgptApiKey, setChatgptApiKey] = useState('')
  const [testingModel, setTestingModel] = useState<'gemini' | 'chatgpt' | null>(null)

  useEffect(() => {
    fetchAgents()
  }, [])

  // Initialize default models if they don't exist
  useEffect(() => {
    if (!loading && agents.length > 0) {
      const gemini = agents.find(a => a.is_default && (a.model === 'gemini' || a.model_provider === 'google'))
      const chatgpt = agents.find(a => a.is_default && (a.model === 'chatgpt' || a.model_provider === 'openai'))
      
      if (gemini) {
        setGeminiApiKey(gemini.api_key || '')
      }
      if (chatgpt) {
        setChatgptApiKey(chatgpt.api_key || '')
      }
    }
  }, [agents, loading])

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const response = await api.get('/ai-agents')
      if (response.data.success) {
        const allAgents = response.data.data || []
        setAgents(allAgents)
        
        // Initialize default models if they don't exist
        const hasGemini = allAgents.some(a => a.is_default && (a.model === 'gemini' || a.model_provider === 'google'))
        const hasChatgpt = allAgents.some(a => a.is_default && (a.model === 'chatgpt' || a.model_provider === 'openai'))
        
        if (!hasGemini || !hasChatgpt) {
          // Create default models if they don't exist
          const defaultModels = []
          if (!hasGemini) {
            defaultModels.push({
              name: 'Gemini',
              model: 'gemini',
              model_provider: 'google',
              is_default: true,
              is_active: false,
              memory_enabled: true,
            })
          }
          if (!hasChatgpt) {
            defaultModels.push({
              name: 'ChatGPT',
              model: 'chatgpt',
              model_provider: 'openai',
              is_default: true,
              is_active: false,
              memory_enabled: true,
            })
          }
          
          // Create default models
          for (const model of defaultModels) {
            try {
              await api.post('/ai-agents', model)
            } catch (error) {
              console.error('Error creating default model:', error)
            }
          }
          
          // Refetch agents
          const refreshResponse = await api.get('/ai-agents')
          if (refreshResponse.data.success) {
            setAgents(refreshResponse.data.data || [])
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching agents:', error)
      showToast('Failed to load agents', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const closeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const handleCreateAgent = () => {
    setEditingAgent(null)
    setShowAgentModal(true)
  }

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent)
    setShowAgentModal(true)
  }

  const handleDeleteAgent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return

    try {
      const response = await api.delete(`/ai-agents/${id}`)
      if (response.data.success) {
        showToast('Agent deleted successfully', 'success')
        fetchAgents()
      }
    } catch (error: any) {
      console.error('Error deleting agent:', error)
      showToast(error.response?.data?.error || 'Failed to delete agent', 'error')
    }
  }

  const handleToggleAgent = async (agent: Agent) => {
    try {
      const response = await api.put(`/ai-agents/${agent.id}/toggle`, {
        is_active: !agent.is_active,
      })
      if (response.data.success) {
        showToast(`Agent ${!agent.is_active ? 'activated' : 'deactivated'}`, 'success')
        fetchAgents()
      }
    } catch (error: any) {
      console.error('Error toggling agent:', error)
      showToast(error.response?.data?.error || 'Failed to toggle agent', 'error')
    }
  }

  const handleTestConnection = async (id: string) => {
    setTestingAgentId(id)
    try {
      const response = await api.post(`/ai-agents/${id}/test-connection`)
      if (response.data.success) {
        if (response.data.testResult.success) {
          showToast('Connection test successful', 'success')
        } else {
          showToast(`Connection test failed: ${response.data.testResult.error}`, 'error')
        }
        fetchAgents()
      }
    } catch (error: any) {
      console.error('Error testing connection:', error)
      showToast(error.response?.data?.error || 'Failed to test connection', 'error')
    } finally {
      setTestingAgentId(null)
    }
  }

  const handleModelApiKeyChange = async (model: 'gemini' | 'chatgpt', apiKey: string) => {
    try {
      const modelAgent = agents.find(a => 
        a.is_default && (
          (model === 'gemini' && (a.model === 'gemini' || a.model_provider === 'google')) ||
          (model === 'chatgpt' && (a.model === 'chatgpt' || a.model_provider === 'openai'))
        )
      )

      if (modelAgent) {
        const response = await api.put(`/ai-agents/${modelAgent.id}/api-key`, {
          api_key: apiKey,
        })
        if (response.data.success) {
          if (model === 'gemini') {
            setGeminiApiKey(apiKey)
          } else {
            setChatgptApiKey(apiKey)
          }
          showToast('API key saved successfully', 'success')
          fetchAgents()
        }
      }
    } catch (error: any) {
      console.error('Error saving API key:', error)
      showToast(error.response?.data?.error || 'Failed to save API key', 'error')
    }
  }

  const handleModelConnect = async (model: 'gemini' | 'chatgpt') => {
    setTestingModel(model)
    try {
      const modelAgent = agents.find(a => 
        a.is_default && (
          (model === 'gemini' && (a.model === 'gemini' || a.model_provider === 'google')) ||
          (model === 'chatgpt' && (a.model === 'chatgpt' || a.model_provider === 'openai'))
        )
      )

      if (modelAgent) {
        const apiKey = model === 'gemini' ? geminiApiKey : chatgptApiKey
        
        // First save the API key
        if (apiKey) {
          await api.put(`/ai-agents/${modelAgent.id}/api-key`, {
            api_key: apiKey,
          })
        }

        // Then test connection
        const response = await api.post(`/ai-agents/${modelAgent.id}/test-connection`)
        if (response.data.success) {
          if (response.data.testResult.success) {
            showToast('Connected successfully', 'success')
            fetchAgents()
          } else {
            showToast(`Connection failed: ${response.data.testResult.error}`, 'error')
          }
        }
      }
    } catch (error: any) {
      console.error('Error connecting model:', error)
      showToast(error.response?.data?.error || 'Failed to connect', 'error')
    } finally {
      setTestingModel(null)
    }
  }

  const handleModelToggle = async (model: 'gemini' | 'chatgpt') => {
    try {
      const modelAgent = agents.find(a => 
        a.is_default && (
          (model === 'gemini' && (a.model === 'gemini' || a.model_provider === 'google')) ||
          (model === 'chatgpt' && (a.model === 'chatgpt' || a.model_provider === 'openai'))
        )
      )

      if (modelAgent) {
        await handleToggleAgent(modelAgent)
      }
    } catch (error: any) {
      console.error('Error toggling model:', error)
    }
  }

  const handleViewMemory = (agent: Agent) => {
    setViewingMemoryAgent(agent)
    setShowMemoryView(true)
  }

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.model.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && agent.is_active) ||
      (filterActive === 'inactive' && !agent.is_active) ||
      (filterActive === 'custom' && !agent.is_default)

    return matchesSearch && matchesFilter
  })

  const geminiAgent = agents.find(a => a.is_default && (a.model === 'gemini' || a.model_provider === 'google'))
  const chatgptAgent = agents.find(a => a.is_default && (a.model === 'chatgpt' || a.model_provider === 'openai'))
  const customAgents = filteredAgents.filter((a) => !a.is_default)

  return (
    <div className={styles.agentManagement}>
      <div className={styles.searchFilters}>
        <div className={styles.searchBar}>
          <IconSearch />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          className={styles.filterToggle}
          onClick={() => setShowFilters(!showFilters)}
        >
          <IconFilter />
          <span>Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Status</label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Loading agents...</div>
      ) : (
        <>
          {/* AI Models Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>AI Models</h3>
            <p className={styles.sectionDescription}>
              Configure default AI models by entering your API keys. These models can be used by custom agents.
            </p>
            <div className={styles.modelsGrid}>
              {geminiAgent && (
                <AIModelCard
                  model="gemini"
                  name="Gemini"
                  description="Google's Gemini AI model. Enter your API key to connect and use this model."
                  apiKey={geminiApiKey}
                  isConnected={geminiAgent.is_active && !!geminiAgent.api_key}
                  isActive={geminiAgent.is_active}
                  onApiKeyChange={(key) => handleModelApiKeyChange('gemini', key)}
                  onConnect={() => handleModelConnect('gemini')}
                  onToggle={() => handleModelToggle('gemini')}
                  testing={testingModel === 'gemini'}
                />
              )}
              {chatgptAgent && (
                <AIModelCard
                  model="chatgpt"
                  name="ChatGPT"
                  description="OpenAI's ChatGPT model. Enter your API key to connect and use this model."
                  apiKey={chatgptApiKey}
                  isConnected={chatgptAgent.is_active && !!chatgptAgent.api_key}
                  isActive={chatgptAgent.is_active}
                  onApiKeyChange={(key) => handleModelApiKeyChange('chatgpt', key)}
                  onConnect={() => handleModelConnect('chatgpt')}
                  onToggle={() => handleModelToggle('chatgpt')}
                  testing={testingModel === 'chatgpt'}
                />
              )}
            </div>
          </div>

          {/* Custom Agents Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Custom Agents</h3>
                <p className={styles.sectionDescription}>
                  Create custom AI agents with personalized settings, memory, and knowledge files.
                </p>
              </div>
              <button className={styles.addButton} onClick={handleCreateAgent}>
                <IconPlus />
                <span>Create Agent</span>
              </button>
            </div>

            {customAgents.length > 0 ? (
              <div className={styles.agentsGrid}>
                {customAgents.map((agent) => (
                  <AIAgentCard
                    key={agent.id}
                    agent={agent}
                    onEdit={handleEditAgent}
                    onDelete={handleDeleteAgent}
                    onToggle={handleToggleAgent}
                    onViewMemory={handleViewMemory}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <p>No custom agents found</p>
                <button className={styles.addButton} onClick={handleCreateAgent}>
                  <IconPlus />
                  <span>Create Your First Agent</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {showAgentModal && (
        <AIAgentModal
          agent={editingAgent}
          onClose={() => {
            setShowAgentModal(false)
            setEditingAgent(null)
          }}
          onSave={() => {
            setShowAgentModal(false)
            setEditingAgent(null)
            fetchAgents()
          }}
        />
      )}

      {showMemoryView && viewingMemoryAgent && (
        <AgentMemoryView
          agent={viewingMemoryAgent}
          onClose={() => {
            setShowMemoryView(false)
            setViewingMemoryAgent(null)
          }}
          onUpdate={fetchAgents}
        />
      )}

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  )
}
