import { useState, useEffect } from 'react'
import api from '@/services/api'
import { ToastContainer, type Toast } from '@/components/Toast'
import {
  IconX,
  IconPlus,
  IconEdit,
  IconTrash,
  IconDownload,
  IconUpload,
  IconSearch,
  IconDatabase,
} from '@/components/Icons'
import styles from './AgentMemoryView.module.css'

interface Memory {
  id: string
  content: string
  context?: Record<string, any>
  importance_score: number
  size_bytes: number
  token_estimate: number
  created_at: string
}

interface Agent {
  id: string
  name: string
  memory_size_bytes: number
  memory_token_estimate: number
}

interface AgentMemoryViewProps {
  agent: Agent
  onClose: () => void
  onUpdate: () => void
}

export function AgentMemoryView({ agent, onClose, onUpdate }: AgentMemoryViewProps) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  const [memoryForm, setMemoryForm] = useState({
    content: '',
    importance_score: 5,
    context: '',
  })

  useEffect(() => {
    fetchMemories()
  }, [agent.id])

  const fetchMemories = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/ai-agents/${agent.id}/memory`)
      if (response.data.success) {
        setMemories(response.data.data || [])
      }
    } catch (error: any) {
      console.error('Error fetching memories:', error)
      showToast('Failed to load memories', 'error')
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

  const handleAddMemory = async () => {
    if (!memoryForm.content.trim()) {
      showToast('Please enter memory content', 'error')
      return
    }

    try {
      const response = await api.post(`/ai-agents/${agent.id}/memory`, {
        content: memoryForm.content,
        importance_score: memoryForm.importance_score,
        context: memoryForm.context ? JSON.parse(memoryForm.context) : {},
      })

      if (response.data.success) {
        showToast('Memory added successfully', 'success')
        setShowAddModal(false)
        setMemoryForm({ content: '', importance_score: 5, context: '' })
        fetchMemories()
        onUpdate()
      }
    } catch (error: any) {
      console.error('Error adding memory:', error)
      showToast(error.response?.data?.error || 'Failed to add memory', 'error')
    }
  }

  const handleEditMemory = async (memory: Memory) => {
    try {
      const response = await api.put(`/ai-agents/${agent.id}/memory/${memory.id}`, {
        content: memoryForm.content,
        importance_score: memoryForm.importance_score,
        context: memoryForm.context ? JSON.parse(memoryForm.context) : {},
      })

      if (response.data.success) {
        showToast('Memory updated successfully', 'success')
        setShowAddModal(false)
        setEditingMemory(null)
        setMemoryForm({ content: '', importance_score: 5, context: '' })
        fetchMemories()
        onUpdate()
      }
    } catch (error: any) {
      console.error('Error updating memory:', error)
      showToast(error.response?.data?.error || 'Failed to update memory', 'error')
    }
  }

  const handleDeleteMemory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this memory?')) return

    try {
      const response = await api.delete(`/ai-agents/${agent.id}/memory/${id}`)
      if (response.data.success) {
        showToast('Memory deleted successfully', 'success')
        fetchMemories()
        onUpdate()
      }
    } catch (error: any) {
      console.error('Error deleting memory:', error)
      showToast(error.response?.data?.error || 'Failed to delete memory', 'error')
    }
  }

  const handleDownloadMemory = async () => {
    try {
      const response = await api.get(`/ai-agents/${agent.id}/memory/download`, {
        responseType: 'blob',
      })

      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `agent-${agent.id}-memory.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showToast('Memory downloaded successfully', 'success')
    } catch (error: any) {
      console.error('Error downloading memory:', error)
      showToast('Failed to download memory', 'error')
    }
  }

  const handleUploadMemory = async (file: File) => {
    try {
      const text = await file.text()
      const memories = JSON.parse(text)

      if (!Array.isArray(memories)) {
        showToast('Invalid memory file format', 'error')
        return
      }

      const response = await api.post(`/ai-agents/${agent.id}/memory/upload`, {
        memories,
      })

      if (response.data.success) {
        showToast(`Imported ${response.data.imported} memories`, 'success')
        fetchMemories()
        onUpdate()
      }
    } catch (error: any) {
      console.error('Error uploading memory:', error)
      showToast(error.response?.data?.error || 'Failed to upload memory', 'error')
    }
  }

  const openEditModal = (memory: Memory) => {
    setEditingMemory(memory)
    setMemoryForm({
      content: memory.content,
      importance_score: memory.importance_score,
      context: memory.context ? JSON.stringify(memory.context, null, 2) : '',
    })
    setShowAddModal(true)
  }

  const filteredMemories = memories.filter((memory) =>
    memory.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2>Agent Memory - {agent.name}</h2>
            <div className={styles.memoryStats}>
              <span>
                <IconDatabase />
                {formatBytes(agent.memory_size_bytes)}
              </span>
              <span>{formatTokens(agent.memory_token_estimate)}</span>
            </div>
          </div>
          <button className={styles.modalClose} onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.actions}>
            <div className={styles.searchBar}>
              <IconSearch />
              <input
                type="text"
                placeholder="Search memories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className={styles.actionButtons}>
              <button
                className={styles.actionButton}
                onClick={() => {
                  setEditingMemory(null)
                  setMemoryForm({ content: '', importance_score: 5, context: '' })
                  setShowAddModal(true)
                }}
              >
                <IconPlus />
                <span>Add Memory</span>
              </button>
              <button className={styles.actionButton} onClick={handleDownloadMemory}>
                <IconDownload />
                <span>Download</span>
              </button>
              <label className={styles.actionButton}>
                <IconUpload />
                <span>Upload</span>
                <input
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleUploadMemory(file)
                  }}
                />
              </label>
            </div>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading memories...</div>
          ) : filteredMemories.length === 0 ? (
            <div className={styles.empty}>
              <IconDatabase />
              <p>No memories found</p>
            </div>
          ) : (
            <div className={styles.memoriesList}>
              {filteredMemories.map((memory) => (
                <div key={memory.id} className={styles.memoryItem}>
                  <div className={styles.memoryHeader}>
                    <div className={styles.memoryMeta}>
                      <span className={styles.importanceBadge}>
                        Importance: {memory.importance_score}/10
                      </span>
                      <span className={styles.memorySize}>
                        {formatBytes(memory.size_bytes)} • {formatTokens(memory.token_estimate)}
                      </span>
                    </div>
                    <div className={styles.memoryActions}>
                      <button
                        className={styles.editButton}
                        onClick={() => openEditModal(memory)}
                      >
                        <IconEdit />
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteMemory(memory.id)}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                  <div className={styles.memoryContent}>{memory.content}</div>
                  {memory.context && Object.keys(memory.context).length > 0 && (
                    <div className={styles.memoryContext}>
                      <strong>Context:</strong> {JSON.stringify(memory.context)}
                    </div>
                  )}
                  <div className={styles.memoryDate}>
                    {new Date(memory.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Memory Modal */}
        {showAddModal && (
          <div className={styles.innerModalOverlay} onClick={() => setShowAddModal(false)}>
            <div className={styles.innerModal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.innerModalHeader}>
                <h3>{editingMemory ? 'Edit Memory' : 'Add Memory'}</h3>
                <button onClick={() => setShowAddModal(false)}>
                  <IconX />
                </button>
              </div>
              <div className={styles.innerModalBody}>
                <div className={styles.formGroup}>
                  <label>
                    Content <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    value={memoryForm.content}
                    onChange={(e) => setMemoryForm({ ...memoryForm, content: e.target.value })}
                    placeholder="Enter memory content..."
                    rows={6}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Importance Score (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={memoryForm.importance_score}
                    onChange={(e) =>
                      setMemoryForm({
                        ...memoryForm,
                        importance_score: parseInt(e.target.value) || 5,
                      })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Context (JSON, optional)</label>
                  <textarea
                    value={memoryForm.context}
                    onChange={(e) => setMemoryForm({ ...memoryForm, context: e.target.value })}
                    placeholder='{"source": "conversation", "topic": "..."}'
                    rows={3}
                  />
                </div>
              </div>
              <div className={styles.innerModalFooter}>
                <button onClick={() => setShowAddModal(false)}>Cancel</button>
                <button
                  onClick={() => {
                    if (editingMemory) {
                      handleEditMemory(editingMemory)
                    } else {
                      handleAddMemory()
                    }
                  }}
                >
                  {editingMemory ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer toasts={toasts} onClose={closeToast} />
      </div>
    </div>
  )
}

