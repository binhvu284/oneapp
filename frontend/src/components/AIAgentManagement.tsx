import { useState, useEffect } from 'react'
import api from '@/services/api'
import { ToastContainer, type Toast } from '@/components/Toast'
import { AIAgentCard } from './AIAgentCard'
import { AIModelCard } from './AIModelCard'
import { AIAgentModal } from './AIAgentModal'
import { AgentMemoryView } from './AgentMemoryView'
import {
  IconPlus,
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
  const [toasts, setToasts] = useState<Toast[]>([])
  const [showAgentModal, setShowAgentModal] = useState(false)
  const [showMemoryView, setShowMemoryView] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [viewingMemoryAgent, setViewingMemoryAgent] = useState<Agent | null>(null)
  const [viewingAgent, setViewingAgent] = useState<Agent | null>(null)
  const [renamingAgent, setRenamingAgent] = useState<Agent | null>(null)
  
  // State for default models (Gemini, ChatGPT)
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [chatgptApiKey, setChatgptApiKey] = useState('')
  const [testingModel, setTestingModel] = useState<'gemini' | 'chatgpt' | null>(null)

  useEffect(() => {
    fetchAgents()
  }, [])

  // Initialize default models API keys from database - ensures persistence after reload
  useEffect(() => {
    if (!loading) {
      const gemini = agents.find(a => a.is_default && (a.model === 'gemini' || a.model_provider === 'google'))
      const chatgpt = agents.find(a => a.is_default && (a.model === 'chatgpt' || a.model_provider === 'openai'))
      
      // Always sync API keys from database to ensure persistence
      setGeminiApiKey(gemini?.api_key || '')
      setChatgptApiKey(chatgpt?.api_key || '')
    }
  }, [agents, loading])

  const fetchAgents = async () => {
    setLoading(true)
    try {
      const response = await api.get('/ai-agents')
      if (response.data.success) {
        const allAgents = response.data.data || []
        // Preserve sample agents when updating from API
        setAgents((prev) => {
          const sampleAgents = prev.filter((a) => a.id.startsWith('sample-'))
          return [...allAgents, ...sampleAgents]
        })
        
        // Initialize default models if they don't exist
        const hasGemini = allAgents.some((a: Agent) => a.is_default && (a.model === 'gemini' || a.model_provider === 'google'))
        const hasChatgpt = allAgents.some((a: Agent) => a.is_default && (a.model === 'chatgpt' || a.model_provider === 'openai'))
        
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
              memory_enabled: false, // Default models don't store memory
            })
          }
          if (!hasChatgpt) {
            defaultModels.push({
              name: 'ChatGPT',
              model: 'chatgpt',
              model_provider: 'openai',
              is_default: true,
              is_active: false,
              memory_enabled: false, // Default models don't store memory
            })
          }
          
          // Create default models (only if API is working)
          let modelsCreated = false
          for (const model of defaultModels) {
            try {
              await api.post('/ai-agents', model)
              modelsCreated = true
            } catch (error: any) {
              console.error('Error creating default model:', error)
              // Don't refetch if model creation fails - likely API issue
              break
            }
          }
          
          // Only refetch if models were successfully created
          if (modelsCreated) {
            try {
              const refreshResponse = await api.get('/ai-agents')
              if (refreshResponse.data.success) {
                const refreshedAgents = refreshResponse.data.data || []
                setAgents((prev) => {
                  const sampleAgents = prev.filter((a) => a.id.startsWith('sample-'))
                  return [...refreshedAgents, ...sampleAgents]
                })
              }
            } catch (error) {
              console.error('Error refetching agents:', error)
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching agents:', error)
      showToast('Failed to load agents', 'error')
      // On error, preserve sample agents if they exist
      setAgents((prev) => prev.filter((a) => a.id.startsWith('sample-')))
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

    // Handle sample agents (UI only)
    if (id.startsWith('sample-')) {
      setAgents((prev) => prev.filter((a) => a.id !== id))
      showToast('Agent deleted successfully', 'success')
      return
    }

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


  const handleModelApiKeyChange = async (model: 'gemini' | 'chatgpt', apiKey: string): Promise<void> => {
    // #region debug log
    fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIAgentManagement.tsx:202',message:'handleModelApiKeyChange called',data:{model,apiKeyLength:apiKey.length,agentsCount:agents.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    try {
      let modelAgent = agents.find(a => 
        a.is_default && (
          (model === 'gemini' && (a.model === 'gemini' || a.model_provider === 'google')) ||
          (model === 'chatgpt' && (a.model === 'chatgpt' || a.model_provider === 'openai'))
        )
      )

      // #region debug log
      fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIAgentManagement.tsx:212',message:'Model agent lookup',data:{found:!!modelAgent,modelAgentId:modelAgent?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion

      // If model agent doesn't exist, create it first
      if (!modelAgent) {
        // #region debug log
        fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIAgentManagement.tsx:217',message:'Creating default model agent',data:{model},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        try {
          const createData = {
            name: model === 'gemini' ? 'Gemini' : 'ChatGPT',
            model: model === 'gemini' ? 'gemini' : 'chatgpt',
            model_provider: model === 'gemini' ? 'google' : 'openai',
            is_default: true,
            is_active: false,
            memory_enabled: false, // Default models don't store memory - they use external APIs directly
          }
          
          const createResponse = await api.post('/ai-agents', createData)
          // #region debug log
          fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIAgentManagement.tsx:230',message:'Default model agent created',data:{success:createResponse.data?.success,agentId:createResponse.data?.data?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
          // #endregion
          
          if (createResponse.data.success) {
            modelAgent = createResponse.data.data
            // Refresh agents list
            await fetchAgents()
          } else {
            throw new Error('Failed to create default model agent')
          }
        } catch (createError: any) {
          // #region debug log
          fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIAgentManagement.tsx:240',message:'Error creating default model agent',data:{error:createError?.message,status:createError?.response?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
          // #endregion
          throw new Error(`Failed to create ${model} agent: ${createError.response?.data?.error || createError.message}`)
        }
      }

      if (!modelAgent || !modelAgent.id) {
        throw new Error('Model agent not found or invalid')
      }

      // #region debug log
      fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIAgentManagement.tsx:247',message:'Saving API key',data:{agentId:modelAgent.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion

      const response = await api.put(`/ai-agents/${modelAgent.id}/api-key`, {
        api_key: apiKey.trim(),
      })
      
      // #region debug log
      fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIAgentManagement.tsx:252',message:'API key save response',data:{success:response.data?.success},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      
      if (response.data.success) {
        if (model === 'gemini') {
          setGeminiApiKey(apiKey.trim())
        } else {
          setChatgptApiKey(apiKey.trim())
        }
        // Refresh agents to get updated state
        await fetchAgents()
      } else {
        throw new Error('Failed to save API key')
      }
    } catch (error: any) {
      // #region debug log
      fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AIAgentManagement.tsx:265',message:'handleModelApiKeyChange error',data:{error:error?.message,status:error?.response?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      console.error('Error saving API key:', error)
      throw error // Re-throw so caller can handle it
    }
  }

  const handleModelConnect = async (model: 'gemini' | 'chatgpt', apiKeyOverride?: string) => {
    setTestingModel(model)
    try {
      // Use provided API key or get from state
      const currentApiKey = apiKeyOverride || (model === 'gemini' ? geminiApiKey : chatgptApiKey)
      
      if (!currentApiKey || !currentApiKey.trim()) {
        showToast('Please enter an API key first', 'error')
        setTestingModel(null)
        return
      }

      // Refresh agents to ensure we have the latest data
      await fetchAgents()
      
      let modelAgent = agents.find(a => 
        a.is_default && (
          (model === 'gemini' && (a.model === 'gemini' || a.model_provider === 'google')) ||
          (model === 'chatgpt' && (a.model === 'chatgpt' || a.model_provider === 'openai'))
        )
      )

      // If model agent doesn't exist, create it first
      // IMPORTANT: Default models should have memory_enabled=false (they don't store memory)
      if (!modelAgent) {
        try {
          const createData = {
            name: model === 'gemini' ? 'Gemini' : 'ChatGPT',
            model: model === 'gemini' ? 'gemini' : 'chatgpt',
            model_provider: model === 'gemini' ? 'google' : 'openai',
            is_default: true,
            is_active: false,
            memory_enabled: false, // Default models don't store memory - they use external APIs directly
          }
          
          const createResponse = await api.post('/ai-agents', createData)
          if (createResponse.data.success) {
            modelAgent = createResponse.data.data
            await fetchAgents()
          } else {
            throw new Error('Failed to create default model agent')
          }
        } catch (createError: any) {
          // Check if error is due to duplicate (unique constraint violation)
          if (createError.response?.status === 409 || createError.message?.includes('duplicate') || createError.message?.includes('unique')) {
            // Try to fetch the existing agent
            await fetchAgents()
            modelAgent = agents.find(a => 
              a.is_default && (
                (model === 'gemini' && (a.model === 'gemini' || a.model_provider === 'google')) ||
                (model === 'chatgpt' && (a.model === 'chatgpt' || a.model_provider === 'openai'))
              )
            )
            if (!modelAgent) {
              showToast(`Default ${model} model already exists. Please refresh the page.`, 'error')
              setTestingModel(null)
              return
            }
          } else {
            console.error('Error creating default model agent:', createError)
            showToast(`Failed to create ${model} agent: ${createError.response?.data?.error || createError.message}`, 'error')
            setTestingModel(null)
            return
          }
        }
      }

      if (!modelAgent || !modelAgent.id) {
        showToast('Model agent not found. Please refresh the page.', 'error')
        setTestingModel(null)
        return
      }

      // Ensure API key is saved to backend
      try {
        await api.put(`/ai-agents/${modelAgent.id}/api-key`, {
          api_key: currentApiKey.trim(),
        })
        // Update state
        if (model === 'gemini') {
          setGeminiApiKey(currentApiKey.trim())
        } else {
          setChatgptApiKey(currentApiKey.trim())
        }
      } catch (saveError: any) {
        console.error('Error saving API key:', saveError)
        showToast(saveError.response?.data?.error || 'Failed to save API key', 'error')
        setTestingModel(null)
        return
      }

      // Test connection
      try {
        const response = await api.post(`/ai-agents/${modelAgent.id}/test-connection`)
        if (response.data.success) {
          if (response.data.testResult.success) {
            showToast('Connected successfully! You can now use this model.', 'success')
            // Refresh agents to update connection status
            await fetchAgents()
          } else {
            showToast(`Connection failed: ${response.data.testResult.error || 'Unknown error'}`, 'error')
          }
        } else {
          showToast('Connection test failed', 'error')
        }
      } catch (testError: any) {
        console.error('Error testing connection:', testError)
        showToast(testError.response?.data?.error || 'Failed to test connection', 'error')
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

  const handleViewDetail = (agent: Agent) => {
    setViewingAgent(agent)
    setShowAgentModal(true)
  }

  const handleRename = (agent: Agent) => {
    setEditingAgent(agent)
    setShowAgentModal(true)
  }

  // Add sample agents for testing if no custom agents exist (UI only)
  const [sampleAgentsAdded, setSampleAgentsAdded] = useState(false)
  
  useEffect(() => {
    if (!loading && agents.length >= 0 && !sampleAgentsAdded) {
      const customAgents = agents.filter((a) => !a.is_default && !a.id.startsWith('sample-'))
      if (customAgents.length === 0) {
        // Add sample agents for UI testing
        const samples: Agent[] = [
          {
            id: 'sample-1',
            name: 'Customer Support Agent',
            description: 'A helpful AI agent designed to assist customers with their inquiries, providing quick and accurate responses to common questions and issues.',
            model: 'gemini-3',
            is_default: false,
            is_active: true,
            memory_enabled: true,
            memory_size_bytes: 1024000,
            memory_token_estimate: 50000,
          },
          {
            id: 'sample-2',
            name: 'Code Assistant',
            description: 'Specialized AI agent for code generation, debugging, and technical documentation. Helps developers write better code faster.',
            model: 'gpt-5',
            is_default: false,
            is_active: true,
            memory_enabled: true,
            memory_size_bytes: 2048000,
            memory_token_estimate: 100000,
          },
          {
            id: 'sample-3',
            name: 'Content Writer',
            description: 'Creative writing assistant that helps create engaging content, blog posts, and marketing materials.',
            model: 'gemini-2',
            is_default: false,
            is_active: false,
            memory_enabled: true,
            memory_size_bytes: 512000,
            memory_token_estimate: 25000,
          },
        ]
        setAgents((prev) => [...prev, ...samples])
        setSampleAgentsAdded(true)
      }
    }
  }, [loading, agents.length, sampleAgentsAdded])

  // Removed search and filter - show all agents
  const filteredAgents = agents

  const geminiAgent = agents.find(a => a.is_default && (a.model === 'gemini' || a.model_provider === 'google'))
  const chatgptAgent = agents.find(a => a.is_default && (a.model === 'chatgpt' || a.model_provider === 'openai'))
  const customAgents = filteredAgents.filter((a) => !a.is_default)

  return (
    <div className={styles.agentManagement}>

      {loading ? (
        <div className={styles.loading}>Loading agents...</div>
      ) : (
        <>
          {/* Default AI Model Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Default AI Model</h3>
            <div className={styles.modelsList}>
              <AIModelCard
                model="gemini"
                name="Gemini"
                description="Google's Gemini AI model. Enter your API key to connect and use this model."
                apiKey={geminiApiKey}
                isConnected={geminiAgent?.is_active || false}
                isActive={geminiAgent?.is_active || false}
                agentId={geminiAgent?.id}
                onApiKeyChange={async (key) => {
                  try {
                    await handleModelApiKeyChange('gemini', key)
                  } catch (error: any) {
                    showToast(error.response?.data?.error || 'Failed to save API key', 'error')
                    throw error
                  }
                }}
                onToggle={() => handleModelToggle('gemini')}
                onConnectionSuccess={() => fetchAgents()}
              />
              <AIModelCard
                model="chatgpt"
                name="ChatGPT"
                description="OpenAI's ChatGPT model. Enter your API key to connect and use this model."
                apiKey={chatgptApiKey}
                isConnected={chatgptAgent?.is_active || false}
                isActive={chatgptAgent?.is_active || false}
                agentId={chatgptAgent?.id}
                onApiKeyChange={async (key) => {
                  try {
                    await handleModelApiKeyChange('chatgpt', key)
                  } catch (error: any) {
                    showToast(error.response?.data?.error || 'Failed to save API key', 'error')
                    throw error
                  }
                }}
                onToggle={() => handleModelToggle('chatgpt')}
                onConnectionSuccess={() => fetchAgents()}
              />
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
              <div className={styles.agentsList}>
                {customAgents.map((agent) => (
                  <AIAgentCard
                    key={agent.id}
                    agent={agent}
                    onEdit={handleEditAgent}
                    onDelete={handleDeleteAgent}
                    onToggle={handleToggleAgent}
                    onViewMemory={handleViewMemory}
                    onViewDetail={handleViewDetail}
                    onRename={handleRename}
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
          agent={editingAgent || viewingAgent}
          onClose={() => {
            setShowAgentModal(false)
            setEditingAgent(null)
            setViewingAgent(null)
          }}
          onSave={() => {
            setShowAgentModal(false)
            setEditingAgent(null)
            setViewingAgent(null)
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
