import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { allPages, categories, type PageInfo } from '@/data/pages'
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
  IconEye,
  IconInUse,
  IconIntegrated,
  IconOpenSource,
  IconAPI,
  IconServer,
  IconCode,
  IconDownload,
  IconCheckCircle,
  IconXCircle,
  IconPlay,
  IconStop,
  IconFolder,
  IconFile,
  IconCategory,
  IconFilter,
  IconMoreVertical,
  IconStatus,
  IconUpload,
  IconLink,
  IconGithub,
  IconCore,
  IconTools,
  IconSettings,
} from '@/components/Icons'
import { getIcon } from '@/utils/iconUtils'
import styles from './OneAppDeveloper.module.css'

type TabType = 'categories' | 'in-use' | 'integrated' | 'open-source'

interface IntegratedAppConfig {
  apiUrl?: string
  apiKey?: string
  connected: boolean
  lastChecked?: string
}

interface OpenSourceAppConfig {
  deployed: boolean
  deploymentStatus?: 'deployed' | 'deploying' | 'undeployed' | 'error'
  sourceUrl?: string
  sourcePath?: string
}

export function OneAppDeveloper() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [selectedApp, setSelectedApp] = useState<PageInfo | null>(null)
  const [showAppDetailModal, setShowAppDetailModal] = useState(false)
  const [openSourceSubTab, setOpenSourceSubTab] = useState<'deployment' | 'source'>('deployment')
  const [selectedOpenSourceApp, setSelectedOpenSourceApp] = useState<PageInfo | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [appToChangeStatus, setAppToChangeStatus] = useState<PageInfo | null>(null)
  const [showApiSettingModal, setShowApiSettingModal] = useState(false)
  const [appForApiSetting, setAppForApiSetting] = useState<PageInfo | null>(null)
  const [showManageAppModal, setShowManageAppModal] = useState(false)
  const [appForManageApp, setAppForManageApp] = useState<PageInfo | null>(null)
  const [manageAppSubTab, setManageAppSubTab] = useState<'deployment' | 'source'>('deployment')
  const [isEditMode, setIsEditMode] = useState(false)
  const [editFormData, setEditFormData] = useState<{
    description: string
    longDescription?: string
    image?: string
    category: string
  } | null>(null)

  // Mock data for integrated apps API configs
  const [integratedConfigs, setIntegratedConfigs] = useState<Record<string, IntegratedAppConfig>>({
    onlyapi: {
      apiUrl: 'https://api.example.com',
      apiKey: '••••••••••••',
      connected: true,
      lastChecked: '2024-01-15T10:30:00Z',
    },
  })

  // Mock data for open source apps configs
  const [openSourceConfigs, setOpenSourceConfigs] = useState<Record<string, OpenSourceAppConfig>>({
    modules: {
      deployed: true,
      deploymentStatus: 'deployed',
      sourceUrl: 'https://github.com/oneapp/modules',
      sourcePath: '/apps/modules',
    },
  })

  const inUseApps = allPages.filter((app) => app.appType === 'In use app')
  const integratedApps = allPages.filter((app) => app.appType === 'Integrated')
  const openSourceApps = allPages.filter((app) => app.appType === 'Open source')

  const filteredApps = (() => {
    let apps: PageInfo[] = []
    if (activeTab === 'in-use') apps = inUseApps
    else if (activeTab === 'integrated') apps = integratedApps
    else if (activeTab === 'open-source') apps = openSourceApps

    return apps.filter((app) => {
      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  })()

  // Reset selectedOpenSourceApp when switching away from open-source tab
  useEffect(() => {
    if (activeTab !== 'open-source') {
      setSelectedOpenSourceApp(null)
      setOpenSourceSubTab('deployment')
    }
  }, [activeTab])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (openDropdownId) {
        const dropdownElement = document.getElementById(`dropdown-${openDropdownId}`)
        const buttonElement = document.getElementById(`more-btn-${openDropdownId}`)
        if (
          dropdownElement &&
          !dropdownElement.contains(target) &&
          buttonElement &&
          !buttonElement.contains(target)
        ) {
          setOpenDropdownId(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdownId])

  const toggleDropdown = (appId: string) => {
    setOpenDropdownId(openDropdownId === appId ? null : appId)
  }

  const handleChangeStatusClick = (app: PageInfo) => {
    setOpenDropdownId(null)
    setAppToChangeStatus(app)
    setShowStatusModal(true)
  }

  const handleChangeStatus = (newStatus: 'Available' | 'Unavailable' | 'Coming soon') => {
    if (appToChangeStatus) {
      console.log(`Change ${appToChangeStatus.name} status to ${newStatus}`)
      // TODO: Implement status change functionality
    }
    setShowStatusModal(false)
    setAppToChangeStatus(null)
  }

  const handleViewDetail = (app: PageInfo) => {
    setSelectedApp(app)
    setIsEditMode(false)
    setEditFormData({
      description: app.description,
      longDescription: app.description, // Using description as long description for now
      image: app.image || '',
      category: app.category,
    })
    setShowAppDetailModal(true)
  }

  const handleSaveEdit = () => {
    if (selectedApp && editFormData) {
      console.log('Save app changes:', selectedApp.id, editFormData)
      // TODO: Implement save functionality
      setIsEditMode(false)
    }
  }

  const handleCancelEdit = () => {
    if (selectedApp) {
      setEditFormData({
        description: selectedApp.description,
        longDescription: selectedApp.description,
        image: selectedApp.image || '',
        category: selectedApp.category,
      })
    }
    setIsEditMode(false)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return 'N/A'
    }
  }

  const getAppTypeIcon = (appType: string) => {
    switch (appType) {
      case 'In use app':
        return IconInUse
      case 'Integrated':
        return IconIntegrated
      case 'Open source':
        return IconOpenSource
      default:
        return IconInUse
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Core':
        return IconCore
      case 'Tools':
        return IconTools
      case 'System':
        return IconSettings
      case 'Customization':
        return IconCategory
      default:
        return IconCategory
    }
  }

  const handleTestConnection = (appId: string) => {
    const config = integratedConfigs[appId]
    if (config) {
      // Simulate API test
      console.log('Testing API connection for:', appId)
      // Update last checked time
      setIntegratedConfigs({
        ...integratedConfigs,
        [appId]: {
          ...config,
          lastChecked: new Date().toISOString(),
        },
      })
    }
  }

  const handleDeploy = (appId: string) => {
    setOpenSourceConfigs({
      ...openSourceConfigs,
      [appId]: {
        ...openSourceConfigs[appId],
        deploymentStatus: 'deploying',
      },
    })
    // Simulate deployment
    setTimeout(() => {
      setOpenSourceConfigs({
        ...openSourceConfigs,
        [appId]: {
          ...openSourceConfigs[appId],
          deployed: true,
          deploymentStatus: 'deployed',
        },
      })
    }, 2000)
  }

  const handleUndeploy = (appId: string) => {
    setOpenSourceConfigs({
      ...openSourceConfigs,
      [appId]: {
        ...openSourceConfigs[appId],
        deployed: false,
        deploymentStatus: 'undeployed',
      },
    })
  }

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      console.log('Add category:', newCategoryName.trim())
      setNewCategoryName('')
      setShowAddCategory(false)
    }
  }

  const handleEditCategory = (category: string) => {
    setEditingCategory(category)
    setNewCategoryName(category)
  }

  const handleSaveCategory = () => {
    if (newCategoryName.trim() && editingCategory) {
      console.log('Update category:', editingCategory, '->', newCategoryName.trim())
      setEditingCategory(null)
      setNewCategoryName('')
    }
  }

  const handleDeleteCategory = (category: string) => {
    if (window.confirm(`Are you sure you want to delete category "${category}"?`)) {
      console.log('Delete category:', category)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return styles.statusAvailable
      case 'Unavailable':
        return styles.statusUnavailable
      case 'Coming soon':
        return styles.statusComingSoon
      default:
        return ''
    }
  }


  // Render Categories Tab
  const renderCategoriesTab = () => {
    const categoryList = categories.filter((cat) => cat !== 'All')
    return (
      <div className={styles.categoriesTab}>
        <div className={styles.sectionHeader}>
          <h2>Manage Categories</h2>
          <p className={styles.sectionDescription}>
            Create and manage categories to organize applications in the library.
          </p>
        </div>

        <div className={styles.categoriesList}>
          {categoryList.map((category) => (
            <div key={category} className={styles.categoryItem}>
              {editingCategory === category ? (
                <div className={styles.categoryEdit}>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveCategory()
                      if (e.key === 'Escape') {
                        setEditingCategory(null)
                        setNewCategoryName('')
                      }
                    }}
                    className={styles.categoryInput}
                    autoFocus
                  />
                  <button className={styles.saveButton} onClick={handleSaveCategory}>
                    Save
                  </button>
                  <button
                    className={styles.cancelButton}
                    onClick={() => {
                      setEditingCategory(null)
                      setNewCategoryName('')
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.categoryInfo}>
                    <IconCategory className={styles.categoryIcon} />
                    <span className={styles.categoryName}>{category}</span>
                    <span className={styles.categoryCount}>
                      {allPages.filter((p) => p.category === category).length} apps
                    </span>
                  </div>
                  <div className={styles.categoryActions}>
                    <button
                      className={styles.iconButton}
                      onClick={() => handleEditCategory(category)}
                      title="Edit"
                    >
                      <IconEdit />
                    </button>
                    <button
                      className={styles.iconButton}
                      onClick={() => handleDeleteCategory(category)}
                      title="Delete"
                    >
                      <IconTrash />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {showAddCategory ? (
            <div className={styles.addCategoryForm}>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCategory()
                  if (e.key === 'Escape') {
                    setShowAddCategory(false)
                    setNewCategoryName('')
                  }
                }}
                placeholder="Category name"
                className={styles.categoryInput}
                autoFocus
              />
              <button className={styles.saveButton} onClick={handleAddCategory}>
                Add
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setShowAddCategory(false)
                  setNewCategoryName('')
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button className={styles.addCategoryButton} onClick={() => setShowAddCategory(true)}>
              <IconPlus />
              <span>Add Category</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  // Render In Use Apps Tab
  const renderInUseAppsTab = () => {
    return (
      <div className={styles.appsTab}>
        <div className={styles.sectionHeader}>
          <h2>In Use Apps</h2>
          <p className={styles.sectionDescription}>
            Apps implemented directly in this project. Only developers with source code access can manage these.
          </p>
        </div>

        {filteredApps.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No in-use apps found matching your criteria.</p>
          </div>
        ) : (
          <div className={styles.appsList}>
            {filteredApps.map((app) => {
              const Icon = getIcon(app.icon)
              const isDropdownOpen = openDropdownId === app.id
              return (
                <div
                  key={app.id}
                  className={styles.appListItem}
                  onClick={() => handleViewDetail(app)}
                >
                  <div className={styles.appListItemContent}>
                    <div className={styles.appCell}>
                      <div className={styles.appAvatar}>
                        <Icon />
                      </div>
                      <div className={styles.appInfo}>
                        <div className={styles.appName}>{app.name}</div>
                        <div className={styles.appDescription}>{app.description}</div>
                      </div>
                    </div>
                    <div className={styles.appListItemMeta}>
                      <span className={styles.categoryBadge}>{app.category}</span>
                      <span className={`${styles.statusBadge} ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                  <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
                    <button
                      id={`more-btn-${app.id}`}
                      className={styles.moreButton}
                      onClick={() => toggleDropdown(app.id)}
                      title="More options"
                    >
                      <IconMoreVertical />
                    </button>
                    {isDropdownOpen && (
                      <div id={`dropdown-${app.id}`} className={styles.dropdownMenu}>
                        <button
                          className={styles.dropdownItem}
                          onClick={() => {
                            handleViewDetail(app)
                            setOpenDropdownId(null)
                          }}
                        >
                          <IconEye />
                          <span>Detail</span>
                        </button>
                        <button
                          className={styles.dropdownItem}
                          onClick={() => handleChangeStatusClick(app)}
                        >
                          <IconStatus />
                          <span>Change Status</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Render Integrated Apps Tab
  const renderIntegratedAppsTab = () => {
    return (
      <div className={styles.appsTab}>
        <div className={styles.sectionHeader}>
          <h2>Integrated Apps</h2>
          <p className={styles.sectionDescription}>
            Apps integrated via API. Manage API credentials and test connections.
          </p>
        </div>

        {filteredApps.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No integrated apps found matching your criteria.</p>
          </div>
        ) : (
          <div className={styles.appsList}>
            {filteredApps.map((app) => {
              const Icon = getIcon(app.icon)
              const config = integratedConfigs[app.id] || {
                connected: false,
                apiUrl: '',
                apiKey: '',
              }
              const isDropdownOpen = openDropdownId === app.id
              return (
                <div
                  key={app.id}
                  className={styles.appListItem}
                  onClick={() => handleViewDetail(app)}
                >
                  <div className={styles.appListItemContent}>
                    <div className={styles.appCell}>
                      <div className={styles.appAvatar}>
                        <Icon />
                      </div>
                      <div className={styles.appInfo}>
                        <div className={styles.appName}>{app.name}</div>
                        <div className={styles.appDescription}>{app.description}</div>
                      </div>
                    </div>
                    <div className={styles.appListItemMeta}>
                      <span className={styles.categoryBadge}>{app.category}</span>
                      <div className={styles.connectionStatus}>
                        {config.connected ? (
                          <>
                            <IconCheckCircle className={styles.connectedIcon} />
                            <span className={styles.connectedText}>Connected</span>
                          </>
                        ) : (
                          <>
                            <IconXCircle className={styles.disconnectedIcon} />
                            <span className={styles.disconnectedText}>Not Connected</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
                    <button
                      id={`more-btn-${app.id}`}
                      className={styles.moreButton}
                      onClick={() => toggleDropdown(app.id)}
                      title="More options"
                    >
                      <IconMoreVertical />
                    </button>
                    {isDropdownOpen && (
                      <div id={`dropdown-${app.id}`} className={styles.dropdownMenu}>
                        <button
                          className={styles.dropdownItem}
                          onClick={() => {
                            handleViewDetail(app)
                            setOpenDropdownId(null)
                          }}
                        >
                          <IconEye />
                          <span>Detail</span>
                        </button>
                        <button
                          className={styles.dropdownItem}
                          onClick={() => handleChangeStatusClick(app)}
                        >
                          <IconStatus />
                          <span>Change Status</span>
                        </button>
                        <button
                          className={styles.dropdownItem}
                          onClick={() => {
                            setAppForApiSetting(app)
                            setShowApiSettingModal(true)
                            setOpenDropdownId(null)
                          }}
                        >
                          <IconAPI />
                          <span>API Setting</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Render Open Source Apps Tab
  const renderOpenSourceAppsTab = () => {
    return (
      <div className={styles.appsTab}>
        <div className={styles.sectionHeader}>
          <h2>Open Source Apps</h2>
          <p className={styles.sectionDescription}>
            Manage deployment and source code for open source applications.
          </p>
        </div>

        {selectedOpenSourceApp ? (
          <div className={styles.appDetailView}>
            <button
              className={styles.backButton}
              onClick={() => {
                setSelectedOpenSourceApp(null)
                setOpenSourceSubTab('deployment')
              }}
            >
              ← Back to List
            </button>
            <div className={styles.subTabs}>
              <button
                className={`${styles.subTab} ${openSourceSubTab === 'deployment' ? styles.active : ''}`}
                onClick={() => setOpenSourceSubTab('deployment')}
              >
                <IconServer />
                <span>Deployment</span>
              </button>
              <button
                className={`${styles.subTab} ${openSourceSubTab === 'source' ? styles.active : ''}`}
                onClick={() => setOpenSourceSubTab('source')}
              >
                <IconCode />
                <span>Source</span>
              </button>
            </div>

            {openSourceSubTab === 'deployment' && (
              <div className={styles.deploymentView}>
                <div className={styles.deploymentStatus}>
                  <h3>Deployment Status</h3>
                  {(() => {
                    const config = openSourceConfigs[selectedOpenSourceApp.id] || {
                      deployed: false,
                      deploymentStatus: 'undeployed',
                    }
                    return (
                      <div className={styles.statusCard}>
                        <div className={styles.statusHeader}>
                          {config.deployed ? (
                            <>
                              <IconCheckCircle className={styles.statusIconSuccess} />
                              <span className={styles.statusTextSuccess}>Deployed</span>
                            </>
                          ) : (
                            <>
                              <IconXCircle className={styles.statusIconError} />
                              <span className={styles.statusTextError}>Not Deployed</span>
                            </>
                          )}
                        </div>
                        {config.deploymentStatus === 'deploying' && (
                          <p className={styles.deployingText}>Deployment in progress...</p>
                        )}
                        <div className={styles.deploymentActions}>
                          {!config.deployed ? (
                            <button
                              className={styles.deployButton}
                              onClick={() => handleDeploy(selectedOpenSourceApp.id)}
                            >
                              <IconPlay />
                              <span>Deploy App</span>
                            </button>
                          ) : (
                            <button
                              className={styles.undeployButton}
                              onClick={() => handleUndeploy(selectedOpenSourceApp.id)}
                            >
                              <IconStop />
                              <span>Undeploy App</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}

            {openSourceSubTab === 'source' && (
              <div className={styles.sourceView}>
                <div className={styles.sourceInfo}>
                  {selectedOpenSourceApp.sourceCodeUrl && (
                    <div className={styles.sourceField}>
                      <span className={styles.sourceLabel}>Source URL:</span>
                      <a
                        href={selectedOpenSourceApp.sourceCodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.sourceLink}
                      >
                        {selectedOpenSourceApp.sourceCodeUrl}
                      </a>
                    </div>
                  )}
                  <div className={styles.sourceActions}>
                    <button className={styles.downloadButton}>
                      <IconDownload />
                      <span>Download Source (ZIP)</span>
                    </button>
                  </div>
                </div>
                <div className={styles.fileBrowser}>
                  <h3>Source Files</h3>
                  <div className={styles.fileTree}>
                    <div className={styles.fileItem}>
                      <IconFolder />
                      <span>src</span>
                    </div>
                    <div className={styles.fileItem} style={{ marginLeft: '20px' }}>
                      <IconFile />
                      <span>index.tsx</span>
                    </div>
                    <div className={styles.fileItem} style={{ marginLeft: '20px' }}>
                      <IconFile />
                      <span>App.tsx</span>
                    </div>
                    <div className={styles.fileItem} style={{ marginLeft: '20px' }}>
                      <IconFile />
                      <span>styles.module.css</span>
                    </div>
                    <div className={styles.fileItem}>
                      <IconFile />
                      <span>package.json</span>
                    </div>
                    <div className={styles.fileItem}>
                      <IconFile />
                      <span>README.md</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {filteredApps.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No open source apps found matching your criteria.</p>
              </div>
            ) : (
              <div className={styles.appsList}>
                {filteredApps.map((app) => {
                  const Icon = getIcon(app.icon)
                  const config = openSourceConfigs[app.id] || {
                    deployed: false,
                    deploymentStatus: 'undeployed',
                  }
                  const isDropdownOpen = openDropdownId === app.id
                  return (
                    <div
                      key={app.id}
                      className={styles.appListItem}
                      onClick={() => handleViewDetail(app)}
                    >
                      <div className={styles.appListItemContent}>
                        <div className={styles.appCell}>
                          <div className={styles.appAvatar}>
                            <Icon />
                          </div>
                          <div className={styles.appInfo}>
                            <div className={styles.appName}>{app.name}</div>
                            <div className={styles.appDescription}>{app.description}</div>
                          </div>
                        </div>
                        <div className={styles.appListItemMeta}>
                          <span className={styles.categoryBadge}>{app.category}</span>
                          <div className={styles.deploymentBadge}>
                            {config.deployed ? (
                              <>
                                <IconCheckCircle className={styles.deployedIcon} />
                                <span>Deployed</span>
                              </>
                            ) : (
                              <>
                                <IconXCircle className={styles.undeployedIcon} />
                                <span>Not Deployed</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
                        <button
                          id={`more-btn-${app.id}`}
                          className={styles.moreButton}
                          onClick={() => toggleDropdown(app.id)}
                          title="More options"
                        >
                          <IconMoreVertical />
                        </button>
                        {isDropdownOpen && (
                          <div id={`dropdown-${app.id}`} className={styles.dropdownMenu}>
                            <button
                              className={styles.dropdownItem}
                              onClick={() => {
                                handleViewDetail(app)
                                setOpenDropdownId(null)
                              }}
                            >
                              <IconEye />
                              <span>Detail</span>
                            </button>
                            <button
                              className={styles.dropdownItem}
                              onClick={() => handleChangeStatusClick(app)}
                            >
                              <IconStatus />
                              <span>Change Status</span>
                            </button>
                            <button
                              className={styles.dropdownItem}
                              onClick={() => {
                                setAppForManageApp(app)
                                setManageAppSubTab('deployment')
                                setShowManageAppModal(true)
                                setOpenDropdownId(null)
                              }}
                            >
                              <IconServer />
                              <span>Manage App</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className={styles.developer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>OneApp Developer</h1>
          <p className={styles.subtitle}>Manage categories and applications in the library</p>
        </div>
        {activeTab !== 'categories' && (
          <button className={styles.addButton} onClick={() => setShowAddModal(true)}>
            <IconPlus />
            <span>Add New App</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'categories' ? styles.active : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <IconCategory />
          <span>Categories</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'in-use' ? styles.active : ''}`}
          onClick={() => setActiveTab('in-use')}
        >
          <IconInUse />
          <span>In Use Apps</span>
          <span className={styles.tabBadge}>{inUseApps.length}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'integrated' ? styles.active : ''}`}
          onClick={() => setActiveTab('integrated')}
        >
          <IconIntegrated />
          <span>Integrated</span>
          <span className={styles.tabBadge}>{integratedApps.length}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'open-source' ? styles.active : ''}`}
          onClick={() => setActiveTab('open-source')}
        >
          <IconOpenSource />
          <span>Open Source</span>
          <span className={styles.tabBadge}>{openSourceApps.length}</span>
        </button>
      </div>

      {/* Search and Filter */}
      {activeTab !== 'categories' && (
        <div className={styles.controls}>
          <div className={styles.searchAndFilterRow}>
            <div className={styles.searchContainer}>
              <IconSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button
              className={`${styles.filterIconButton} ${showFilters ? styles.active : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              title="Toggle filters"
            >
              <IconFilter />
              {selectedCategory !== 'All' && <span className={styles.filterBadge}>1</span>}
            </button>
          </div>
          {showFilters && (
            <div className={styles.filterContainer}>
              {categories.map((category) => (
                <button
                  key={category}
                  className={`${styles.filterButton} ${selectedCategory === category ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        {activeTab === 'categories' && renderCategoriesTab()}
        {activeTab === 'in-use' && renderInUseAppsTab()}
        {activeTab === 'integrated' && renderIntegratedAppsTab()}
        {activeTab === 'open-source' && renderOpenSourceAppsTab()}
      </div>

      {/* Add App Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Add New App</h2>
              <button className={styles.modalClose} onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p>App creation form will be implemented here.</p>
              <p className={styles.modalHint}>This is a sample UI. Full functionality will be added later.</p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalButtonSecondary} onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className={styles.modalButtonPrimary} onClick={() => setShowAddModal(false)}>
                Create App
              </button>
            </div>
          </div>
        </div>
      )}

      {/* App Detail/Edit Modal */}
      {showAppDetailModal && selectedApp && editFormData && (
        <div className={styles.modalOverlay} onClick={() => setShowAppDetailModal(false)}>
          <div className={`${styles.modalContent} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedApp.name}</h2>
              <div className={styles.modalHeaderActions}>
                {!isEditMode && (
                  <>
                    {selectedApp.appType === 'Integrated' && (
                      <button
                        className={styles.headerActionButton}
                        onClick={() => {
                          setShowAppDetailModal(false)
                          setAppForApiSetting(selectedApp)
                          setShowApiSettingModal(true)
                        }}
                        title="API Setting"
                      >
                        <IconAPI />
                        <span>API Setting</span>
                      </button>
                    )}
                    {selectedApp.appType === 'Open source' && (
                      <>
                        <button
                          className={styles.headerActionButton}
                          onClick={() => {
                            setShowAppDetailModal(false)
                            setAppForManageApp(selectedApp)
                            setManageAppSubTab('deployment')
                            setShowManageAppModal(true)
                          }}
                          title="Manage App"
                        >
                          <IconServer />
                          <span>Manage App</span>
                        </button>
                        {selectedApp.sourceCodeUrl && (
                          <button
                            className={styles.headerActionButton}
                            onClick={() => {
                              if (selectedApp.sourceCodeUrl) {
                                window.open(selectedApp.sourceCodeUrl, '_blank')
                              }
                            }}
                            title="Download Source"
                          >
                            <IconDownload />
                            <span>Download Source</span>
                          </button>
                        )}
                      </>
                    )}
                    <button
                      className={styles.editButton}
                      onClick={() => setIsEditMode(true)}
                      title="Edit App"
                    >
                      <IconEdit />
                      <span>Edit</span>
                    </button>
                    {(() => {
                      // Check if app can be opened
                      let canOpenApp = true
                      let openAppDisabled = false
                      let openAppTitle = 'Open App'

                      if (selectedApp.appType === 'Integrated') {
                        const config = integratedConfigs[selectedApp.id] || { connected: false }
                        canOpenApp = config.connected
                        openAppDisabled = !config.connected
                        openAppTitle = config.connected ? 'Open App' : 'App not connected'
                      } else if (selectedApp.appType === 'Open source') {
                        const config = openSourceConfigs[selectedApp.id] || { deployed: false }
                        canOpenApp = config.deployed
                        openAppDisabled = !config.deployed
                        openAppTitle = config.deployed ? 'Open App' : 'App not deployed'
                      }

                      return (
                        <button
                          className={`${styles.openAppButton} ${openAppDisabled ? styles.disabled : ''}`}
                          onClick={() => {
                            if (canOpenApp && selectedApp.status === 'Available' && selectedApp.enabled) {
                              navigate(selectedApp.path)
                            }
                          }}
                          disabled={openAppDisabled || selectedApp.status !== 'Available' || !selectedApp.enabled}
                          title={openAppDisabled ? openAppTitle : 'Open App'}
                        >
                          <span>Open App</span>
                        </button>
                      )
                    })()}
                  </>
                )}
                <button className={styles.modalClose} onClick={() => setShowAppDetailModal(false)}>×</button>
              </div>
            </div>
            <div className={styles.modalBody}>
              {isEditMode ? (
                <div className={styles.editForm}>
                  <div className={styles.formGroup}>
                    <label>Short Description</label>
                    <textarea
                      rows={3}
                      placeholder="Brief description of the app"
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, description: e.target.value })
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Long Description</label>
                    <textarea
                      rows={6}
                      placeholder="Detailed description of the app, features, and usage"
                      value={editFormData.longDescription || ''}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, longDescription: e.target.value })
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>App Image URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/image.png"
                      value={editFormData.image || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, image: e.target.value })}
                    />
                    {editFormData.image && (
                      <div className={styles.imagePreview}>
                        <img src={editFormData.image} alt="Preview" onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }} />
                      </div>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <label>Category</label>
                    <select
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    >
                      {categories
                        .filter((cat) => cat !== 'All')
                        .map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className={styles.appDetailView}>
                  <div className={styles.detailHeader}>
                    <div className={styles.detailAppIcon}>
                      {(() => {
                        const Icon = getIcon(selectedApp.icon)
                        return <Icon />
                      })()}
                    </div>
                    <div className={styles.detailAppInfo}>
                      <h3 className={styles.detailAppName}>{selectedApp.name}</h3>
                      <p className={styles.detailAppDescription}>{selectedApp.description}</p>
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h4 className={styles.detailSectionTitle}>Description</h4>
                    <p className={styles.detailSectionText}>
                      {editFormData.longDescription || selectedApp.description}
                    </p>
                  </div>

                  {selectedApp.image && (
                    <div className={styles.detailSection}>
                      <h4 className={styles.detailSectionTitle}>App Image</h4>
                      <div className={styles.detailImageContainer}>
                        <img src={selectedApp.image} alt={selectedApp.name} />
                      </div>
                    </div>
                  )}

                  <div className={styles.detailSection}>
                    <h4 className={styles.detailSectionTitle}>App Type</h4>
                    <div className={styles.detailInfoRow}>
                      {(() => {
                        const TypeIcon = getAppTypeIcon(selectedApp.appType)
                        return (
                          <>
                            <TypeIcon className={styles.detailIcon} />
                            <span>{selectedApp.appType}</span>
                          </>
                        )
                      })()}
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h4 className={styles.detailSectionTitle}>Category</h4>
                    <div className={styles.detailInfoRow}>
                      {(() => {
                        const CategoryIcon = getCategoryIcon(selectedApp.category)
                        return (
                          <>
                            <CategoryIcon className={styles.detailIcon} />
                            <span>{selectedApp.category}</span>
                          </>
                        )
                      })()}
                    </div>
                  </div>

                  <div className={styles.detailSection}>
                    <h4 className={styles.detailSectionTitle}>App Information</h4>
                    <div className={styles.detailInfoList}>
                      {selectedApp.publisher && (
                        <div className={styles.detailInfoItem}>
                          <span className={styles.detailInfoLabel}>Publisher:</span>
                          <span className={styles.detailInfoValue}>{selectedApp.publisher}</span>
                        </div>
                      )}
                      {selectedApp.developer && (
                        <div className={styles.detailInfoItem}>
                          <span className={styles.detailInfoLabel}>Developer:</span>
                          <span className={styles.detailInfoValue}>{selectedApp.developer}</span>
                        </div>
                      )}
                      {selectedApp.appSize && (
                        <div className={styles.detailInfoItem}>
                          <span className={styles.detailInfoLabel}>App Size:</span>
                          <span className={styles.detailInfoValue}>{selectedApp.appSize}</span>
                        </div>
                      )}
                      {selectedApp.createDate && (
                        <div className={styles.detailInfoItem}>
                          <span className={styles.detailInfoLabel}>Created:</span>
                          <span className={styles.detailInfoValue}>{formatDate(selectedApp.createDate)}</span>
                        </div>
                      )}
                      {selectedApp.publishDate && (
                        <div className={styles.detailInfoItem}>
                          <span className={styles.detailInfoLabel}>Published:</span>
                          <span className={styles.detailInfoValue}>{formatDate(selectedApp.publishDate)}</span>
                        </div>
                      )}
                      <div className={styles.detailInfoItem}>
                        <span className={styles.detailInfoLabel}>Status:</span>
                        <span
                          className={`${styles.statusBadge} ${getStatusColor(selectedApp.status)}`}
                        >
                          {selectedApp.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              {isEditMode ? (
                <>
                  <button className={styles.modalButtonSecondary} onClick={handleCancelEdit}>
                    Cancel
                  </button>
                  <button className={styles.modalButtonPrimary} onClick={handleSaveEdit}>
                    Save Changes
                  </button>
                </>
              ) : (
                <button className={styles.modalButtonSecondary} onClick={() => setShowAppDetailModal(false)}>
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {showStatusModal && appToChangeStatus && (
        <div className={styles.modalOverlay} onClick={() => setShowStatusModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Change Status - {appToChangeStatus.name}</h2>
              <button className={styles.modalClose} onClick={() => setShowStatusModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.statusOptions}>
                <button
                  className={`${styles.statusOption} ${appToChangeStatus.status === 'Available' ? styles.active : ''}`}
                  onClick={() => handleChangeStatus('Available')}
                >
                  <div className={styles.statusOptionHeader}>
                    <span className={styles.statusOptionTitle}>Available</span>
                    {appToChangeStatus.status === 'Available' && (
                      <IconCheckCircle className={styles.statusOptionCheck} />
                    )}
                  </div>
                  <p className={styles.statusOptionDescription}>
                    App will appear in the library and be accessible to users.
                  </p>
                </button>
                <button
                  className={`${styles.statusOption} ${appToChangeStatus.status === 'Unavailable' ? styles.active : ''}`}
                  onClick={() => handleChangeStatus('Unavailable')}
                >
                  <div className={styles.statusOptionHeader}>
                    <span className={styles.statusOptionTitle}>Inactive</span>
                    {appToChangeStatus.status === 'Unavailable' && (
                      <IconCheckCircle className={styles.statusOptionCheck} />
                    )}
                  </div>
                  <p className={styles.statusOptionDescription}>
                    App won't appear in library. Hidden from users.
                  </p>
                </button>
                <button
                  className={`${styles.statusOption} ${appToChangeStatus.status === 'Coming soon' ? styles.active : ''}`}
                  onClick={() => handleChangeStatus('Coming soon')}
                >
                  <div className={styles.statusOptionHeader}>
                    <span className={styles.statusOptionTitle}>Developing</span>
                    {appToChangeStatus.status === 'Coming soon' && (
                      <IconCheckCircle className={styles.statusOptionCheck} />
                    )}
                  </div>
                  <p className={styles.statusOptionDescription}>
                    App will appear in the upcoming section of the library.
                  </p>
                </button>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalButtonSecondary} onClick={() => setShowStatusModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Setting Modal */}
      {showApiSettingModal && appForApiSetting && (
        <div className={styles.modalOverlay} onClick={() => setShowApiSettingModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>API Setting - {appForApiSetting.name}</h2>
              <button className={styles.modalClose} onClick={() => setShowApiSettingModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.apiManagement}>
                <div className={styles.connectionCheck}>
                  <h3>Connection Status</h3>
                  {(() => {
                    const config = integratedConfigs[appForApiSetting.id] || {
                      connected: false,
                      apiUrl: '',
                      apiKey: '',
                    }
                    return (
                      <div className={styles.connectionStatusCard}>
                        {config.connected ? (
                          <>
                            <IconCheckCircle className={styles.statusIconSuccess} />
                            <span className={styles.statusTextSuccess}>Connected</span>
                          </>
                        ) : (
                          <>
                            <IconXCircle className={styles.statusIconError} />
                            <span className={styles.statusTextError}>Not Connected</span>
                          </>
                        )}
                        <button
                          className={styles.testButton}
                          onClick={() => handleTestConnection(appForApiSetting.id)}
                        >
                          <IconCheckCircle />
                          <span>Check Connection</span>
                        </button>
                      </div>
                    )
                  })()}
                </div>
                <div className={styles.formGroup}>
                  <label>API URL</label>
                  <input
                    type="text"
                    placeholder="https://api.example.com"
                    defaultValue={integratedConfigs[appForApiSetting.id]?.apiUrl || ''}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>API Key</label>
                  <input
                    type="password"
                    placeholder="Enter API key"
                    defaultValue={integratedConfigs[appForApiSetting.id]?.apiKey || ''}
                  />
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalButtonSecondary} onClick={() => setShowApiSettingModal(false)}>
                Cancel
              </button>
              <button className={styles.modalButtonPrimary} onClick={() => setShowApiSettingModal(false)}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage App Modal (Open Source) */}
      {showManageAppModal && appForManageApp && (
        <div className={styles.modalOverlay} onClick={() => setShowManageAppModal(false)}>
          <div className={`${styles.modalContent} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Manage App - {appForManageApp.name}</h2>
              <button className={styles.modalClose} onClick={() => setShowManageAppModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.subTabs}>
                <button
                  className={`${styles.subTab} ${manageAppSubTab === 'deployment' ? styles.active : ''}`}
                  onClick={() => setManageAppSubTab('deployment')}
                >
                  <IconServer />
                  <span>Deployment</span>
                </button>
                <button
                  className={`${styles.subTab} ${manageAppSubTab === 'source' ? styles.active : ''}`}
                  onClick={() => setManageAppSubTab('source')}
                >
                  <IconCode />
                  <span>Source</span>
                </button>
              </div>

              {manageAppSubTab === 'deployment' && (
                <div className={styles.deploymentView}>
                  <div className={styles.deploymentStatus}>
                    <h3>Deployment Status</h3>
                    {(() => {
                      const config = openSourceConfigs[appForManageApp.id] || {
                        deployed: false,
                        deploymentStatus: 'undeployed',
                      }
                      return (
                        <div className={styles.statusCard}>
                          <div className={styles.statusHeader}>
                            {config.deployed ? (
                              <>
                                <IconCheckCircle className={styles.statusIconSuccess} />
                                <span className={styles.statusTextSuccess}>Deployed</span>
                              </>
                            ) : (
                              <>
                                <IconXCircle className={styles.statusIconError} />
                                <span className={styles.statusTextError}>Not Deployed</span>
                              </>
                            )}
                          </div>
                          {config.deploymentStatus === 'deploying' && (
                            <p className={styles.deployingText}>Deployment in progress...</p>
                          )}
                          <div className={styles.deploymentActions}>
                            {!config.deployed ? (
                              <button
                                className={styles.deployButton}
                                onClick={() => handleDeploy(appForManageApp.id)}
                              >
                                <IconPlay />
                                <span>Deploy App</span>
                              </button>
                            ) : (
                              <button
                                className={styles.undeployButton}
                                onClick={() => handleUndeploy(appForManageApp.id)}
                              >
                                <IconStop />
                                <span>Undeploy App</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              )}

              {manageAppSubTab === 'source' && (
                <div className={styles.sourceView}>
                  <div className={styles.sourceInfo}>
                    <div className={styles.formGroup}>
                      <label>Source URL</label>
                      <div className={styles.sourceUrlInput}>
                        <input
                          type="text"
                          placeholder="https://github.com/user/repo"
                          defaultValue={appForManageApp.sourceCodeUrl || ''}
                        />
                        <button className={styles.iconButton}>
                          <IconLink />
                        </button>
                      </div>
                    </div>
                    <div className={styles.uploadSection}>
                      <h3>Upload Source</h3>
                      <div className={styles.uploadOptions}>
                        <button className={styles.uploadButton}>
                          <IconUpload />
                          <span>Upload from Device</span>
                        </button>
                        <button className={styles.uploadButton}>
                          <IconGithub />
                          <span>Import from GitHub</span>
                        </button>
                      </div>
                    </div>
                    <div className={styles.sourceActions}>
                      <button className={styles.downloadButton}>
                        <IconDownload />
                        <span>Download Source (ZIP)</span>
                      </button>
                    </div>
                  </div>
                  <div className={styles.fileBrowser}>
                    <h3>Source Files</h3>
                    <div className={styles.fileTree}>
                      <div className={styles.fileItem}>
                        <IconFolder />
                        <span>src</span>
                      </div>
                      <div className={styles.fileItem} style={{ marginLeft: '20px' }}>
                        <IconFile />
                        <span>index.tsx</span>
                      </div>
                      <div className={styles.fileItem} style={{ marginLeft: '20px' }}>
                        <IconFile />
                        <span>App.tsx</span>
                      </div>
                      <div className={styles.fileItem} style={{ marginLeft: '20px' }}>
                        <IconFile />
                        <span>styles.module.css</span>
                      </div>
                      <div className={styles.fileItem}>
                        <IconFile />
                        <span>package.json</span>
                      </div>
                      <div className={styles.fileItem}>
                        <IconFile />
                        <span>README.md</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalButtonSecondary} onClick={() => setShowManageAppModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
