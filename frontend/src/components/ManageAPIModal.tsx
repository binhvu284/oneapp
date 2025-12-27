import { useState, useEffect } from 'react'
import { IconX, IconCheckCircle, IconXCircle, IconClock, IconEye, IconEyeOff, IconEdit } from '@/components/Icons'
import api from '@/services/api'
import styles from './ManageAPIModal.module.css'

interface ConnectionLog {
  timestamp: string
  success: boolean
  error: string | null
  model: string
}

interface ManageAPIModalProps {
  isOpen: boolean
  onClose: () => void
  agentId: string
  agentName: string
  currentApiKey: string
  onApiKeyUpdate?: (newApiKey: string) => Promise<void>
  onConnectionSuccess?: () => void
}

export function ManageAPIModal({ isOpen, onClose, agentId, agentName, currentApiKey, onApiKeyUpdate, onConnectionSuccess }: ManageAPIModalProps) {
  const [connectionLogs, setConnectionLogs] = useState<ConnectionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showApiKey, setShowApiKey] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedApiKey, setEditedApiKey] = useState(currentApiKey)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<'connected' | 'failed' | 'unknown'>('unknown')

  useEffect(() => {
    if (isOpen && agentId) {
      loadConnectionLogs()
      setEditedApiKey(currentApiKey || '')
      setIsEditing(false)
      setShowApiKey(false)
    }
  }, [isOpen, agentId])

  // Update edited API key when current API key changes
  useEffect(() => {
    if (!isEditing) {
      setEditedApiKey(currentApiKey || '')
    }
  }, [currentApiKey, isEditing])

  const loadConnectionLogs = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/ai-agents/${agentId}`)
      if (response.data.success) {
        const logs = response.data.data?.metadata?.connection_logs || []
        setConnectionLogs(logs)
        
        // Set current status based on most recent test
        if (logs.length > 0) {
          setCurrentStatus(logs[0].success ? 'connected' : 'failed')
        } else {
          setCurrentStatus('unknown')
        }
      }
    } catch (error) {
      console.error('Error loading connection logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveApiKey = async () => {
    if (!editedApiKey.trim()) {
      return
    }

    setSaving(true)
    try {
      // Call parent's onApiKeyUpdate which will save to database
      if (onApiKeyUpdate) {
        await onApiKeyUpdate(editedApiKey.trim())
      }
      
      setIsEditing(false)
      
      // Automatically test connection after saving
      await handleTestConnection()
    } catch (error) {
      console.error('Error saving API key:', error)
      alert('Failed to save API key. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    try {
      const response = await api.post(`/ai-agents/${agentId}/test-connection`)
      if (response.data.success) {
        // Reload logs to show new test result
        await loadConnectionLogs()
        
        // Notify parent to refresh agent data if test was successful
        if (response.data.testResult?.success && onConnectionSuccess) {
          onConnectionSuccess()
        }
      }
    } catch (error) {
      console.error('Error testing connection:', error)
    } finally {
      setTesting(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedApiKey(currentApiKey)
    setIsEditing(false)
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div>
              <h2 className={styles.title}>Manage API - {agentName}</h2>
              <p className={styles.subtitle}>View API configuration and connection history</p>
            </div>
            <div className={styles.currentStatusBadge}>
              {currentStatus === 'connected' ? (
                <span className={styles.statusConnected}>
                  <IconCheckCircle />
                  Connected & Active
                </span>
              ) : currentStatus === 'failed' ? (
                <span className={styles.statusFailed}>
                  <IconXCircle />
                  Connection Failed
                </span>
              ) : (
                <span className={styles.statusUnknown}>
                  <IconClock />
                  Not Tested
                </span>
              )}
            </div>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className={styles.content}>
          {/* Current API Key Section */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Current API Key</h3>
              {!isEditing && (
                <button
                  className={styles.editButton}
                  onClick={() => setIsEditing(true)}
                >
                  <IconEdit />
                  <span>Edit</span>
                </button>
              )}
            </div>
            
            {isEditing ? (
              <div className={styles.editApiKeyRow}>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={editedApiKey}
                    onChange={(e) => setEditedApiKey(e.target.value)}
                    placeholder="Enter new API key..."
                    className={styles.apiKeyInput}
                  />
                  <button
                    className={styles.toggleButton}
                    onClick={() => setShowApiKey(!showApiKey)}
                    type="button"
                  >
                    {showApiKey ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                <div className={styles.editActions}>
                  <button
                    className={styles.saveButton}
                    onClick={handleSaveApiKey}
                    disabled={saving || testing || !editedApiKey.trim()}
                  >
                    {saving ? 'Saving & Testing...' : 'Save'}
                  </button>
                  <button
                    className={styles.cancelButton}
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.apiKeyRow}>
                <div className={styles.apiKeyDisplay}>
                  {currentApiKey && currentApiKey.trim() ? (
                    showApiKey ? currentApiKey : '•'.repeat(Math.min(currentApiKey.length, 40))
                  ) : (
                    <span className={styles.noApiKey}>No API key configured</span>
                  )}
                </div>
                {currentApiKey && currentApiKey.trim() && (
                  <button
                    className={styles.toggleButton}
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <IconEyeOff /> : <IconEye />}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Test Connection Button */}
          <div className={styles.section}>
            {currentStatus === 'failed' && (
              <div className={styles.warningBox}>
                <IconXCircle />
                <div>
                  <strong>Connection Failed</strong>
                  <p>The API connection test failed. Please verify your API key is correct and try testing again. You cannot activate this model until the connection test passes.</p>
                </div>
              </div>
            )}
            {currentStatus === 'unknown' && (
              <div className={styles.infoBox}>
                <IconClock />
                <div>
                  <strong>Connection Not Tested</strong>
                  <p>Click "Test Connection Now" to verify your API key works correctly before using this model in AI chat.</p>
                </div>
              </div>
            )}
            <button
              className={styles.testButton}
              onClick={handleTestConnection}
              disabled={testing || isEditing}
            >
              {testing ? 'Testing...' : 'Test Connection Now'}
            </button>
          </div>

          {/* Connection History */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Connection Test History</h3>
            {loading ? (
              <div className={styles.loading}>Loading...</div>
            ) : connectionLogs.length === 0 ? (
              <div className={styles.emptyState}>
                No connection tests yet. Click "Test Connection Now" to verify your API key.
              </div>
            ) : (
              <div className={styles.logsTable}>
                <div className={styles.tableHeader}>
                  <div className={styles.colStatus}>Status</div>
                  <div className={styles.colTime}>Time</div>
                  <div className={styles.colError}>Details</div>
                </div>
                <div className={styles.tableBody}>
                  {connectionLogs.map((log, index) => (
                    <div key={index} className={styles.logRow}>
                      <div className={styles.colStatus}>
                        {log.success ? (
                          <span className={styles.statusSuccess}>
                            <IconCheckCircle />
                            Success
                          </span>
                        ) : (
                          <span className={styles.statusError}>
                            <IconXCircle />
                            Failed
                          </span>
                        )}
                      </div>
                      <div className={styles.colTime}>
                        <IconClock />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                      <div className={styles.colError}>
                        {log.error || 'Connection successful'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.closeFooterButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

