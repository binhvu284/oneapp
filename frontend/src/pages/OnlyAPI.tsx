import { useState, useEffect, useMemo } from 'react'
import api from '@/services/api'
import { ToastContainer, type Toast } from '@/components/Toast'
import {
  IconEdit,
  IconTrash,
  IconSearch,
  IconEye,
  IconEyeOff,
  IconCheckCircle,
  IconXCircle,
  IconAPI,
  IconServer,
  IconCopy,
  IconPlay,
  IconFilter,
  IconRefreshCw,
} from '@/components/Icons'
import styles from './OnlyAPI.module.css'

interface Api {
  id: string
  name: string
  type: string
  api_url: string
  api_key: string
  status: 'connected' | 'disconnected' | 'error' | 'unknown'
  last_checked?: string
  app_source?: string
  description?: string
  enabled: boolean
  metadata?: Record<string, any>
  created_at?: string
  updated_at?: string
}

type ApiType = 'all' | 'Database' | 'AI' | 'REST' | 'GraphQL' | 'Integrated'
type ApiStatus = 'all' | 'connected' | 'disconnected' | 'error' | 'unknown'

export function OnlyAPI() {
  const [apis, setApis] = useState<Api[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<ApiType>('all')
  const [filterStatus, setFilterStatus] = useState<ApiStatus>('all')
  const [filterAppSource, setFilterAppSource] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [showApiModal, setShowApiModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [editingApi, setEditingApi] = useState<Api | null>(null)
  const [viewingApi, setViewingApi] = useState<Api | null>(null)
  const [testingApiId, setTestingApiId] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'Database',
    api_url: '',
    api_key: '',
    app_source: '',
    description: '',
    enabled: true,
  })

  // Fetch APIs
  useEffect(() => {
    fetchApis()
  }, [])

  const fetchApis = async () => {
    setLoading(true)
    try {
      const response = await api.get('/apis')
      if (response.data.success) {
        setApis(response.data.data || [])
      }
    } catch (error: any) {
      console.error('Error fetching APIs:', error)
      showToast('Failed to load APIs', 'error')
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

  // Filtered APIs
  const filteredApis = useMemo(() => {
    return apis.filter((api) => {
      const matchesSearch =
        api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (api.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (api.app_source || '').toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = filterType === 'all' || api.type === filterType
      const matchesStatus = filterStatus === 'all' || api.status === filterStatus
      const matchesAppSource = filterAppSource === 'all' || api.app_source === filterAppSource

      return matchesSearch && matchesType && matchesStatus && matchesAppSource
    })
  }, [apis, searchQuery, filterType, filterStatus, filterAppSource])

  // Get unique app sources
  const appSources = useMemo(() => {
    const sources = new Set<string>()
    apis.forEach((api) => {
      if (api.app_source) sources.add(api.app_source)
    })
    return Array.from(sources).sort()
  }, [apis])


  const handleOpenEditModal = (api: Api) => {
    setEditingApi(api)
    setFormData({
      name: api.name,
      type: api.type,
      api_url: api.api_url,
      api_key: api.api_key,
      app_source: api.app_source || '',
      description: api.description || '',
      enabled: api.enabled,
    })
    setShowApiModal(true)
  }

  const handleSaveApi = async () => {
    if (!formData.name || !formData.api_url || !formData.api_key) {
      showToast('Please fill in all required fields', 'error')
      return
    }

    try {
      if (editingApi) {
        // Update
        const response = await api.put(`/apis/${editingApi.id}`, formData)
        if (response.data.success) {
          showToast('API updated successfully', 'success')
          setShowApiModal(false)
          fetchApis()
        }
      } else {
        // Create
        const response = await api.post('/apis', formData)
        if (response.data.success) {
          showToast('API created successfully', 'success')
          setShowApiModal(false)
          fetchApis()
        }
      }
    } catch (error: any) {
      console.error('Error saving API:', error)
      showToast(error.response?.data?.error || 'Failed to save API', 'error')
    }
  }

  // Handle delete API
  const handleDeleteApi = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API?')) return

    try {
      const response = await api.delete(`/apis/${id}`)
      if (response.data.success) {
        showToast('API deleted successfully', 'success')
        fetchApis()
      }
    } catch (error: any) {
      console.error('Error deleting API:', error)
      showToast(error.response?.data?.error || 'Failed to delete API', 'error')
    }
  }

  // Handle duplicate API
  const handleDuplicateApi = (api: Api) => {
    setEditingApi(null)
    setFormData({
      name: `${api.name} (Copy)`,
      type: api.type,
      api_url: api.api_url,
      api_key: api.api_key,
      app_source: api.app_source || '',
      description: api.description || '',
      enabled: false, // Disable by default for duplicates
    })
    setShowApiModal(true)
  }

  // Handle test connection
  const handleTestConnection = async (id: string) => {
    setTestingApiId(id)
    try {
      const response = await api.post(`/apis/${id}/test`)
      if (response.data.success) {
        const { status, error } = response.data.testResult
        if (status === 'connected') {
          showToast('Connection test successful', 'success')
        } else {
          showToast(`Connection test failed: ${error || 'Unknown error'}`, 'error')
        }
        fetchApis()
      }
    } catch (error: any) {
      console.error('Error testing connection:', error)
      showToast(error.response?.data?.error || 'Failed to test connection', 'error')
    } finally {
      setTestingApiId(null)
    }
  }

  // Handle toggle enable/disable
  const handleToggleEnabled = async (apiItem: Api) => {
    try {
      const response = await api.put(`/apis/${apiItem.id}/toggle`, { enabled: !apiItem.enabled })
      if (response.data.success) {
        showToast(`API ${!apiItem.enabled ? 'enabled' : 'disabled'} successfully`, 'success')
        fetchApis()
      }
    } catch (error: any) {
      console.error('Error toggling API:', error)
      showToast(error.response?.data?.error || 'Failed to toggle API', 'error')
    }
  }

  // Handle sync from OneApp Data
  const handleSync = async (source: string) => {
    try {
      const response = await api.post('/apis/sync', { source })
      if (response.data.success) {
        showToast(response.data.message || 'Sync completed successfully', 'success')
        setShowSyncModal(false)
        fetchApis()
      }
    } catch (error: any) {
      console.error('Error syncing APIs:', error)
      showToast(error.response?.data?.error || 'Failed to sync APIs', 'error')
    }
  }

  // Handle view API
  const handleViewApi = (api: Api) => {
    setViewingApi(api)
    setShowViewModal(true)
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Get status icon and color
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'connected':
        return { icon: IconCheckCircle, color: 'var(--success)', label: 'Connected' }
      case 'disconnected':
        return { icon: IconXCircle, color: 'var(--error)', label: 'Disconnected' }
      case 'error':
        return { icon: IconXCircle, color: 'var(--error)', label: 'Error' }
      default:
        return { icon: IconServer, color: 'var(--text-secondary)', label: 'Unknown' }
    }
  }

  return (
    <div className={styles.onlyapi}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>API Management</h1>
          <p className={styles.subtitle}>
            Manage and monitor all APIs used across OneApp applications
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={styles.searchFilters}>
        <div className={styles.searchBar}>
          <IconSearch />
          <input
            type="text"
            placeholder="Search APIs by name, description, or source..."
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
            <label>Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as ApiType)}
            >
              <option value="all">All Types</option>
              <option value="Database">Database</option>
              <option value="AI">AI</option>
              <option value="REST">REST</option>
              <option value="GraphQL">GraphQL</option>
              <option value="Integrated">Integrated</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ApiStatus)}
            >
              <option value="all">All Status</option>
              <option value="connected">Connected</option>
              <option value="disconnected">Disconnected</option>
              <option value="error">Error</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>App Source</label>
            <select
              value={filterAppSource}
              onChange={(e) => setFilterAppSource(e.target.value)}
            >
              <option value="all">All Sources</option>
              {appSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* API List */}
      {loading ? (
        <div className={styles.loading}>Loading APIs...</div>
      ) : filteredApis.length === 0 ? (
        <div className={styles.empty}>
          <IconAPI />
          <p>No APIs found</p>
        </div>
      ) : (
        <div className={styles.apiList}>
          {filteredApis.map((api) => {
            const statusDisplay = getStatusDisplay(api.status)
            const StatusIcon = statusDisplay.icon

            return (
              <div key={api.id} className={styles.apiCard}>
                <div className={styles.apiCardHeader}>
                  <div className={styles.apiCardInfo}>
                    <div className={styles.apiCardTitle}>
                      <h3>{api.name}</h3>
                      {api.app_source && (
                        <span className={styles.appSourceBadge}>{api.app_source}</span>
                      )}
                    </div>
                    <div className={styles.apiCardMeta}>
                      <span className={styles.apiType}>{api.type}</span>
                      <div
                        className={styles.statusBadge}
                        style={{ color: statusDisplay.color }}
                      >
                        <StatusIcon />
                        <span>{statusDisplay.label}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.apiCardActions}>
                    <label className={styles.toggleSwitch}>
                      <input
                        type="checkbox"
                        checked={api.enabled}
                        onChange={() => handleToggleEnabled(api)}
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
                    <div className={styles.actionMenu}>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleViewApi(api)}
                        title="View"
                      >
                        <IconEye />
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleTestConnection(api.id)}
                        disabled={testingApiId === api.id}
                        title="Test Connection"
                      >
                        {testingApiId === api.id ? (
                          <IconRefreshCw className={styles.spinning} />
                        ) : (
                          <IconPlay />
                        )}
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleOpenEditModal(api)}
                        title="Edit"
                      >
                        <IconEdit />
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleDuplicateApi(api)}
                        title="Duplicate"
                      >
                        <IconCopy />
                      </button>
                      <button
                        className={styles.actionButton}
                        onClick={() => handleDeleteApi(api.id)}
                        title="Delete"
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                </div>
                {api.description && (
                  <p className={styles.apiCardDescription}>{api.description}</p>
                )}
                <div className={styles.apiCardFooter}>
                  <div className={styles.apiCardUrl}>
                    <span className={styles.label}>URL:</span>
                    <code>{api.api_url}</code>
                  </div>
                  {api.last_checked && (
                    <div className={styles.apiCardLastChecked}>
                      Last checked: {formatDate(api.last_checked)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showApiModal && (
        <div className={styles.modalOverlay} onClick={() => setShowApiModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingApi ? 'Edit API' : 'Add New API'}</h2>
              <button className={styles.modalClose} onClick={() => setShowApiModal(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>
                  Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Supabase Database"
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  Type <span className={styles.required}>*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Database">Database</option>
                  <option value="AI">AI</option>
                  <option value="REST">REST</option>
                  <option value="GraphQL">GraphQL</option>
                  <option value="Integrated">Integrated</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>
                  API URL <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.api_url}
                  onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                  placeholder="https://example.com/api"
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  API Key <span className={styles.required}>*</span>
                </label>
                <div className={styles.passwordInputWrapper}>
                  <input
                    type={showApiKey['form'] ? 'text' : 'password'}
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                    placeholder="Enter API key"
                  />
                  <button
                    className={styles.passwordToggle}
                    onClick={() =>
                      setShowApiKey({ ...showApiKey, form: !showApiKey['form'] })
                    }
                  >
                    {showApiKey['form'] ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>App Source</label>
                <input
                  type="text"
                  value={formData.app_source}
                  onChange={(e) => setFormData({ ...formData, app_source: e.target.value })}
                  placeholder="e.g., OneApp Data"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  />
                  <span>Enabled</span>
                </label>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => setShowApiModal(false)}>
                Cancel
              </button>
              <button className={styles.saveButton} onClick={handleSaveApi}>
                {editingApi ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingApi && (
        <div className={styles.modalOverlay} onClick={() => setShowViewModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>API Details</h2>
              <button className={styles.modalClose} onClick={() => setShowViewModal(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.viewGroup}>
                <label>Name</label>
                <div className={styles.viewValue}>{viewingApi.name}</div>
              </div>
              <div className={styles.viewGroup}>
                <label>Type</label>
                <div className={styles.viewValue}>{viewingApi.type}</div>
              </div>
              <div className={styles.viewGroup}>
                <label>API URL</label>
                <div className={styles.viewValue}>
                  <code>{viewingApi.api_url}</code>
                </div>
              </div>
              <div className={styles.viewGroup}>
                <label>API Key</label>
                <div className={styles.passwordInputWrapper}>
                  <code className={styles.viewValue}>
                    {showApiKey[viewingApi.id]
                      ? viewingApi.api_key
                      : '•'.repeat(20) + '...'}
                  </code>
                  <button
                    className={styles.passwordToggle}
                    onClick={() =>
                      setShowApiKey({
                        ...showApiKey,
                        [viewingApi.id]: !showApiKey[viewingApi.id],
                      })
                    }
                  >
                    {showApiKey[viewingApi.id] ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>
              {viewingApi.app_source && (
                <div className={styles.viewGroup}>
                  <label>App Source</label>
                  <div className={styles.viewValue}>{viewingApi.app_source}</div>
                </div>
              )}
              {viewingApi.description && (
                <div className={styles.viewGroup}>
                  <label>Description</label>
                  <div className={styles.viewValue}>{viewingApi.description}</div>
                </div>
              )}
              <div className={styles.viewGroup}>
                <label>Status</label>
                <div className={styles.viewValue}>
                  {(() => {
                    const statusDisplay = getStatusDisplay(viewingApi.status)
                    const StatusIcon = statusDisplay.icon
                    return (
                      <div
                        className={styles.statusBadge}
                        style={{ color: statusDisplay.color }}
                      >
                        <StatusIcon />
                        <span>{statusDisplay.label}</span>
                      </div>
                    )
                  })()}
                </div>
              </div>
              <div className={styles.viewGroup}>
                <label>Enabled</label>
                <div className={styles.viewValue}>{viewingApi.enabled ? 'Yes' : 'No'}</div>
              </div>
              {viewingApi.last_checked && (
                <div className={styles.viewGroup}>
                  <label>Last Checked</label>
                  <div className={styles.viewValue}>{formatDate(viewingApi.last_checked)}</div>
                </div>
              )}
              {viewingApi.created_at && (
                <div className={styles.viewGroup}>
                  <label>Created At</label>
                  <div className={styles.viewValue}>{formatDate(viewingApi.created_at)}</div>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelButton} onClick={() => setShowViewModal(false)}>
                Close
              </button>
              <button
                className={styles.saveButton}
                onClick={() => {
                  setShowViewModal(false)
                  handleOpenEditModal(viewingApi)
                }}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sync Modal */}
      {showSyncModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSyncModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Sync APIs</h2>
              <button className={styles.modalClose} onClick={() => setShowSyncModal(false)}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.syncDescription}>
                Import API configurations from other OneApp applications.
              </p>
              <div className={styles.syncOptions}>
                <div className={styles.syncOption}>
                  <div className={styles.syncOptionInfo}>
                    <h3>OneApp Data</h3>
                    <p>Import Supabase database API configuration</p>
                  </div>
                  <button
                    className={styles.syncButton}
                    onClick={() => handleSync('oneapp-data')}
                  >
                    Sync
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  )
}

