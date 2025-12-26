import { useState, useEffect, useRef } from 'react'
import api from '@/services/api'
import { ToastContainer, type Toast } from '@/components/Toast'
import {
  IconX,
  IconUpload,
  IconTrash,
  IconEye,
  IconEyeOff,
} from '@/components/Icons'
import { getSupabaseClient } from '@/utils/supabase'
import styles from './AIAgentModal.module.css'

interface Agent {
  id?: string
  name: string
  avatar_url?: string
  model: string
  model_provider?: string
  api_key?: string
  description?: string
  is_default: boolean
  is_active: boolean
  memory_enabled: boolean
  knowledge_files?: any[]
}

interface AIAgentModalProps {
  agent?: Agent | null
  onClose: () => void
  onSave: () => void
}

export function AIAgentModal({ agent, onClose, onSave }: AIAgentModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    model: 'gemini',
    description: '',
    memory_enabled: true,
    api_key: '',
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [knowledgeFiles, setKnowledgeFiles] = useState<any[]>([])
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingKnowledge, setUploadingKnowledge] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const knowledgeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        model: agent.model,
        description: agent.description || '',
        memory_enabled: agent.memory_enabled,
        api_key: agent.api_key || '',
      })
      setAvatarPreview(agent.avatar_url || '')
      setKnowledgeFiles(agent.knowledge_files || [])
    }
  }, [agent])

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const closeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file', 'error')
      return
    }

    setUploadingAvatar(true)
    try {
      const supabaseClient = getSupabaseClient()
      if (!supabaseClient) {
        showToast('Supabase not configured. Cannot upload avatar.', 'error')
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `agent-avatars/${agent?.id || 'temp'}/${fileName}`

      const { error: uploadError } = await supabaseClient.storage
        .from('agent-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabaseClient.storage
        .from('agent-assets')
        .getPublicUrl(filePath)

      setAvatarPreview(urlData.publicUrl)
      setAvatarFile(file)
      showToast('Avatar uploaded successfully', 'success')
    } catch (error: any) {
      console.error('Error uploading avatar:', error)
      showToast(error.message || 'Failed to upload avatar', 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleKnowledgeUpload = async (file: File) => {
    setUploadingKnowledge(true)
    try {
      const supabaseClient = getSupabaseClient()
      if (!supabaseClient) {
        showToast('Supabase not configured. Cannot upload knowledge file.', 'error')
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `agent-knowledge/${agent?.id || 'temp'}/${fileName}`

      const { error: uploadError } = await supabaseClient.storage
        .from('agent-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabaseClient.storage
        .from('agent-assets')
        .getPublicUrl(filePath)

      const newFile = {
        id: Date.now().toString(),
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
        uploaded_at: new Date().toISOString(),
      }

      setKnowledgeFiles((prev) => [...prev, newFile])
      showToast('Knowledge file uploaded successfully', 'success')
    } catch (error: any) {
      console.error('Error uploading knowledge file:', error)
      showToast(error.message || 'Failed to upload knowledge file', 'error')
    } finally {
      setUploadingKnowledge(false)
    }
  }

  const handleRemoveKnowledgeFile = (fileId: string) => {
    setKnowledgeFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast('Please enter agent name', 'error')
      return
    }

    try {
      const payload: any = {
        name: formData.name,
        model: formData.model,
        description: formData.description,
        memory_enabled: formData.memory_enabled,
        knowledge_files: knowledgeFiles,
      }

      if (avatarPreview) {
        payload.avatar_url = avatarPreview
      }

      if (agent) {
        // Update existing agent
        if (agent.is_default && formData.api_key) {
          // Update API key for default agents
          await api.put(`/ai-agents/${agent.id}/api-key`, { api_key: formData.api_key })
        }
        await api.put(`/ai-agents/${agent.id}`, payload)
        showToast('Agent updated successfully', 'success')
      } else {
        // Create new agent
        await api.post('/ai-agents', payload)
        showToast('Agent created successfully', 'success')
      }

      setTimeout(() => {
        onSave()
      }, 500)
    } catch (error: any) {
      console.error('Error saving agent:', error)
      showToast(error.response?.data?.error || 'Failed to save agent', 'error')
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{agent ? 'Edit Agent' : 'Create Agent'}</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Basic Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Basic Information</h3>
            <div className={styles.formGroup}>
              <label>
                Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter agent name"
                disabled={agent?.is_default}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Avatar</label>
              <div className={styles.avatarUpload}>
                {avatarPreview ? (
                  <div className={styles.avatarPreview}>
                    <img src={avatarPreview} alt="Avatar" />
                    <button
                      className={styles.removeAvatar}
                      onClick={() => {
                        setAvatarPreview('')
                        setAvatarFile(null)
                      }}
                    >
                      <IconTrash />
                    </button>
                  </div>
                ) : (
                  <div
                    className={styles.avatarPlaceholder}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <IconUpload />
                    <span>Upload Avatar</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleAvatarUpload(file)
                  }}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>
                Model <span className={styles.required}>*</span>
              </label>
              <select
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                disabled={agent?.is_default}
              >
                <option value="gemini">Gemini</option>
                <option value="chatgpt">ChatGPT</option>
              </select>
            </div>

            {agent?.is_default && (
              <div className={styles.formGroup}>
                <label>API Key</label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                    placeholder="Enter API key"
                  />
                  <button
                    className={styles.passwordToggle}
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                <p className={styles.helperText}>
                  Enter your API key to activate this default agent
                </p>
              </div>
            )}
          </div>

          {/* AI Description */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>AI Description</h3>
            <div className={styles.formGroup}>
              <label>Agent Personality & Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the agent's personality, behavior, and capabilities..."
                rows={6}
              />
            </div>
          </div>

          {/* Knowledge Files */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Knowledge Files</h3>
            <div className={styles.formGroup}>
              <div
                className={styles.fileUploadArea}
                onClick={() => knowledgeInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.add(styles.dragOver)
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove(styles.dragOver)
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove(styles.dragOver)
                  const file = e.dataTransfer.files[0]
                  if (file) handleKnowledgeUpload(file)
                }}
              >
                <IconUpload />
                <span>Click to upload or drag and drop</span>
                <span className={styles.fileHint}>PDF, TXT, DOCX, etc.</span>
              </div>
              <input
                ref={knowledgeInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleKnowledgeUpload(file)
                }}
              />
            </div>

            {knowledgeFiles.length > 0 && (
              <div className={styles.knowledgeFilesList}>
                {knowledgeFiles.map((file) => (
                  <div key={file.id} className={styles.knowledgeFileItem}>
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName}>{file.name}</span>
                      <span className={styles.fileSize}>
                        {(file.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                    <button
                      className={styles.removeFileButton}
                      onClick={() => handleRemoveKnowledgeFile(file.id)}
                    >
                      <IconTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Memory Settings */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Memory Settings</h3>
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.memory_enabled}
                  onChange={(e) =>
                    setFormData({ ...formData, memory_enabled: e.target.checked })
                  }
                />
                <span>Enable Memory</span>
              </label>
              <p className={styles.helperText}>
                When enabled, the agent will remember important information from conversations
              </p>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.saveButton} onClick={handleSave}>
            {agent ? 'Update' : 'Create'}
          </button>
        </div>

        <ToastContainer toasts={toasts} onClose={closeToast} />
      </div>
    </div>
  )
}

