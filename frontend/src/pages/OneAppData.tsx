import { useState, useEffect, useMemo } from 'react'
import api from '@/services/api'
import JSZip from 'jszip'
import { getSupabaseClient } from '@/utils/supabase'
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
  IconMoreVertical,
  IconUpload,
  IconPackage,
  IconEye,
  IconEyeOff,
} from '@/components/Icons'
import { ToastContainer, type Toast } from '@/components/Toast'
import styles from './OneAppData.module.css'
import supabaseLogo from '@/logo/supabase.png'
import oneAppLogo from '@/logo/icon.png'

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

// Function to parse SQL schema and extract tables and fields
function parseSQLSchema(sql: string): DatabaseSchema {
  const tables: Table[] = []
  
  if (!sql) {
    return { tables: [] }
  }

  // Match CREATE TABLE statements (handles multi-line table definitions)
  // Handles both "CREATE TABLE table_name" and "CREATE TABLE public.table_name" formats
  const createTableRegex = /CREATE TABLE (?:IF NOT EXISTS )?(?:public\.)?(\w+)\s*\(([\s\S]*?)\);/gi
  let match

  while ((match = createTableRegex.exec(sql)) !== null) {
    const tableName = match[1]
    const tableBody = match[2]
    const fields: Array<{ name: string; type: string; required: boolean; description?: string }> = []

    // Parse fields - handle multi-line field definitions
    // Split by comma, but be careful with nested parentheses
    const fieldParts: string[] = []
    let currentPart = ''
    let depth = 0
    
    for (let i = 0; i < tableBody.length; i++) {
      const char = tableBody[i]
      if (char === '(') depth++
      else if (char === ')') depth--
      else if (char === ',' && depth === 0) {
        fieldParts.push(currentPart.trim())
        currentPart = ''
        continue
      }
      currentPart += char
    }
    if (currentPart.trim()) {
      fieldParts.push(currentPart.trim())
    }
    
    for (const line of fieldParts) {
      const trimmedLine = line.trim()
      if (!trimmedLine || trimmedLine.startsWith('--')) continue

      // Skip constraints, indexes, etc.
      if (trimmedLine.match(/^(PRIMARY KEY|FOREIGN KEY|UNIQUE|CHECK|CONSTRAINT)/i)) {
        continue
      }

      // Extract field name and type - handle UUID, VARCHAR(100), CHARACTER VARYING, TEXT, etc.
      // Match field name and type (handles "character varying", "character varying(255)", etc.)
      const fieldMatch = trimmedLine.match(/^(\w+)\s+((?:character\s+varying|numeric|timestamp\s+with\s+time\s+zone|[a-z_]+)(?:\([^)]+\))?(?:\s+[A-Z\s]+)?)/i)
      if (!fieldMatch) continue

      const fieldName = fieldMatch[1]
      let fieldType = fieldMatch[2].trim()
      
      // Extract more specific type info before cleaning
      let displayType = fieldType
      if (fieldType.match(/character\s+varying\((\d+)\)/i)) {
        const varcharMatch = fieldType.match(/character\s+varying\((\d+)\)/i)
        displayType = varcharMatch ? `VARCHAR(${varcharMatch[1]})` : 'VARCHAR'
      } else if (fieldType.match(/VARCHAR\((\d+)\)/i)) {
        const varcharMatch = fieldType.match(/VARCHAR\((\d+)\)/i)
        displayType = varcharMatch ? `VARCHAR(${varcharMatch[1]})` : 'VARCHAR'
      } else if (fieldType.match(/character\s+varying/i)) {
        displayType = 'VARCHAR'
      } else if (fieldType.includes('TEXT[]') || fieldType.includes('ARRAY')) {
        displayType = 'ARRAY'
      } else if (fieldType.includes('JSONB')) {
        displayType = 'JSONB'
      } else if (fieldType.includes('TIMESTAMP WITH TIME ZONE')) {
        displayType = 'TIMESTAMP WITH TIME ZONE'
      } else if (fieldType.includes('TIMESTAMP')) {
        displayType = 'TIMESTAMP'
      } else if (fieldType.includes('BIGINT')) {
        displayType = 'BIGINT'
      } else if (fieldType.includes('BOOLEAN')) {
        displayType = 'BOOLEAN'
      } else if (fieldType.includes('UUID')) {
        displayType = 'UUID'
      } else if (fieldType.includes('NUMERIC')) {
        displayType = 'NUMERIC'
      } else if (fieldType.includes('TEXT')) {
        displayType = 'TEXT'
      } else {
        // Clean up type (remove parentheses content for display if not already handled)
        displayType = fieldType.split('(')[0].toUpperCase().replace(/\s+/g, ' ')
      }
      
      // Check if required (NOT NULL) - but allow DEFAULT values
      const isRequired = /\bNOT NULL\b/i.test(trimmedLine) && !/\bDEFAULT\b/i.test(trimmedLine.split('NOT NULL')[0])
      
      // Extract comment/description (inline comments)
      const commentMatch = trimmedLine.match(/--\s*(.+)$/i)
      const description = commentMatch ? commentMatch[1].trim() : undefined

      // Special handling for primary keys
      const isPrimaryKey = /\bPRIMARY KEY\b/i.test(trimmedLine) || fieldName === 'id'

      fields.push({
        name: fieldName,
        type: displayType,
        required: isRequired || isPrimaryKey,
        description: description || (isPrimaryKey ? 'Primary key' : undefined),
      })
    }

    if (fields.length > 0) {
      tables.push({
        name: tableName,
        fields,
      })
    }
  }

  return { tables }
}

// Default shared schema (will be replaced by parsed SQL)
const sharedSchema: DatabaseSchema = {
  tables: [],
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
  const [tableData, setTableData] = useState<Record<string, any[]>>({})
  const [loadingTableData, setLoadingTableData] = useState<Record<string, boolean>>({})
  const [toasts, setToasts] = useState<Toast[]>([])
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showChangeToolModal, setShowChangeToolModal] = useState(false)
  const [showVersionBackupModal, setShowVersionBackupModal] = useState(false)
  const [currentVersion, setCurrentVersion] = useState<string>('v1.0.0')
  const [backups, setBackups] = useState<Array<{
    id: string
    name: string
    size: number
    sizeFormatted: string
    lastUpdate: string
    createdAt: string
    is_current: boolean
    storage_url?: string
  }>>([])
  const [loadingBackups, setLoadingBackups] = useState(false)
  const [schemaSQL, setSchemaSQL] = useState<string>('')
  const [loadingSchema, setLoadingSchema] = useState(false)
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false)
  const [autoBackupInterval, setAutoBackupInterval] = useState<'week' | 'month' | 'custom'>('week')
  const [customBackupDays, setCustomBackupDays] = useState<number>(7)
  const [newBackupName, setNewBackupName] = useState('')
  const [showCreateBackupModal, setShowCreateBackupModal] = useState(false)
  const [showUploadBackupModal, setShowUploadBackupModal] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  // Toast helper functions
  const showToast = (message: string, type: Toast['type'] = 'info', duration?: number) => {
    setToasts((prev) => {
      const existingToast = prev.find(t => t.message === message && t.type === type)
      if (existingToast) {
        return prev
      }
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      return [...prev, { id, message, type, duration }]
    })
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const [sharedDbConfig, setSharedDbConfig] = useState<SharedDatabaseConfig>({
    tool: 'Supabase',
    apiUrl: 'fzxetyomesoojyhhrhnh',
    apiKey: '••••••••••••',
    connected: false, // Will be checked on mount
    toolUrl: 'https://supabase.com',
  })

  // Available database tools
  const availableTools = ['Supabase'] // Can be extended later

  // Parse SQL schema when available for shared database
  const parsedSharedSchema = useMemo(() => {
    if (activeDatabase === 'shared' && schemaSQL) {
      return parseSQLSchema(schemaSQL)
    }
    return sharedSchema
  }, [activeDatabase, schemaSQL])

  const currentSchema = activeDatabase === 'oneapp' ? oneAppSchema : parsedSharedSchema
  const currentTables = activeDatabase === 'oneapp' ? oneAppSchema.tables : parsedSharedSchema.tables

  // Helper function to format bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Check Supabase connection status when switching to shared database
  useEffect(() => {
    if (activeDatabase === 'shared') {
      const checkConnection = async () => {
        const supabaseClient = getSupabaseClient()
        if (!supabaseClient) {
          setSharedDbConfig(prev => ({ ...prev, connected: false }))
          return
        }

        // Test connection with a simple query
        try {
          const { error } = await supabaseClient
            .from('oneapp_users')
            .select('count')
            .limit(1)

          if (error) {
            // If it's a "relation does not exist" error, connection is still valid
            if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
              setSharedDbConfig(prev => ({ ...prev, connected: true }))
            } else {
              setSharedDbConfig(prev => ({ ...prev, connected: false }))
            }
          } else {
            setSharedDbConfig(prev => ({ ...prev, connected: true }))
          }
        } catch (error: any) {
          console.error('Connection check error:', error)
          setSharedDbConfig(prev => ({ ...prev, connected: false }))
        }
      }

      checkConnection()
    }
  }, [activeDatabase])

  // Fetch schema SQL from database
  useEffect(() => {
    if (activeDatabase === 'shared') {
      const fetchSchema = async () => {
        setLoadingSchema(true)
        // #region agent log
        const supabaseClient = getSupabaseClient()
        fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'OneAppData.tsx:408',
            message: 'Fetching schema - checking Supabase connection',
            data: { hasSupabaseClient: !!supabaseClient, apiUrl: import.meta.env.VITE_API_URL },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            hypothesisId: 'A'
          })
        }).catch(() => {})
        // #endregion
        try {
          // Try direct Supabase connection first, fallback to API
          const supabaseClient = getSupabaseClient()
          if (supabaseClient) {
            // Schema is static, so we'll use the embedded version
            // In production, you could store it in Supabase Storage or fetch from a CDN
            // Updated to match database/schema.sql
            const embeddedSchema = `-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.ai_agent_data (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  agent_id uuid NOT NULL,
  data_type character varying NOT NULL,
  data_content jsonb NOT NULL DEFAULT '{}'::jsonb,
  tags ARRAY DEFAULT '{}'::text[],
  importance_score numeric NOT NULL DEFAULT 0.5,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ai_agent_data_pkey PRIMARY KEY (id),
  CONSTRAINT ai_agent_data_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.ai_agents(id)
);
CREATE TABLE public.ai_agent_memory (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  agent_id uuid NOT NULL,
  content text NOT NULL,
  context jsonb DEFAULT '{}'::jsonb,
  importance_score numeric NOT NULL DEFAULT 0.5,
  size_bytes bigint NOT NULL DEFAULT 0,
  token_estimate integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ai_agent_memory_pkey PRIMARY KEY (id),
  CONSTRAINT ai_agent_memory_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.ai_agents(id)
);
CREATE TABLE public.ai_agents (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  avatar_url text,
  model character varying NOT NULL,
  model_provider character varying,
  api_key text,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT false,
  memory_enabled boolean NOT NULL DEFAULT true,
  memory_size_bytes bigint NOT NULL DEFAULT 0,
  memory_token_estimate integer NOT NULL DEFAULT 0,
  knowledge_files jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ai_agents_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ai_interactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  role character varying NOT NULL CHECK (role::text = ANY (ARRAY['user'::character varying, 'assistant'::character varying]::text[])),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ai_interactions_pkey PRIMARY KEY (id),
  CONSTRAINT ai_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.analytics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  event_type character varying NOT NULL,
  module_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT analytics_pkey PRIMARY KEY (id),
  CONSTRAINT analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT analytics_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id)
);
CREATE TABLE public.apis (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  type character varying NOT NULL,
  api_url text NOT NULL,
  api_key text NOT NULL,
  status character varying NOT NULL DEFAULT 'unknown'::character varying CHECK (status::text = ANY (ARRAY['connected'::character varying, 'disconnected'::character varying, 'error'::character varying, 'unknown'::character varying]::text[])),
  last_checked timestamp with time zone,
  app_source character varying,
  description text,
  enabled boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT apis_pkey PRIMARY KEY (id)
);
CREATE TABLE public.backup_versions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  size bigint NOT NULL,
  storage_url text,
  description text,
  is_current boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT backup_versions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.files (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  name character varying NOT NULL,
  path text NOT NULL,
  size bigint NOT NULL,
  mime_type character varying,
  storage_url text,
  category character varying,
  tags ARRAY,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT files_pkey PRIMARY KEY (id),
  CONSTRAINT files_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.module_config (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  module_id uuid NOT NULL,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT module_config_pkey PRIMARY KEY (id),
  CONSTRAINT module_config_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT module_config_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id)
);
CREATE TABLE public.modules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL UNIQUE,
  description text,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'inactive'::character varying, 'pending'::character varying]::text[])),
  icon character varying,
  version character varying DEFAULT '1.0.0'::character varying,
  dependencies ARRAY,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT modules_pkey PRIMARY KEY (id)
);
CREATE TABLE public.oneapp_users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  phone character varying,
  user_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  password text,
  CONSTRAINT oneapp_users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'in-progress'::character varying, 'completed'::character varying, 'cancelled'::character varying]::text[])),
  priority character varying NOT NULL DEFAULT 'medium'::character varying CHECK (priority::text = ANY (ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying]::text[])),
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);`
            setSchemaSQL(embeddedSchema)
            setSchemaViewMode('list') // Default to list view to show structure
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'OneAppData.tsx:408',
                message: 'Schema loaded from embedded source',
                data: { schemaLength: embeddedSchema.length },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                hypothesisId: 'A'
              })
            }).catch(() => {})
            // #endregion
          } else {
            // Only fallback to API in development, not in production
            if (import.meta.env.DEV && import.meta.env.VITE_API_URL) {
              try {
                const response = await api.get('/schema')
                if (response.data.success) {
                  setSchemaSQL(response.data.data.sql)
                  setSchemaViewMode('list') // Default to list view to show structure
                }
              } catch (apiError) {
                console.error('API fallback also failed:', apiError)
                showToast('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables.', 'error', 8000)
              }
            } else {
              // In production, show helpful error if Supabase not configured
              showToast('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables.', 'error', 8000)
            }
          }
        } catch (error: any) {
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'OneAppData.tsx:408',
              message: 'Error fetching schema',
              data: { error: error.message, status: error.response?.status },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              hypothesisId: 'A'
            })
          }).catch(() => {})
          // #endregion
          console.error('Error fetching schema:', error)
          showToast('Failed to load schema', 'error')
        } finally {
          setLoadingSchema(false)
        }
      }
      fetchSchema()
    } else {
      // Reset to list view for OneApp database
      setSchemaViewMode('list')
    }
  }, [activeDatabase])

  // Fetch backups from database
  useEffect(() => {
    if (activeDatabase === 'shared') {
      const fetchBackups = async () => {
        setLoadingBackups(true)
        // #region agent log
        const supabaseClient = getSupabaseClient()
        fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'OneAppData.tsx:434',
            message: 'Fetching backups - checking Supabase connection',
            data: { hasSupabaseClient: !!supabaseClient },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            hypothesisId: 'B'
          })
        }).catch(() => {})
        // #endregion
        try {
          // Try direct Supabase connection first
          const supabaseClient = getSupabaseClient()
          if (supabaseClient) {
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'OneAppData.tsx:434',
                message: 'Querying Supabase directly for backups',
                data: {},
                timestamp: Date.now(),
                sessionId: 'debug-session',
                hypothesisId: 'B'
              })
            }).catch(() => {})
            // #endregion
            const { data, error } = await supabaseClient
              .from('backup_versions')
              .select('*')
              .order('created_at', { ascending: false })
            
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                location: 'OneAppData.tsx:434',
                message: 'Supabase query result',
                data: { hasError: !!error, errorMessage: error?.message, dataLength: data?.length },
                timestamp: Date.now(),
                sessionId: 'debug-session',
                hypothesisId: 'B'
              })
            }).catch(() => {})
            // #endregion
            
            if (error) {
              // Check for secret key error
              if (error.message?.includes('secret API key') || error.message?.includes('Forbidden use of secret')) {
                const errorMsg = 'SECURITY ERROR: You are using a SECRET API key instead of ANON key. Please use the "anon public" key from Supabase Dashboard → Settings → API. Delete the exposed secret key immediately!'
                console.error('❌', errorMsg)
                showToast(errorMsg, 'error', 10000)
                throw new Error(errorMsg)
              }
              throw error
            }
            
            const backupsArray = data || []
            const backupsData = backupsArray.map((backup: any) => ({
              id: backup.id,
              name: backup.name,
              size: backup.size,
              sizeFormatted: formatBytes(backup.size),
              lastUpdate: backup.updated_at || backup.created_at,
              createdAt: backup.created_at,
              is_current: backup.is_current,
              storage_url: backup.storage_url,
            }))
            setBackups(backupsData)
            
            // Set current version
            const currentBackup = backupsData.find((b: any) => b.is_current)
            if (currentBackup) {
              setCurrentVersion(currentBackup.name)
            } else {
              setCurrentVersion('v1.0.0')
            }
          } else {
            // Only fallback to API in development, not in production
            if (import.meta.env.DEV && import.meta.env.VITE_API_URL) {
              try {
                const response = await api.get('/backup-versions')
                if (response.data.success) {
                  const backupsArray = response.data.data || []
                  const backupsData = backupsArray.map((backup: any) => ({
                    id: backup.id,
                    name: backup.name,
                    size: backup.size,
                    sizeFormatted: formatBytes(backup.size),
                    lastUpdate: backup.updated_at || backup.created_at,
                    createdAt: backup.created_at,
                    is_current: backup.is_current,
                    storage_url: backup.storage_url,
                  }))
                  setBackups(backupsData)
                  
                  const currentBackup = backupsData.find((b: any) => b.is_current)
                  if (currentBackup) {
                    setCurrentVersion(currentBackup.name)
                  } else {
                    setCurrentVersion('v1.0.0')
                  }
                }
              } catch (apiError) {
                console.error('API fallback also failed:', apiError)
                showToast('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables.', 'error', 8000)
                setBackups([])
                setCurrentVersion('v1.0.0')
              }
            } else {
              // In production, show helpful error if Supabase not configured
              showToast('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables.', 'error', 8000)
              setBackups([])
              setCurrentVersion('v1.0.0')
            }
          }
        } catch (error: any) {
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'OneAppData.tsx:434',
              message: 'Error fetching backups',
              data: { error: error.message, code: error.code, status: error.response?.status },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              hypothesisId: 'B'
            })
          }).catch(() => {})
          // #endregion
          console.error('Error fetching backups:', error)
          
          // Check for secret key error
          if (error.message?.includes('secret API key') || error.message?.includes('Forbidden use of secret')) {
            const errorMsg = 'SECURITY ERROR: Using SECRET key instead of ANON key. Use "anon public" key from Supabase Dashboard → Settings → API. Delete exposed secret key immediately!'
            showToast(errorMsg, 'error', 10000)
          } else if (error.response?.status === 401) {
            showToast('Authentication failed. Please check your Supabase anon key.', 'error', 8000)
          } else if (error.response?.status !== 503) {
            showToast(`Failed to load backups: ${error.message || 'Unknown error'}`, 'error')
          }
          setBackups([])
          setCurrentVersion('v1.0.0')
        } finally {
          setLoadingBackups(false)
        }
      }
      fetchBackups()
    }
  }, [activeDatabase])

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showMoreMenu && !target.closest(`.${styles.moreMenuContainer}`)) {
        setShowMoreMenu(false)
      }
    }
    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMoreMenu])

  // Fetch table data when OneApp database is active
  useEffect(() => {
    if (activeDatabase === 'oneapp') {
      const fetchTableData = async (tableName: string) => {
        if (loadingTableData[tableName]) return

        setLoadingTableData(prev => ({ ...prev, [tableName]: true }))
        try {
          const response = await api.get(`/oneapp-data/${tableName}`)
          if (response.data.success) {
            setTableData(prev => ({
              ...prev,
              [tableName]: response.data.data || [],
            }))
          }
        } catch (error) {
          console.error(`Error fetching ${tableName}:`, error)
          // Fallback to empty array
          setTableData(prev => ({
            ...prev,
            [tableName]: [],
          }))
        } finally {
          setLoadingTableData(prev => ({ ...prev, [tableName]: false }))
        }
      }

      // Fetch data for all OneApp database tables
      oneAppSchema.tables.forEach(table => {
        fetchTableData(table.name)
      })
    } else {
      // Clear table data when switching away from OneApp database
      setTableData({})
    }
  }, [activeDatabase])

  // Fetch table data when a table is selected
  useEffect(() => {
    if (selectedTable && activeDatabase === 'oneapp' && !tableData[selectedTable]) {
      const fetchTableData = async () => {
        setLoadingTableData(prev => ({ ...prev, [selectedTable]: true }))
        try {
          const response = await api.get(`/oneapp-data/${selectedTable}`)
          if (response.data.success) {
            setTableData(prev => ({
              ...prev,
              [selectedTable]: response.data.data || [],
            }))
          }
        } catch (error) {
          console.error(`Error fetching ${selectedTable}:`, error)
          setTableData(prev => ({
            ...prev,
            [selectedTable]: [],
          }))
        } finally {
          setLoadingTableData(prev => ({ ...prev, [selectedTable]: false }))
        }
      }
      fetchTableData()
    }
  }, [selectedTable, activeDatabase])

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
    const sql = activeDatabase === 'shared' && schemaSQL ? schemaSQL : generateSQL(currentSchema)
    const blob = new Blob([sql], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeDatabase}-database-schema.sql`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopySQL = async () => {
    const sql = activeDatabase === 'shared' && schemaSQL ? schemaSQL : generateSQL(currentSchema)
    try {
      await navigator.clipboard.writeText(sql)
      showToast('SQL code copied to clipboard', 'success')
    } catch (error) {
      console.error('Failed to copy SQL:', error)
      showToast('Failed to copy SQL code', 'error')
    }
  }

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return ''
    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map((row) => headers.map((header) => JSON.stringify(row[header] || '')).join(',')),
    ]
    return csvRows.join('\n')
  }

  const handleDownloadTable = (tableName: string) => {
    const data = activeDatabase === 'oneapp' ? (tableData[tableName] || []) : (mockTableData[tableName] || [])
    if (data.length === 0) {
      showToast(`Table "${tableName}" is empty`, 'warning')
      return
    }

    const csv = convertToCSV(data)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tableName}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast(`Table "${tableName}" downloaded successfully`, 'success')
  }

  const handleDownloadAllTables = async () => {
    if (activeDatabase !== 'oneapp') return

    try {
      const zip = new JSZip()
      let hasData = false

      // Add each table as a CSV file to the zip
      for (const table of currentTables) {
        const data = tableData[table.name] || []
        if (data.length > 0) {
          const csv = convertToCSV(data)
          zip.file(`${table.name}.csv`, csv)
          hasData = true
        }
      }

      if (!hasData) {
        showToast('No table data available to download', 'warning')
        return
      }

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'OneApp Data.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('All tables downloaded successfully', 'success')
    } catch (error) {
      console.error('Error creating zip file:', error)
      showToast('Failed to download tables', 'error')
    }
  }

  const handleCheckConnection = async () => {
    setShowMoreMenu(false)
    showToast('Checking connection...', 'info')
    
    try {
      const supabaseClient = getSupabaseClient()
      if (!supabaseClient) {
        setSharedDbConfig({ ...sharedDbConfig, connected: false })
        showToast('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY', 'error')
        return
      }

      // Test connection by making a simple query
      const { error } = await supabaseClient
        .from('oneapp_users')
        .select('count')
        .limit(1)

      if (error) {
        // Check if it's a "relation does not exist" error (table not created yet)
        if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          // Table doesn't exist, but connection works
          setSharedDbConfig({ ...sharedDbConfig, connected: true })
          showToast('Connected (but tables may not be created yet)', 'warning')
        } else {
          setSharedDbConfig({ ...sharedDbConfig, connected: false })
          showToast(`Connection failed: ${error.message}`, 'error')
        }
      } else {
        setSharedDbConfig({ ...sharedDbConfig, connected: true })
        showToast('Connection check successful', 'success')
      }
    } catch (error: any) {
      console.error('Connection check error:', error)
      setSharedDbConfig({ ...sharedDbConfig, connected: false })
      showToast(`Connection check failed: ${error.message || 'Unknown error'}`, 'error')
    }
  }

  const handleOpenTool = () => {
    if (sharedDbConfig.toolUrl) {
      window.open(sharedDbConfig.toolUrl, '_blank')
    }
  }

  const handleCreateBackup = async () => {
    if (!newBackupName.trim()) {
      showToast('Please enter a backup name', 'error')
      return
    }
    
    showToast('Creating backup...', 'info')
    // #region agent log
    const supabaseClient = getSupabaseClient()
    fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'OneAppData.tsx:868',
        message: 'Creating backup - checking Supabase connection',
        data: { hasSupabaseClient: !!supabaseClient, backupName: newBackupName },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        hypothesisId: 'C'
      })
    }).catch(() => {})
    // #endregion
    try {
      const supabaseClient = getSupabaseClient()
      if (supabaseClient) {
        // Estimate size (in bytes) - in real implementation, calculate actual size
        const estimatedSize = 2.5 * 1024 * 1024 // 2.5 MB
        
        const { data, error } = await supabaseClient
          .from('backup_versions')
          .insert({
            name: newBackupName,
            size: estimatedSize,
            description: 'Manual backup created from OneApp Data',
            is_current: false,
          })
          .select()
          .single()
        
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'OneAppData.tsx:868',
            message: 'Backup creation result',
            data: { hasError: !!error, errorMessage: error?.message, hasData: !!data },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            hypothesisId: 'C'
          })
        }).catch(() => {})
        // #endregion
        
        if (error) {
          throw error
        }
        
        if (data) {
          const newBackup = {
            id: data.id,
            name: data.name,
            size: data.size,
            sizeFormatted: formatBytes(data.size),
            lastUpdate: data.updated_at || data.created_at,
            createdAt: data.created_at,
            is_current: data.is_current,
            storage_url: data.storage_url,
          }
          setBackups(prev => [newBackup, ...prev])
          setNewBackupName('')
          setShowCreateBackupModal(false)
          showToast('Backup created successfully', 'success')
        }
      } else {
        // Only fallback to API in development
        if (import.meta.env.DEV && import.meta.env.VITE_API_URL) {
          try {
            const estimatedSize = 2.5 * 1024 * 1024 // 2.5 MB
            const response = await api.post('/backup-versions', {
              name: newBackupName,
              size: estimatedSize,
              description: 'Manual backup created from OneApp Data',
              is_current: false,
            })
            
            if (response.data.success) {
              const newBackup = {
                id: response.data.data.id,
                name: response.data.data.name,
                size: response.data.data.size,
                sizeFormatted: formatBytes(response.data.data.size),
                lastUpdate: response.data.data.updated_at || response.data.data.created_at,
                createdAt: response.data.data.created_at,
                is_current: response.data.data.is_current,
                storage_url: response.data.data.storage_url,
              }
              setBackups(prev => [newBackup, ...prev])
              setNewBackupName('')
              setShowCreateBackupModal(false)
              showToast('Backup created successfully', 'success')
            }
          } catch (apiError) {
            throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables.')
          }
        } else {
          throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables.')
        }
      }
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'OneAppData.tsx:868',
          message: 'Error creating backup',
          data: { error: error.message, code: error.code, status: error.response?.status },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          hypothesisId: 'C'
        })
      }).catch(() => {})
      // #endregion
      console.error('Error creating backup:', error)
      const errorMessage = error.message || error.response?.data?.error || 'Failed to create backup'
      showToast(errorMessage, 'error', 5000)
    }
  }

  const handleUploadBackup = async (file: File) => {
    // Validate file format
    if (!file.name.endsWith('.zip')) {
      showToast('Please upload a valid ZIP file', 'error')
      return
    }
    showToast('Uploading backup...', 'info')
    // In real implementation, this would upload to storage
    setTimeout(() => {
      const uploadedBackup = {
        id: `backup-${Date.now()}`,
        name: file.name.replace('.zip', ''),
        size: file.size,
        sizeFormatted: formatBytes(file.size),
        lastUpdate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        is_current: false,
      }
      setBackups(prev => [uploadedBackup, ...prev])
      setShowUploadBackupModal(false)
      showToast('Backup uploaded successfully', 'success')
    }, 1500)
  }

  const handleApplyBackup = async (backupId: string) => {
    const backup = backups.find(b => b.id === backupId)
    if (!backup) return
    
    showToast(`Applying backup "${backup.name}"...`, 'info')
    // #region agent log
    const supabaseClient = getSupabaseClient()
    fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'OneAppData.tsx:933',
        message: 'Applying backup - checking Supabase connection',
        data: { hasSupabaseClient: !!supabaseClient, backupId },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        hypothesisId: 'D'
      })
    }).catch(() => {})
    // #endregion
    try {
      const supabaseClient = getSupabaseClient()
      if (supabaseClient) {
        // Unset all current backups
        await supabaseClient
          .from('backup_versions')
          .update({ is_current: false })
          .eq('is_current', true)
        
        // Set this backup as current
        const { data, error } = await supabaseClient
          .from('backup_versions')
          .update({ is_current: true, updated_at: new Date().toISOString() })
          .eq('id', backupId)
          .select()
          .single()
        
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'OneAppData.tsx:933',
            message: 'Backup apply result',
            data: { hasError: !!error, errorMessage: error?.message, hasData: !!data },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            hypothesisId: 'D'
          })
        }).catch(() => {})
        // #endregion
        
        if (error) {
          throw error
        }
        
        // Update local state
        setBackups(prev => prev.map(b => ({
          ...b,
          is_current: b.id === backupId,
        })))
        setCurrentVersion(backup.name)
        showToast('Backup applied successfully', 'success')
      } else {
        // Only fallback to API in development
        if (import.meta.env.DEV && import.meta.env.VITE_API_URL) {
          try {
            const response = await api.put(`/backup-versions/${backupId}/apply`)
            if (response.data.success) {
              setBackups(prev => prev.map(b => ({
                ...b,
                is_current: b.id === backupId,
              })))
              setCurrentVersion(backup.name)
              showToast('Backup applied successfully', 'success')
            }
          } catch (apiError) {
            throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables.')
          }
        } else {
          throw new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables.')
        }
      }
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'OneAppData.tsx:933',
          message: 'Error applying backup',
          data: { error: error.message, code: error.code, status: error.response?.status },
          timestamp: Date.now(),
          sessionId: 'debug-session',
          hypothesisId: 'D'
        })
      }).catch(() => {})
      // #endregion
      console.error('Error applying backup:', error)
      showToast(error.message || error.response?.data?.error || 'Failed to apply backup', 'error')
    }
  }

  const handleDownloadBackup = (backupId: string) => {
    const backup = backups.find(b => b.id === backupId)
    if (!backup) return
    // In real implementation, this would download the backup file
    showToast(`Downloading backup "${backup.name}"...`, 'info')
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

          {/* Shared Database Specific: Connection Info */}
          {activeDatabase === 'shared' && (
            <div className={styles.connectionSection}>
              {/* Title Section with Tool Info */}
              <div className={styles.connectionTitleSection}>
                <div className={styles.connectionTitleLeft}>
                  <div className={styles.toolLogo}>
                    <img src={supabaseLogo} alt={sharedDbConfig.tool} className={styles.toolLogoImage} />
                  </div>
                  <div className={styles.connectionTitleInfo}>
                    <h2 className={styles.connectionTitle}>{sharedDbConfig.tool}</h2>
                    <div className={styles.connectionTitleMeta}>
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
                      <span className={styles.versionBadge}>{currentVersion}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.connectionTitleActions}>
                  <button 
                    className={styles.versionBackupButton}
                    onClick={() => setShowVersionBackupModal(true)}
                  >
                    <IconPackage />
                    <span>Version & Backup</span>
                  </button>
                  {sharedDbConfig.toolUrl && (
                    <button className={styles.openToolButton} onClick={handleOpenTool}>
                      <IconExternalLink />
                      <span>Open Tool</span>
                    </button>
                  )}
                  <div className={styles.moreMenuContainer}>
                    <button 
                      className={styles.moreMenuButton}
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                    >
                      <IconMoreVertical />
                    </button>
                    {showMoreMenu && (
                      <div className={styles.moreMenuDropdown}>
                        <button 
                          className={styles.moreMenuItem}
                          onClick={() => {
                            setShowChangeToolModal(true)
                            setShowMoreMenu(false)
                          }}
                        >
                          <IconServer />
                          <span>Change Tool</span>
                        </button>
                        <button 
                          className={styles.moreMenuItem}
                          onClick={handleCheckConnection}
                        >
                          <IconCheckCircle />
                          <span>Check Connection</span>
                        </button>
                        <button 
                          className={styles.moreMenuItem}
                          onClick={() => {
                            setShowApiEditModal(true)
                            setShowMoreMenu(false)
                          }}
                        >
                          <IconAPI />
                          <span>Edit API</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

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
                {loadingSchema ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading schema...
                  </div>
                ) : (
                  <pre className={styles.sqlCode}>
                    <code>{activeDatabase === 'shared' && schemaSQL ? schemaSQL : generateSQL(currentSchema)}</code>
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* OneApp Database Specific: Tables */}
          {activeDatabase === 'oneapp' && (
            <div className={styles.tablesSection}>
              <div className={styles.tablesSectionHeader}>
                <h2 className={styles.subsectionTitle}>Tables</h2>
                <button className={styles.downloadAllButton} onClick={handleDownloadAllTables}>
                  <IconDownload />
                  <span>Download All</span>
                </button>
              </div>
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
                          {table.fields.length} fields • {activeDatabase === 'oneapp' ? (tableData[table.name]?.length || 0) : (mockTableData[table.name]?.length || 0)} records
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
                  {loadingTableData[selectedTable] ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Loading table data...
                    </div>
                  ) : (
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          {(activeDatabase === 'oneapp' ? tableData[selectedTable] : mockTableData[selectedTable])?.[0] &&
                            Object.keys((activeDatabase === 'oneapp' ? tableData[selectedTable] : mockTableData[selectedTable])[0]).map((key) => (
                              <th key={key}>{key}</th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(activeDatabase === 'oneapp' ? tableData[selectedTable] : mockTableData[selectedTable])?.map((row, idx) => (
                          <tr key={idx}>
                            {Object.values(row).map((value, cellIdx) => (
                              <td key={cellIdx}>{String(value ?? '')}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit API Modal */}
        {showApiEditModal && (
          <div 
            className={styles.modalOverlay} 
            onClick={(e) => {
              // Only close if clicking directly on the overlay, not on child elements
              if (e.target === e.currentTarget) {
                setShowApiEditModal(false)
              }
            }}
          >
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
                    readOnly
                    disabled
                    className={styles.formInputDisabled}
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                  />
                  <div className={styles.formHelperText}>
                    Want to switch tools? Head over to the three-dot menu and pick "Change Tool" instead.
                  </div>
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
                  <div className={styles.passwordInputWrapper}>
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={sharedDbConfig.apiKey}
                      onChange={(e) => setSharedDbConfig({ ...sharedDbConfig, apiKey: e.target.value })}
                      className={styles.passwordInput}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowApiKey(!showApiKey)}
                      title={showApiKey ? 'Hide API Key' : 'Show API Key'}
                    >
                      {showApiKey ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
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

        {/* Change Tool Modal */}
        {showChangeToolModal && (
          <div 
            className={styles.modalOverlay} 
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowChangeToolModal(false)
              }
            }}
          >
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Change Database Tool</h2>
                <button className={styles.modalClose} onClick={() => setShowChangeToolModal(false)}>×</button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Select Database Tool</label>
                  <div className={styles.toolOptions}>
                    {availableTools.map((tool) => (
                      <div
                        key={tool}
                        className={`${styles.toolOption} ${sharedDbConfig.tool === tool ? styles.toolOptionActive : ''}`}
                        onClick={() => {
                          setSharedDbConfig({ ...sharedDbConfig, tool })
                        }}
                      >
                        <div className={styles.toolOptionIcon}>
                          <IconDatabase />
                        </div>
                        <div className={styles.toolOptionName}>{tool}</div>
                        {sharedDbConfig.tool === tool && (
                          <IconCheckCircle className={styles.toolOptionCheck} />
                        )}
                      </div>
                    ))}
                  </div>
                  {availableTools.length === 1 && (
                    <div className={styles.formHelperText}>
                      Currently, only {availableTools[0]} is available. More tools will be added soon.
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.modalButtonSecondary} onClick={() => setShowChangeToolModal(false)}>
                  Cancel
                </button>
                <button
                  className={styles.modalButtonPrimary}
                  onClick={() => {
                    setShowChangeToolModal(false)
                    showToast('Database tool updated', 'success')
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Version & Backup Modal */}
        {showVersionBackupModal && (
          <div 
            className={styles.modalOverlay} 
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowVersionBackupModal(false)
              }
            }}
          >
            <div className={`${styles.modalContent} ${styles.largeModal}`} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Version & Backup</h2>
                <button className={styles.modalClose} onClick={() => setShowVersionBackupModal(false)}>×</button>
              </div>
              <div className={styles.modalBody}>
                {/* Current Version */}
                <div className={styles.formGroup}>
                  <label>Current Version</label>
                  <div className={styles.currentVersionDisplay}>
                    <IconPackage className={styles.versionIcon} />
                    <span className={styles.versionName}>{currentVersion}</span>
                  </div>
                </div>

                {/* Backup Actions */}
                <div className={styles.backupActions}>
                  <button 
                    className={styles.backupActionButton}
                    onClick={() => setShowCreateBackupModal(true)}
                  >
                    <IconPackage />
                    <span>Create Backup</span>
                  </button>
                  <button 
                    className={styles.backupActionButton}
                    onClick={() => setShowUploadBackupModal(true)}
                  >
                    <IconUpload />
                    <span>Upload Version</span>
                  </button>
                </div>

                {/* Backup Table */}
                <div className={styles.formGroup} style={{ marginTop: '24px' }}>
                  <label>Backup Versions ({backups.length})</label>
                  {loadingBackups ? (
                    <div className={styles.emptyBackups}>
                      <IconPackage className={styles.emptyIcon} />
                      <p>Loading backups...</p>
                    </div>
                  ) : backups.length === 0 ? (
                    <div className={styles.emptyBackups}>
                      <IconPackage className={styles.emptyIcon} />
                      <p>No backups yet. Create your first backup to get started.</p>
                    </div>
                  ) : (
                    <div className={styles.backupTable}>
                      <table>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Size</th>
                            <th>Last Update</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {backups.map((backup) => (
                            <tr key={backup.id}>
                              <td>{backup.id.substring(0, 8)}...</td>
                              <td>{backup.name} {backup.is_current && <span style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>(Current)</span>}</td>
                              <td>{backup.sizeFormatted || formatBytes(backup.size)}</td>
                              <td>{new Date(backup.lastUpdate).toLocaleDateString()}</td>
                              <td>
                                <div className={styles.backupActionsCell}>
                                  <button
                                    className={styles.backupTableButton}
                                    onClick={() => handleApplyBackup(backup.id)}
                                    title="Apply this backup"
                                  >
                                    Apply
                                  </button>
                                  <button
                                    className={styles.backupTableButton}
                                    onClick={() => handleDownloadBackup(backup.id)}
                                    title="Download backup"
                                  >
                                    <IconDownload />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Auto Backup Settings */}
                <div className={styles.formGroup} style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <label style={{ marginBottom: 0 }}>Auto Backup</label>
                    <label className={styles.toggleSwitch}>
                      <input
                        type="checkbox"
                        checked={autoBackupEnabled}
                        onChange={(e) => setAutoBackupEnabled(e.target.checked)}
                      />
                      <span className={styles.toggleSlider}></span>
                    </label>
                  </div>
                  {autoBackupEnabled && (
                    <div className={styles.autoBackupOptions}>
                      <div className={styles.formGroup}>
                        <label>Backup Interval</label>
                        <select
                          value={autoBackupInterval}
                          onChange={(e) => setAutoBackupInterval(e.target.value as 'week' | 'month' | 'custom')}
                          className={`${styles.formInput} ${styles.selectDropdown}`}
                        >
                          <option value="week">Every Week</option>
                          <option value="month">Every Month</option>
                          <option value="custom">Custom Interval</option>
                        </select>
                      </div>
                      {autoBackupInterval === 'custom' && (
                        <div className={styles.formGroup}>
                          <label>Every (days)</label>
                          <input
                            type="number"
                            value={customBackupDays}
                            onChange={(e) => setCustomBackupDays(Number(e.target.value))}
                            min={1}
                            className={styles.formInput}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.modalButtonSecondary} onClick={() => setShowVersionBackupModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Backup Modal */}
        {showCreateBackupModal && (
          <div 
            className={styles.modalOverlay} 
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowCreateBackupModal(false)
              }
            }}
          >
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Create Backup</h2>
                <button className={styles.modalClose} onClick={() => setShowCreateBackupModal(false)}>×</button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Backup Name</label>
                  <input
                    type="text"
                    value={newBackupName}
                    onChange={(e) => setNewBackupName(e.target.value)}
                    placeholder="e.g., Backup 2024-01-15"
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Estimated Size</label>
                  <div className={styles.estimatedSize}>~2.5 MB</div>
                  <div className={styles.formHelperText}>
                    This is an estimate. Actual size may vary based on data.
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.modalButtonSecondary} onClick={() => setShowCreateBackupModal(false)}>
                  Cancel
                </button>
                <button className={styles.modalButtonPrimary} onClick={handleCreateBackup}>
                  Create Backup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Backup Modal */}
        {showUploadBackupModal && (
          <div 
            className={styles.modalOverlay} 
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowUploadBackupModal(false)
              }
            }}
          >
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Upload Version</h2>
                <button className={styles.modalClose} onClick={() => setShowUploadBackupModal(false)}>×</button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Select ZIP File</label>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleUploadBackup(file)
                      }
                    }}
                    className={styles.fileInput}
                  />
                  <div className={styles.formHelperText}>
                    Upload a valid ZIP file containing schema table data with full data of that version.
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.modalButtonSecondary} onClick={() => setShowUploadBackupModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onClose={removeToast} />
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
            <img src={oneAppLogo} alt="OneApp" className={styles.databaseTypeLogo} />
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

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
