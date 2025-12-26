import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { allPages, categories, type PageInfo } from '@/data/pages'
import api from '@/services/api'
import { ToastContainer, type Toast } from '@/components/Toast'
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
import { getIcon, iconMap } from '@/utils/iconUtils'
import styles from './OneAppDeveloper.module.css'

type TabType = 'categories' | 'in-use' | 'integrated' | 'open-source'

interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  status: string
  appCount: number
  order?: number
  createdAt: string
  updatedAt: string
}

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
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [dbCategories, setDbCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [showCategoryEditModal, setShowCategoryEditModal] = useState(false)
  const [categoryEditData, setCategoryEditData] = useState<{
    _id: string
    name: string
    slug: string
    description: string
    icon: string
    color: string
  } | null>(null)
  const [categoryApps, setCategoryApps] = useState<any[]>([])
  const [loadingCategoryApps, setLoadingCategoryApps] = useState(false)
  const [showAddAppDropdown, setShowAddAppDropdown] = useState(false)
  const [unassignedApps, setUnassignedApps] = useState<any[]>([])
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null)
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isReordering, setIsReordering] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const reorderInProgressRef = useRef(false)
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
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
    path: string
  } | null>(null)
  const [pathError, setPathError] = useState<string>('')

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

  // Toast helper functions
  const showToast = (message: string, type: Toast['type'] = 'info', duration?: number) => {
    // Prevent duplicate toasts with the same message
    setToasts((prev) => {
      // Check if a toast with the same message already exists
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

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true)
      try {
        // Only make API call if API URL is configured (development or production with backend)
        if (!import.meta.env.VITE_API_URL && !import.meta.env.DEV) {
          console.warn('⚠️  API URL not configured. Categories cannot be loaded in production without backend.')
          showToast('Backend API not configured. Categories feature requires backend deployment.', 'error', 8000)
          setDbCategories([])
          return
        }
        
        const response = await api.get('/categories')
        if (response.data.success) {
          setDbCategories(response.data.data || [])
        }
      } catch (error: any) {
        console.error('Error fetching categories:', error)
        // Show helpful error message in production
        if (!import.meta.env.DEV) {
          showToast('Failed to load categories. Backend API may not be deployed.', 'error', 8000)
        }
        // Fallback to empty array if API fails
        setDbCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }

    if (activeTab === 'categories') {
      fetchCategories()
    }
  }, [activeTab])

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

  const handleViewDetail = async (app: PageInfo) => {
    setSelectedApp(app)
    setIsEditMode(false)
    setPathError('')
    
    // Fetch actual app data from database if it's an "In use app"
    if (app.appType === 'In use app') {
      try {
        const response = await api.get(`/in-use-app/${app.id}`)
        if (response.data.success) {
          const dbApp = response.data.data
          setEditFormData({
            description: dbApp.description || app.description,
            longDescription: dbApp.longDescription || dbApp.description || app.description,
            image: dbApp.image || app.image || '',
            category: dbApp.category || app.category,
            path: dbApp.path || app.path,
          })
        } else {
          // Fallback to app data if database fetch fails
          setEditFormData({
            description: app.description,
            longDescription: app.description,
            image: app.image || '',
            category: app.category,
            path: app.path,
          })
        }
      } catch (error) {
        console.error('Error fetching app from database:', error)
        // Fallback to app data if database fetch fails
        setEditFormData({
          description: app.description,
          longDescription: app.description,
          image: app.image || '',
          category: app.category,
          path: app.path,
        })
      }
    } else {
      // For non "In use app" types, use the app data directly
      setEditFormData({
        description: app.description,
        longDescription: app.description,
        image: app.image || '',
        category: app.category,
        path: app.path,
      })
    }
    
    setShowAppDetailModal(true)
  }

  const validatePath = async (path: string, currentAppId: string): Promise<string> => {
    if (!path || !path.trim()) {
      return 'App URL is required'
    }

    // Ensure path starts with /
    const normalizedPath = path.trim().startsWith('/') ? path.trim() : `/${path.trim()}`

    try {
      // Fetch all apps from database to check for duplicates
      const dbResponse = await api.get('/in-use-app')
      if (dbResponse.data.success) {
        const dbApps = dbResponse.data.data || []
        const duplicate = dbApps.find(
          (app: any) => app.path === normalizedPath && app.id !== currentAppId
        )
        if (duplicate) {
          return `This URL is already used by "${duplicate.name}"`
        }
      }
    } catch (error) {
      console.error('Error validating path:', error)
      // Continue with validation if API fails
    }

    // Also check against allPages to catch any other apps that might have this path
    // This includes Integrated, Open source, and other app types
    const duplicateInPages = allPages.find(
      (app) => app.path === normalizedPath && app.id !== currentAppId
    )
    if (duplicateInPages) {
      return `This URL is already used by "${duplicateInPages.name}"`
    }

    return ''
  }

  const handlePathChange = async (newPath: string) => {
    if (!selectedApp || !editFormData) return

    setEditFormData({ ...editFormData, path: newPath })
    
    const error = await validatePath(newPath, selectedApp.id)
    setPathError(error)
  }

  const handleSaveEdit = async () => {
    if (!selectedApp || !editFormData) return

    // Validate path
    if (!editFormData.path || !editFormData.path.trim()) {
      setPathError('App URL is required')
      return
    }

    const pathValidationError = await validatePath(editFormData.path, selectedApp.id)
    if (pathValidationError) {
      setPathError(pathValidationError)
      return
    }

    try {
      // Normalize path
      const normalizedPath = editFormData.path.trim().startsWith('/') 
        ? editFormData.path.trim() 
        : `/${editFormData.path.trim()}`

      const updateData: any = {
        description: editFormData.description,
        category: editFormData.category,
        path: normalizedPath,
      }

      if (editFormData.longDescription !== undefined) {
        updateData.longDescription = editFormData.longDescription
      }
      if (editFormData.image !== undefined) {
        updateData.image = editFormData.image || null
      }

      const response = await api.put(`/in-use-app/${selectedApp.id}`, updateData)
      
      if (response.data.success) {
        // Update local state
        const updatedApp = { ...selectedApp, ...updateData }
        setSelectedApp(updatedApp)
        
        setIsEditMode(false)
        setPathError('')
        showToast('App updated successfully', 'success')
      } else {
        showToast(response.data.error || 'Failed to update app', 'error')
      }
    } catch (error: any) {
      console.error('Error saving app:', error)
      showToast(error.response?.data?.error || 'Failed to update app', 'error')
    }
  }

  const handleCancelEdit = () => {
    if (selectedApp) {
      setEditFormData({
        description: selectedApp.description,
        longDescription: selectedApp.description,
        image: selectedApp.image || '',
        category: selectedApp.category,
        path: selectedApp.path,
      })
    }
    setPathError('')
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

  const handleAddCategory = async () => {
    // Prevent adding category if we're currently dragging
    if (isDragging) {
      return
    }
    // Note: Add category functionality should use a modal similar to edit
    // For now, keeping simple inline add
    const categoryName = prompt('Enter category name:')
    if (!categoryName || !categoryName.trim()) {
      return
    }

    try {
      const response = await api.post('/categories', {
        name: categoryName.trim(),
      })

      if (response.data.success) {
        // Refresh categories list
        const refreshResponse = await api.get('/categories')
        if (refreshResponse.data.success) {
          setDbCategories(refreshResponse.data.data || [])
        }
        setShowAddCategory(false)
        showToast('Category added successfully', 'success')
      } else {
        showToast(response.data.error || 'Failed to add category', 'error')
      }
    } catch (error: any) {
      console.error('Error adding category:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to add category'
      showToast(errorMessage, 'error')
    }
  }

  const handleEditCategory = async (category: Category) => {
    setCategoryEditData({
      _id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '',
    })
    setShowCategoryEditModal(true)
    
    // Fetch apps for this category
    setLoadingCategoryApps(true)
    try {
      const appsResponse = await api.get('/in-use-app')
      if (appsResponse.data.success) {
        const allApps = appsResponse.data.data || []
        const categoryAppsList = allApps.filter((app: any) => app.category === category.name)
        setCategoryApps(categoryAppsList)
        
        // Get unassigned apps (apps with empty category or not in any category)
        const unassigned = allApps.filter((app: any) => !app.category || app.category === '')
        setUnassignedApps(unassigned)
      }
    } catch (error: any) {
      console.error('Error fetching category apps:', error)
      showToast('Failed to load apps for this category', 'error')
    } finally {
      setLoadingCategoryApps(false)
    }
  }

  const handleSaveCategory = async () => {
    if (!categoryEditData || !categoryEditData.name.trim()) {
      showToast('Category name is required', 'error')
      return
    }

    try {
      const response = await api.put(`/categories/${categoryEditData._id}`, {
        name: categoryEditData.name.trim(),
        slug: categoryEditData.slug.trim(),
        description: categoryEditData.description || null,
        icon: categoryEditData.icon || null,
        color: categoryEditData.color || null,
      })

      if (response.data.success) {
        // Refresh categories list
        const refreshResponse = await api.get('/categories')
        if (refreshResponse.data.success) {
          setDbCategories(refreshResponse.data.data || [])
        }
        setShowCategoryEditModal(false)
        setCategoryEditData(null)
        showToast('Category updated successfully', 'success')
      } else {
        showToast(response.data.error || 'Failed to update category', 'error')
      }
    } catch (error: any) {
      console.error('Error updating category:', error)
      showToast(error.response?.data?.error || 'Failed to update category', 'error')
    }
  }

  const handleRemoveAppFromCategory = async (appId: string) => {
    try {
      const response = await api.put(`/in-use-app/${appId}`, {
        category: '',
      })

      if (response.data.success) {
        // Refresh category apps
        const appsResponse = await api.get('/in-use-app')
        if (appsResponse.data.success) {
          const allApps = appsResponse.data.data || []
          const categoryName = categoryEditData?.name || ''
          const categoryAppsList = allApps.filter((app: any) => app.category === categoryName)
          setCategoryApps(categoryAppsList)
          
          const unassigned = allApps.filter((app: any) => !app.category || app.category === '')
          setUnassignedApps(unassigned)
        }
        
        // Refresh categories to update appCount
        const refreshResponse = await api.get('/categories')
        if (refreshResponse.data.success) {
          setDbCategories(refreshResponse.data.data || [])
        }
        
        showToast('App removed from category', 'success')
      } else {
        showToast(response.data.error || 'Failed to remove app', 'error')
      }
    } catch (error: any) {
      console.error('Error removing app from category:', error)
      showToast(error.response?.data?.error || 'Failed to remove app', 'error')
    }
  }

  const handleAddAppToCategory = async (appId: string) => {
    if (!categoryEditData) return
    
    try {
      const response = await api.put(`/in-use-app/${appId}`, {
        category: categoryEditData.name,
      })

      if (response.data.success) {
        // Refresh category apps
        const appsResponse = await api.get('/in-use-app')
        if (appsResponse.data.success) {
          const allApps = appsResponse.data.data || []
          const categoryName = categoryEditData.name
          const categoryAppsList = allApps.filter((app: any) => app.category === categoryName)
          setCategoryApps(categoryAppsList)
          
          const unassigned = allApps.filter((app: any) => !app.category || app.category === '')
          setUnassignedApps(unassigned)
        }
        
        // Refresh categories to update appCount
        const refreshResponse = await api.get('/categories')
        if (refreshResponse.data.success) {
          setDbCategories(refreshResponse.data.data || [])
        }
        
        setShowAddAppDropdown(false)
        showToast('App added to category', 'success')
      } else {
        showToast(response.data.error || 'Failed to add app', 'error')
      }
    } catch (error: any) {
      console.error('Error adding app to category:', error)
      showToast(error.response?.data?.error || 'Failed to add app', 'error')
    }
  }

  const handleDeleteCategoryClick = (category: Category) => {
    setCategoryToDelete(category)
    setShowDeleteCategoryModal(true)
  }

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return

    try {
      const response = await api.delete(`/categories/${categoryToDelete._id}`)

      if (response.data.success) {
        // Refresh categories list
        const refreshResponse = await api.get('/categories')
        if (refreshResponse.data.success) {
          setDbCategories(refreshResponse.data.data || [])
        }
        setShowDeleteCategoryModal(false)
        setCategoryToDelete(null)
        showToast('Category deleted successfully', 'success')
      } else {
        showToast(response.data.error || 'Failed to delete category', 'error')
      }
    } catch (error: any) {
      console.error('Error deleting category:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete category'
      showToast(errorMessage, 'error')
    }
  }

  const handleCancelDeleteCategory = () => {
    setShowDeleteCategoryModal(false)
    setCategoryToDelete(null)
  }

  const handleDragStart = (categoryId: string) => {
    setDraggedCategoryId(categoryId)
    setIsDragging(true)
  }

  const handleDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault()
    if (categoryId !== draggedCategoryId) {
      setDragOverCategoryId(categoryId)
    }
  }

  const handleDragLeave = () => {
    setDragOverCategoryId(null)
  }

  const handleDrop = async (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOverCategoryId(null)

    // Prevent multiple simultaneous reorder requests using both state and ref
    if (isReordering || reorderInProgressRef.current) {
      setDraggedCategoryId(null)
      return
    }

    if (!draggedCategoryId || draggedCategoryId === targetCategoryId) {
      setDraggedCategoryId(null)
      return
    }

    // Reorder categories locally
    const reorderedCategories = [...dbCategories]
    const draggedIndex = reorderedCategories.findIndex(cat => cat._id === draggedCategoryId)
    const targetIndex = reorderedCategories.findIndex(cat => cat._id === targetCategoryId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedCategoryId(null)
      return
    }

    // Remove dragged category and insert at target position
    const [draggedCategory] = reorderedCategories.splice(draggedIndex, 1)
    reorderedCategories.splice(targetIndex, 0, draggedCategory)

    // Update order values
    const categoryIds = reorderedCategories.map(cat => cat._id)

    // Validate categoryIds array
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      console.error('Invalid categoryIds:', categoryIds)
      setDraggedCategoryId(null)
      return
    }

    // Optimistically update UI
    setDbCategories(reorderedCategories)
    setIsReordering(true)
    reorderInProgressRef.current = true

    // Save to database
    try {
      const response = await api.put('/categories/reorder', { categoryIds })
      if (!response.data.success) {
        // Revert on error
        const refreshResponse = await api.get('/categories')
        if (refreshResponse.data.success) {
          setDbCategories(refreshResponse.data.data || [])
        }
        showToast(response.data.error || 'Failed to reorder categories', 'error')
      } else {
        // Only show success toast once
        showToast('Categories reordered successfully', 'success')
      }
    } catch (error: any) {
      console.error('Error reordering categories:', error)
      // Revert on error
      try {
        const refreshResponse = await api.get('/categories')
        if (refreshResponse.data.success) {
          setDbCategories(refreshResponse.data.data || [])
        }
      } catch (refreshError) {
        console.error('Error refreshing categories:', refreshError)
      }
      const errorMessage = error.response?.data?.error || error.message || 'Failed to reorder categories'
      showToast(errorMessage, 'error')
    } finally {
      setIsReordering(false)
      reorderInProgressRef.current = false
      setDraggedCategoryId(null)
    }
  }

  const handleDragEnd = () => {
    // Use setTimeout to prevent immediate click events after drag
    setTimeout(() => {
      setIsDragging(false)
    }, 100)
    setDraggedCategoryId(null)
    setDragOverCategoryId(null)
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
    return (
      <div className={styles.categoriesTab}>
        <div className={styles.sectionHeader}>
          <h2>Manage Categories</h2>
          <p className={styles.sectionDescription}>
            Create and manage categories to organize applications in the library.
          </p>
        </div>

        {loadingCategories ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading categories...
          </div>
        ) : (
          <div className={styles.categoriesList}>
            {dbCategories.map((category) => (
              <div
                key={category._id}
                className={`${styles.categoryItem} ${draggedCategoryId === category._id ? styles.dragging : ''} ${dragOverCategoryId === category._id ? styles.dragOver : ''}`}
                draggable={!isReordering}
                onDragStart={(e) => {
                  if (!isReordering) {
                    e.dataTransfer.effectAllowed = 'move'
                    e.stopPropagation()
                    handleDragStart(category._id)
                  } else {
                    e.preventDefault()
                  }
                }}
                onDragOver={(e) => {
                  if (draggedCategoryId && !isReordering) {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDragOver(e, category._id)
                  }
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleDragLeave()
                }}
                onDrop={(e) => {
                  if (draggedCategoryId && !isReordering && !reorderInProgressRef.current) {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDrop(e, category._id)
                  } else {
                    e.preventDefault()
                    e.stopPropagation()
                  }
                }}
                onDragEnd={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleDragEnd()
                }}
                onMouseDown={(e) => {
                  // Prevent drag from triggering click events on buttons/inputs
                  const target = e.target as HTMLElement
                  if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.closest('button') || target.closest('input')) {
                    e.stopPropagation()
                    return
                  }
                  // If clicking on drag handle, allow drag
                  if (target.closest(`.${styles.dragHandle}`)) {
                    return
                  }
                }}
                onClick={(e) => {
                  // Prevent click events during or immediately after drag
                  if (isDragging || draggedCategoryId) {
                    e.preventDefault()
                    e.stopPropagation()
                    return
                  }
                  // Open edit modal when clicking on category item (but not on buttons)
                  const target = e.target as HTMLElement
                  if (!target.closest('button')) {
                    handleEditCategory(category)
                  }
                }}
              >
                <div className={styles.categoryInfo}>
                  <div 
                    className={styles.dragHandle} 
                    title="Drag to reorder"
                    onMouseDown={(e) => {
                      // Only allow drag from the handle, prevent clicks
                      e.stopPropagation()
                    }}
                    onClick={(e) => {
                      // Prevent click events on drag handle
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    {category.icon ? (
                      (() => {
                        const IconComponent = getIcon(category.icon)
                        return <IconComponent className={styles.categoryIcon} style={{ color: category.color || undefined }} />
                      })()
                    ) : (
                      <IconCategory className={styles.categoryIcon} style={{ color: category.color || undefined }} />
                    )}
                  </div>
                  <span className={styles.categoryName}>{category.name}</span>
                  <span className={styles.categoryCount}>
                    {category.appCount} {category.appCount === 1 ? 'app' : 'apps'}
                  </span>
                </div>
                <div className={styles.categoryActions}>
                  <button
                    className={styles.iconButton}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditCategory(category)
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    title="Edit"
                  >
                    <IconEdit />
                  </button>
                  <button
                    className={styles.iconButton}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteCategoryClick(category)
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    title="Delete"
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>
            ))}

          {showAddCategory ? (
            <div className={styles.addCategoryForm}>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  // Prevent Enter key if we're dragging
                  if (isDragging || draggedCategoryId) {
                    return
                  }
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
              <button 
                className={styles.saveButton} 
                onClick={(e) => {
                  // Prevent click if we're dragging
                  if (isDragging || draggedCategoryId) {
                    e.preventDefault()
                    e.stopPropagation()
                    return
                  }
                  e.stopPropagation()
                  handleAddCategory()
                }}
                onMouseDown={(e) => {
                  if (isDragging || draggedCategoryId) {
                    e.preventDefault()
                    e.stopPropagation()
                    return
                  }
                  e.stopPropagation()
                }}
              >
                Add
              </button>
              <button
                className={styles.cancelButton}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowAddCategory(false)
                  setNewCategoryName('')
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button 
              className={styles.addCategoryButton} 
              onClick={(e) => {
                // Prevent click if we're dragging
                if (isDragging || draggedCategoryId) {
                  e.preventDefault()
                  e.stopPropagation()
                  return
                }
                e.stopPropagation()
                setShowAddCategory(true)
              }}
              onMouseDown={(e) => {
                // Prevent mouse down if we're dragging
                if (isDragging || draggedCategoryId) {
                  e.preventDefault()
                  e.stopPropagation()
                  return
                }
                e.stopPropagation()
              }}
            >
              <IconPlus />
              <span>Add Category</span>
            </button>
          )}
          </div>
        )}
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
                    <label>App URL</label>
                    <input
                      type="text"
                      placeholder="/app-path"
                      value={editFormData.path}
                      onChange={(e) => handlePathChange(e.target.value)}
                      className={pathError ? styles.inputError : ''}
                    />
                    {pathError && <span className={styles.errorText}>{pathError}</span>}
                    <small className={styles.formHint}>The URL path for this app (must start with /)</small>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Category</label>
                    <select
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    >
                      {dbCategories
                        .filter((cat) => cat.status === 'active')
                        .map((category) => (
                          <option key={category._id} value={category.name}>
                            {category.name}
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

      {/* Delete Category Confirmation Modal */}
      {showDeleteCategoryModal && categoryToDelete && (
        <div className={styles.modalOverlay} onClick={handleCancelDeleteCategory}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Delete Category</h2>
              <button className={styles.modalClose} onClick={handleCancelDeleteCategory}>×</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                Are you sure you want to delete the category <strong>"{categoryToDelete.name}"</strong>?
              </p>
              {categoryToDelete.appCount > 0 && (
                <div style={{ 
                  padding: '12px', 
                  background: 'var(--warning-light)', 
                  borderRadius: '8px', 
                  marginBottom: '16px',
                  color: 'var(--warning)',
                  fontSize: '0.9rem'
                }}>
                  ⚠️ This category has {categoryToDelete.appCount} {categoryToDelete.appCount === 1 ? 'app' : 'apps'}. 
                  You cannot delete a category that has apps assigned to it.
                </div>
              )}
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                This action cannot be undone.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.modalButtonSecondary} onClick={handleCancelDeleteCategory}>
                Cancel
              </button>
              <button 
                className={styles.modalButtonPrimary} 
                onClick={handleConfirmDeleteCategory}
                disabled={categoryToDelete.appCount > 0}
                style={{
                  background: categoryToDelete.appCount > 0 ? 'var(--bg-hover)' : 'var(--danger)',
                  color: categoryToDelete.appCount > 0 ? 'var(--text-secondary)' : 'white',
                  cursor: categoryToDelete.appCount > 0 ? 'not-allowed' : 'pointer',
                  opacity: categoryToDelete.appCount > 0 ? 0.6 : 1
                }}
              >
                Delete Category
              </button>
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

      {/* Category Edit Modal */}
      {showCategoryEditModal && categoryEditData && (
        <div className={styles.modalOverlay} onClick={() => setShowCategoryEditModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.modalHeader} style={{ flexShrink: 0 }}>
              <h2>Edit Category</h2>
              <button className={styles.modalClose} onClick={() => setShowCategoryEditModal(false)}>×</button>
            </div>
            <div className={styles.modalBody} style={{ overflowY: 'auto', flex: 1, padding: '32px' }}>
              {/* Visual Preview Section */}
              <div className={styles.categoryPreviewSection}>
                <div className={styles.categoryPreviewCard}>
                  {categoryEditData.icon ? (
                    (() => {
                      const IconComponent = getIcon(categoryEditData.icon)
                      return (
                        <div className={styles.categoryPreviewIcon} style={{ color: categoryEditData.color || '#3B82F6' }}>
                          <IconComponent />
                        </div>
                      )
                    })()
                  ) : (
                    <div className={styles.categoryPreviewIcon} style={{ color: categoryEditData.color || '#3B82F6' }}>
                      <IconCategory />
                    </div>
                  )}
                  <div className={styles.categoryPreviewInfo}>
                    <div className={styles.categoryPreviewName}>{categoryEditData.name || 'Category Name'}</div>
                    <div className={styles.categoryPreviewSlug}>{categoryEditData.slug || 'category-slug'}</div>
                  </div>
                </div>
              </div>

              {/* Form Fields Grid */}
              <div className={styles.categoryFormGrid}>
                {/* Category Icon */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <span>Category Icon</span>
                  </label>
                  <select
                    value={categoryEditData.icon}
                    onChange={(e) => setCategoryEditData({ ...categoryEditData, icon: e.target.value })}
                    className={styles.formSelect}
                  >
                    <option value="">Select an icon</option>
                    {Object.keys(iconMap).map((iconName) => (
                      <option key={iconName} value={iconName}>
                        {iconName.replace('Icon', '')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Color */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    <span>Category Color</span>
                  </label>
                  <div className={styles.colorPickerGroup}>
                    <div className={styles.colorPickerWrapper}>
                      <input
                        type="color"
                        value={categoryEditData.color || '#3B82F6'}
                        onChange={(e) => setCategoryEditData({ ...categoryEditData, color: e.target.value })}
                        className={styles.colorPicker}
                      />
                    </div>
                    <input
                      type="text"
                      value={categoryEditData.color || ''}
                      onChange={(e) => setCategoryEditData({ ...categoryEditData, color: e.target.value })}
                      placeholder="#3B82F6"
                      className={styles.formInput}
                    />
                  </div>
                </div>
              </div>

              {/* Category Name */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <span>Category Name</span>
                  <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  value={categoryEditData.name}
                  onChange={(e) => {
                    const newName = e.target.value
                    setCategoryEditData({
                      ...categoryEditData,
                      name: newName,
                      // Auto-generate slug if empty
                      slug: categoryEditData.slug || newName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''),
                    })
                  }}
                  className={styles.formInput}
                  required
                  placeholder="Enter category name"
                />
              </div>

              {/* Slug */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <span>Slug</span>
                  <span className={styles.formHint}>(auto-generated)</span>
                </label>
                <input
                  type="text"
                  value={categoryEditData.slug}
                  onChange={(e) => {
                    const newSlug = e.target.value.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
                    setCategoryEditData({ ...categoryEditData, slug: newSlug })
                  }}
                  className={styles.formInput}
                  placeholder="category-slug"
                />
                <div className={styles.formHelperText}>
                  URL-friendly identifier used in URLs and routes
                </div>
              </div>

              {/* Description */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <span>Description</span>
                </label>
                <textarea
                  value={categoryEditData.description}
                  onChange={(e) => setCategoryEditData({ ...categoryEditData, description: e.target.value })}
                  className={styles.formTextarea}
                  rows={4}
                  placeholder="Describe what this category is for..."
                />
              </div>

              {/* App List Section */}
              <div className={styles.categoryAppsSection}>
                <div className={styles.categoryAppsHeader}>
                  <div>
                    <label className={styles.formLabel} style={{ marginBottom: '4px' }}>
                      <span>Apps in this Category</span>
                    </label>
                    <div className={styles.categoryAppsCount}>
                      {categoryApps.length} {categoryApps.length === 1 ? 'app' : 'apps'}
                    </div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <button
                      className={styles.addAppButton}
                      onClick={() => setShowAddAppDropdown(!showAddAppDropdown)}
                    >
                      <IconPlus />
                      <span>Add App</span>
                    </button>
                    {showAddAppDropdown && (
                      <div className={styles.addAppDropdown}>
                        {unassignedApps.length === 0 ? (
                          <div className={styles.addAppDropdownEmpty}>
                            No unassigned apps available
                          </div>
                        ) : (
                          unassignedApps.map((app) => (
                            <div
                              key={app._id || app.id}
                              className={styles.addAppDropdownItem}
                              onClick={() => handleAddAppToCategory(app._id || app.id)}
                            >
                              {app.icon && (() => {
                                const IconComponent = getIcon(app.icon)
                                return <IconComponent className={styles.addAppDropdownIcon} />
                              })()}
                              <div className={styles.addAppDropdownInfo}>
                                <div className={styles.addAppDropdownName}>{app.name}</div>
                                {app.shortDescription && (
                                  <div className={styles.addAppDropdownDesc}>{app.shortDescription}</div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {loadingCategoryApps ? (
                  <div className={styles.categoryAppsLoading}>
                    Loading apps...
                  </div>
                ) : categoryApps.length === 0 ? (
                  <div className={styles.categoryAppsEmpty}>
                    <IconCategory className={styles.categoryAppsEmptyIcon} />
                    <div className={styles.categoryAppsEmptyText}>No apps in this category</div>
                    <div className={styles.categoryAppsEmptyHint}>Click "Add App" to assign apps to this category</div>
                  </div>
                ) : (
                  <div className={styles.categoryAppsList}>
                    {categoryApps.map((app) => (
                      <div key={app._id || app.id} className={styles.categoryAppItem}>
                        {app.icon && (() => {
                          const IconComponent = getIcon(app.icon)
                          return <IconComponent className={styles.categoryAppIcon} />
                        })()}
                        <div className={styles.categoryAppInfo}>
                          <div className={styles.categoryAppName}>{app.name}</div>
                          {app.shortDescription && (
                            <div className={styles.categoryAppDesc}>{app.shortDescription}</div>
                          )}
                          <div className={styles.categoryAppBadges}>
                            <span className={styles.categoryAppBadge}>{app.appType || 'In use app'}</span>
                            <span className={`${styles.categoryAppBadge} ${styles.categoryAppBadgeStatus} ${styles[`status${app.status?.replace(/\s+/g, '')}`] || ''}`}>
                              {app.status}
                            </span>
                          </div>
                        </div>
                        <button
                          className={styles.categoryAppRemoveButton}
                          onClick={() => handleRemoveAppFromCategory(app._id || app.id)}
                          title="Remove from category"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter} style={{ flexShrink: 0 }}>
              <button className={styles.modalButtonSecondary} onClick={() => setShowCategoryEditModal(false)}>
                Cancel
              </button>
              <button className={styles.modalButtonPrimary} onClick={handleSaveCategory}>
                Save Changes
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
