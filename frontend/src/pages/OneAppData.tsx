import { useState } from 'react'
import {
  IconDatabase,
  IconCode,
  IconDownload,
  IconCopy,
  IconTable,
  IconCheckCircle,
  IconXCircle,
  IconAPI,
  IconExternalLink,
  IconServer,
  IconChevronDown,
  IconChevronUp,
  IconMaximize,
  IconMinimize,
} from '@/components/Icons'
import styles from './OneAppData.module.css'

type DatabaseType = 'oneapp' | 'shared'

type SchemaViewMode = 'list' | 'sql'

interface Table {
  name: string
  fields: Array<{
    name: string
    type: string
    required: boolean
    description?: string
  }>
}

interface DatabaseSchema {
  tables: Table[]
}

interface SharedDatabaseConfig {
  tool: string
  apiUrl: string
  apiKey: string
  connected: boolean
  toolUrl?: string
}

const oneAppSchema: DatabaseSchema = {
  tables: [
    {
      name: 'in_use_app',
      fields: [
        { name: '_id', type: 'ObjectId', required: true, description: 'Unique identifier' },
        { name: 'id', type: 'String', required: true, description: 'Application ID (unique)' },
        { name: 'name', type: 'String', required: true, description: 'Application name' },
        { name: 'description', type: 'String', required: true, description: 'Application description' },
        { name: 'shortDescription', type: 'String', required: false, description: 'Short description for cards' },
        { name: 'path', type: 'String', required: true, description: 'Application route path' },
        { name: 'icon', type: 'String', required: true, description: 'Icon component name' },
        { name: 'category', type: 'String', required: true, description: 'Application category' },
        { name: 'tags', type: 'Array', required: false, description: 'Application tags' },
        { name: 'enabled', type: 'Boolean', required: true, description: 'Is application enabled' },
        { name: 'featured', type: 'Boolean', required: false, description: 'Is application featured' },
        { name: 'status', type: 'String', required: true, description: 'Application status (Available, Unavailable, Coming soon)' },
        { name: 'appType', type: 'String', required: true, description: 'Application type (In use app, Integrated, etc.)' },
        { name: 'appTypeCategory', type: 'String', required: false, description: 'App type category (OneApp System, Convenience Tool)' },
        { name: 'homeSection', type: 'String', required: false, description: 'Home section name' },
        { name: 'createDate', type: 'Date', required: false, description: 'Creation date' },
        { name: 'developer', type: 'String', required: false, description: 'Developer/author name' },
        { name: 'publishDate', type: 'Date', required: false, description: 'Publication date' },
        { name: 'managementStatus', type: 'String', required: false, description: 'Management status (active, inactive)' },
        { name: 'image', type: 'String', required: false, description: 'App image URL' },
        { name: 'publisher', type: 'String', required: false, description: 'Publisher name' },
        { name: 'appSize', type: 'String', required: false, description: 'App size (e.g., "2.5 MB")' },
        { name: 'sourceCodeUrl', type: 'String', required: false, description: 'Source code repository URL' },
        { name: 'createdAt', type: 'Date', required: true, description: 'Record creation timestamp' },
        { name: 'updatedAt', type: 'Date', required: true, description: 'Last update timestamp' },
      ],
    },
    {
      name: 'categories',
      fields: [
        { name: '_id', type: 'ObjectId', required: true, description: 'Unique identifier' },
        { name: 'name', type: 'String', required: true, description: 'Category name' },
        { name: 'slug', type: 'String', required: true, description: 'Category slug (URL-friendly)' },
        { name: 'description', type: 'String', required: false, description: 'Category description' },
        { name: 'icon', type: 'String', required: false, description: 'Category icon name' },
        { name: 'color', type: 'String', required: false, description: 'Category color (hex code)' },
        { name: 'parentId', type: 'ObjectId', required: false, description: 'Parent category ID (for nested categories)' },
        { name: 'level', type: 'Number', required: false, description: 'Category hierarchy level' },
        { name: 'status', type: 'String', required: true, description: 'Category status (active, inactive)' },
        { name: 'isFeatured', type: 'Boolean', required: false, description: 'Is category featured' },
        { name: 'appCount', type: 'Number', required: false, description: 'Number of apps in this category' },
        { name: 'createdAt', type: 'Date', required: true, description: 'Category creation date' },
        { name: 'updatedAt', type: 'Date', required: true, description: 'Last update date' },
      ],
    },
  ],
}

const sharedSchema: DatabaseSchema = {
  tables: [
    {
      name: 'notifications',
      fields: [
        { name: '_id', type: 'ObjectId', required: true, description: 'Unique identifier' },
        { name: 'userId', type: 'ObjectId', required: true, description: 'User ID' },
        { name: 'title', type: 'String', required: true, description: 'Notification title' },
        { name: 'message', type: 'String', required: true, description: 'Notification message' },
        { name: 'read', type: 'Boolean', required: true, description: 'Is notification read' },
        { name: 'createdAt', type: 'Date', required: true, description: 'Creation date' },
      ],
    },
    {
      name: 'analytics',
      fields: [
        { name: '_id', type: 'ObjectId', required: true, description: 'Unique identifier' },
        { name: 'event', type: 'String', required: true, description: 'Event name' },
        { name: 'userId', type: 'ObjectId', required: false, description: 'User ID' },
        { name: 'data', type: 'Object', required: false, description: 'Event data' },
        { name: 'timestamp', type: 'Date', required: true, description: 'Event timestamp' },
      ],
    },
  ],
}

// Mock table data
const mockTableData: Record<string, any[]> = {
  in_use_app: [
    {
      _id: '1',
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Overview of your workspace and quick access to key features',
      path: '/',
      icon: 'IconDashboard',
      category: 'Core',
      enabled: true,
      status: 'Available',
      appType: 'In use app',
      createDate: '2024-01-15',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    },
    {
      _id: '2',
      id: 'oneapp-developer',
      name: 'OneApp Developer',
      description: 'Manage apps that appear in the library',
      path: '/oneapp-developer',
      icon: 'IconDeveloper',
      category: 'Core',
      enabled: true,
      status: 'Available',
      appType: 'In use app',
      createDate: '2024-01-10',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10',
    },
    {
      _id: '3',
      id: 'oneapp-data',
      name: 'OneApp Data',
      description: 'Manage data types, data structures, and database schemas',
      path: '/oneapp-data',
      icon: 'IconDatabase',
      category: 'Core',
      enabled: true,
      status: 'Available',
      appType: 'In use app',
      createDate: '2024-01-10',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10',
    },
  ],
  categories: [
    {
      _id: '1',
      name: 'Core',
      slug: 'core',
      description: 'Core system applications',
      icon: 'IconCore',
      color: '#3B82F6',
      status: 'active',
      isFeatured: true,
      appCount: 5,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      _id: '2',
      name: 'Tools',
      slug: 'tools',
      description: 'Utility and tool applications',
      icon: 'IconTools',
      color: '#10B981',
      status: 'active',
      isFeatured: false,
      appCount: 3,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      _id: '3',
      name: 'System',
      slug: 'system',
      description: 'System administration applications',
      icon: 'IconSettings',
      color: '#8B5CF6',
      status: 'active',
      isFeatured: false,
      appCount: 2,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      _id: '4',
      name: 'Customization',
      slug: 'customization',
      description: 'Customization and theme applications',
      icon: 'IconInterface',
      color: '#F59E0B',
      status: 'active',
      isFeatured: false,
      appCount: 2,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ],
}

export function OneAppData() {
  const [activeDatabase, setActiveDatabase] = useState<DatabaseType | null>(null)
  const [schemaViewMode, setSchemaViewMode] = useState<SchemaViewMode>('list')
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [showApiEditModal, setShowApiEditModal] = useState(false)
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set())
  const [isTableModalFullscreen, setIsTableModalFullscreen] = useState(false)

  const [sharedDbConfig, setSharedDbConfig] = useState<SharedDatabaseConfig>({
    tool: 'MongoDB Atlas',
    apiUrl: 'https://api.mongodb.com',
    apiKey: '••••••••••••',
    connected: true,
    toolUrl: 'https://cloud.mongodb.com',
  })

  const currentSchema = activeDatabase === 'oneapp' ? oneAppSchema : sharedSchema
  const currentTables = activeDatabase === 'oneapp' ? oneAppSchema.tables : sharedSchema.tables

  const generateSQL = (schema: DatabaseSchema): string => {
    let sql = '-- Database Schema\n\n'
    schema.tables.forEach((table) => {
      sql += `CREATE TABLE ${table.name} (\n`
      table.fields.forEach((field, index) => {
        const nullable = field.required ? 'NOT NULL' : 'NULL'
        const comma = index < table.fields.length - 1 ? ',' : ''
        sql += `  ${field.name} ${field.type} ${nullable}${comma}\n`
      })
      sql += ');\n\n'
    })
    return sql
  }

  const handleDownloadSchema = () => {
    const sql = generateSQL(currentSchema)
    const blob = new Blob([sql], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeDatabase}-database-schema.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopySQL = () => {
    const sql = generateSQL(currentSchema)
    navigator.clipboard.writeText(sql)
    // TODO: Show toast notification
  }

  const handleDownloadTable = (tableName: string) => {
    const data = mockTableData[tableName] || []
    // Convert to CSV format
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map((row) => headers.map((header) => JSON.stringify(row[header] || '')).join(',')),
    ]
    const csv = csvRows.join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tableName}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCheckConnection = () => {
    // Simulate connection check
    console.log('Checking connection...')
    setSharedDbConfig({ ...sharedDbConfig, connected: true })
  }

  const handleOpenTool = () => {
    if (sharedDbConfig.toolUrl) {
      window.open(sharedDbConfig.toolUrl, '_blank')
    }
  }

  if (activeDatabase) {
    return (
      <div className={styles.data}>
        <button className={styles.backButton} onClick={() => setActiveDatabase(null)}>
          ← Back to Database Types
        </button>

        <div className={styles.databaseSection}>
          <div className={styles.sectionHeader}>
            <h1 className={styles.sectionTitle}>
              {activeDatabase === 'oneapp' ? 'OneApp Database' : 'Shared Database'}
            </h1>
            <p className={styles.sectionDescription}>
              {activeDatabase === 'oneapp' ? (
                <>
                  <strong>OneApp Database:</strong> Data stored directly and locally in this project. Once the project
                  is deleted, these data will be gone too. In other words, this is data that cannot be restored.
                </>
              ) : (
                <>
                  <strong>Shared Database:</strong> Data stored in an external database tool connected to this project
                  through API. When this project is gone or stops working, the data will still be stored in that
                  database tool. In other words, this is data that could be restored.
                </>
              )}
            </p>
          </div>

          {/* Schema Section */}
          <div className={styles.schemaSection}>
            <div className={styles.schemaHeader}>
              <h2 className={styles.subsectionTitle}>Schema</h2>
              <div className={styles.schemaActions}>
                <div className={styles.viewModeToggle}>
                  <button
                    className={`${styles.viewModeButton} ${schemaViewMode === 'list' ? styles.active : ''}`}
                    onClick={() => setSchemaViewMode('list')}
                  >
                    <IconTable />
                    <span>List Structure</span>
                  </button>
                  <button
                    className={`${styles.viewModeButton} ${schemaViewMode === 'sql' ? styles.active : ''}`}
                    onClick={() => setSchemaViewMode('sql')}
                  >
                    <IconCode />
                    <span>SQL Code</span>
                  </button>
                </div>
                {schemaViewMode === 'sql' && (
                  <button className={styles.copyButton} onClick={handleCopySQL} title="Copy SQL">
                    <IconCopy />
                    <span>Copy</span>
                  </button>
                )}
                <button className={styles.downloadButton} onClick={handleDownloadSchema} title="Download Schema">
                  <IconDownload />
                  <span>Download Schema</span>
                </button>
              </div>
            </div>

            {schemaViewMode === 'list' ? (
              <div className={styles.schemaList}>
                {currentSchema.tables.map((table, idx) => {
                  const isExpanded = expandedTables.has(table.name)
                  const toggleTable = () => {
                    const newExpanded = new Set(expandedTables)
                    if (isExpanded) {
                      newExpanded.delete(table.name)
                    } else {
                      newExpanded.add(table.name)
                    }
                    setExpandedTables(newExpanded)
                  }
                  return (
                    <div key={idx} className={styles.tableCard}>
                      <button className={styles.tableHeader} onClick={toggleTable}>
                        <h3 className={styles.tableName}>{table.name}</h3>
                        <div className={styles.tableToggle}>
                          {isExpanded ? <IconChevronUp /> : <IconChevronDown />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className={styles.tableContent}>
                          <table className={styles.fieldsTable}>
                            <thead>
                              <tr>
                                <th>Field Name</th>
                                <th>Type</th>
                                <th>Required</th>
                                <th>Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {table.fields.map((field, fieldIdx) => (
                                <tr key={fieldIdx}>
                                  <td>
                                    <code className={styles.fieldCode}>{field.name}</code>
                                  </td>
                                  <td>
                                    <code className={styles.typeCode}>{field.type}</code>
                                  </td>
                                  <td>
                                    {field.required ? (
                                      <span className={styles.requiredBadge}>Yes</span>
                                    ) : (
                                      <span className={styles.optionalBadge}>No</span>
                                    )}
                                  </td>
                                  <td className={styles.descriptionCell}>{field.description || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className={styles.sqlView}>
                <pre className={styles.sqlCode}>
                  <code>{generateSQL(currentSchema)}</code>
                </pre>
              </div>
            )}
          </div>

          {/* OneApp Database Specific: Tables */}
          {activeDatabase === 'oneapp' && (
            <div className={styles.tablesSection}>
              <h2 className={styles.subsectionTitle}>Tables</h2>
              <div className={styles.tablesList}>
                {currentTables.map((table, idx) => (
                  <div
                    key={idx}
                    className={styles.tableListItem}
                    onClick={() => setSelectedTable(table.name)}
                  >
                    <div className={styles.tableListItemContent}>
                      <IconTable className={styles.tableIcon} />
                      <div className={styles.tableListItemInfo}>
                        <h3 className={styles.tableListItemName}>{table.name}</h3>
                        <p className={styles.tableListItemDesc}>
                          {table.fields.length} fields • {mockTableData[table.name]?.length || 0} records
                        </p>
                      </div>
                    </div>
                    <button
                      className={styles.downloadTableButton}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownloadTable(table.name)
                      }}
                      title="Download as Excel"
                    >
                      <IconDownload />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shared Database Specific: Connection Info */}
          {activeDatabase === 'shared' && (
            <div className={styles.connectionSection}>
              <h2 className={styles.subsectionTitle}>Database Connection</h2>
              <div className={styles.connectionCard}>
                <div className={styles.connectionHeader}>
                  <div className={styles.connectionInfo}>
                    <h3 className={styles.connectionTool}>{sharedDbConfig.tool}</h3>
                    <div className={styles.connectionStatus}>
                      {sharedDbConfig.connected ? (
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
                  <div className={styles.connectionActions}>
                    <button className={styles.connectionButton} onClick={handleCheckConnection}>
                      <IconCheckCircle />
                      <span>Check Connection</span>
                    </button>
                    <button
                      className={styles.connectionButton}
                      onClick={() => setShowApiEditModal(true)}
                    >
                      <IconAPI />
                      <span>Edit API</span>
                    </button>
                    {sharedDbConfig.toolUrl && (
                      <button className={styles.connectionButton} onClick={handleOpenTool}>
                        <IconExternalLink />
                        <span>Open Tool</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className={styles.connectionDetails}>
                  <div className={styles.connectionField}>
                    <span className={styles.connectionLabel}>API URL:</span>
                    <span className={styles.connectionValue}>{sharedDbConfig.apiUrl}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table Detail Modal */}
        {selectedTable && (
          <div
            className={`${styles.modalOverlay} ${isTableModalFullscreen ? styles.fullscreenOverlay : ''}`}
            onClick={() => {
              setSelectedTable(null)
              setIsTableModalFullscreen(false)
            }}
          >
            <div
              className={`${styles.modalContent} ${isTableModalFullscreen ? styles.fullscreenModal : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>Table: {selectedTable}</h2>
                <div className={styles.modalHeaderActions}>
                  <button
                    className={styles.downloadButton}
                    onClick={() => {
                      handleDownloadTable(selectedTable)
                    }}
                  >
                    <IconDownload />
                    <span>Download Excel</span>
                  </button>
                  <button
                    className={styles.expandButton}
                    onClick={() => setIsTableModalFullscreen(!isTableModalFullscreen)}
                    title={isTableModalFullscreen ? 'Exit Fullscreen' : 'Expand to Fullscreen'}
                  >
                    {isTableModalFullscreen ? <IconMinimize /> : <IconMaximize />}
                  </button>
                  <button
                    className={styles.modalClose}
                    onClick={() => {
                      setSelectedTable(null)
                      setIsTableModalFullscreen(false)
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.tableDataView}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        {mockTableData[selectedTable]?.[0] &&
                          Object.keys(mockTableData[selectedTable][0]).map((key) => (
                            <th key={key}>{key}</th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mockTableData[selectedTable]?.map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((value, cellIdx) => (
                            <td key={cellIdx}>{String(value)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit API Modal */}
        {showApiEditModal && (
          <div className={styles.modalOverlay} onClick={() => setShowApiEditModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Edit API Configuration</h2>
                <button className={styles.modalClose} onClick={() => setShowApiEditModal(false)}>×</button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Database Tool</label>
                  <input
                    type="text"
                    value={sharedDbConfig.tool}
                    onChange={(e) => setSharedDbConfig({ ...sharedDbConfig, tool: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>API URL</label>
                  <input
                    type="text"
                    value={sharedDbConfig.apiUrl}
                    onChange={(e) => setSharedDbConfig({ ...sharedDbConfig, apiUrl: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>API Key</label>
                  <input
                    type="password"
                    value={sharedDbConfig.apiKey}
                    onChange={(e) => setSharedDbConfig({ ...sharedDbConfig, apiKey: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Tool URL (Optional)</label>
                  <input
                    type="text"
                    value={sharedDbConfig.toolUrl || ''}
                    onChange={(e) => setSharedDbConfig({ ...sharedDbConfig, toolUrl: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.modalButtonSecondary} onClick={() => setShowApiEditModal(false)}>
                  Cancel
                </button>
                <button
                  className={styles.modalButtonPrimary}
                  onClick={() => {
                    setShowApiEditModal(false)
                    // TODO: Save API configuration
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.data}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>OneApp Data</h1>
          <p className={styles.subtitle}>
            Manage data types, data structures, and database schemas. Understand how data is stored and organized in
            OneApp.
          </p>
        </div>
      </div>

      <div className={styles.databaseTypes}>
        <div
          className={styles.databaseTypeCard}
          onClick={() => setActiveDatabase('oneapp')}
        >
          <div className={styles.databaseTypeIcon}>
            <IconDatabase />
          </div>
          <div className={styles.databaseTypeInfo}>
            <h2 className={styles.databaseTypeName}>OneApp Database</h2>
            <p className={styles.databaseTypeDescription}>
              Data stored directly and locally in this project. Once the project is deleted, these data will be gone
              too. In other words, this is data that cannot be restored.
            </p>
          </div>
        </div>

        <div
          className={styles.databaseTypeCard}
          onClick={() => setActiveDatabase('shared')}
        >
          <div className={styles.databaseTypeIcon}>
            <IconServer />
          </div>
          <div className={styles.databaseTypeInfo}>
            <h2 className={styles.databaseTypeName}>Shared Database</h2>
            <p className={styles.databaseTypeDescription}>
              Data stored in an external database tool connected to this project through API. When this project is gone
              or stops working, the data will still be stored in that database tool. In other words, this is data that
              could be restored.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
