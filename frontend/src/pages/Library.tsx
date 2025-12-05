import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { allPages, searchPages, type PageInfo, type AppStatus } from '@/data/pages'
import { IconSearch, IconFilter, IconChevronRight, IconEye, IconExternalLink, IconInUse, IconIntegrated, IconOpenSource, IconCore, IconTools, IconCategory, IconSettings } from '@/components/Icons'
import { getIcon } from '@/utils/iconUtils'
import api from '@/services/api'
import styles from './Library.module.css'

type Section = 'Home' | 'All app' | 'Categories' | 'Upcoming app'

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
}

export function Library() {
  const navigate = useNavigate()
  const [section, setSection] = useState<Section>('Home')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedAppType, setSelectedAppType] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [dbCategories, setDbCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true)
      try {
        const response = await api.get('/categories')
        if (response.data.success) {
          setDbCategories(response.data.data || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        // Fallback to empty array if API fails
        setDbCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  // Get active categories from database, sorted by order
  const categories = useMemo(() => {
    const activeCategories = dbCategories
      .filter((cat) => cat.status === 'active')
      .sort((a, b) => {
        // Sort by order if both have order, otherwise by name
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order
        }
        if (a.order !== undefined) return -1
        if (b.order !== undefined) return 1
        return a.name.localeCompare(b.name)
      })
      .map((cat) => cat.name)
    return ['All', ...activeCategories]
  }, [dbCategories])

  // Home sections configuration
  const homeSections = [
    { id: 'OneApp Core', title: 'OneApp Core', filter: (page: PageInfo) => page.homeSection === 'OneApp Core' },
    { id: 'Sidebar app', title: 'Sidebar App', filter: (page: PageInfo) => page.homeSection === 'Sidebar app' },
    { id: 'Header App', title: 'Header App', filter: (page: PageInfo) => page.homeSection === 'Header App' },
    { id: 'Convenience Tool', title: 'Convenience Tool', filter: (page: PageInfo) => page.homeSection === 'Convenience Tool' },
    { id: 'Coming soon App', title: 'Coming Soon', filter: (page: PageInfo) => page.homeSection === 'Coming soon App' || page.status === 'Coming soon' },
    { id: 'UI/UX app', title: 'UI/UX App', filter: (page: PageInfo) => page.homeSection === 'UI/UX app' },
  ]

  const filteredPages = useMemo(() => {
    let result = allPages

    // Apply section filter
    if (section === 'Upcoming app') {
      result = result.filter((page) => page.status === 'Coming soon')
    } else if (section === 'All app') {
      // Show all apps
      result = result
    } else if (section === 'Categories') {
      // Show categories list - no filtering here, handled in render
      result = []
    } else if (section === 'Home') {
      // Show all apps for home (will be grouped by sections)
      result = result
    }

    // Apply search filter
    if (searchQuery.trim()) {
      result = searchPages(searchQuery).filter((page) => result.includes(page))
    }

    // Apply category filter (when a category is selected in Categories section)
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter((page) => page.category === selectedCategory)
    }

    return result
  }, [section, searchQuery, selectedCategory])

  const handleCardClick = (page: PageInfo) => {
    navigate(`/library/${page.id}`)
  }

  const handleDetailClick = (e: React.MouseEvent, page: PageInfo) => {
    e.stopPropagation()
    navigate(`/library/${page.id}`)
  }

  const handleOpenClick = (e: React.MouseEvent, page: PageInfo) => {
    e.stopPropagation()
    if (page.status === 'Available' && page.enabled) {
      navigate(page.path)
    }
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    setSelectedAppType(null)
  }

  const handleAppTypeClick = (appType: string) => {
    setSelectedAppType(appType)
    setSelectedCategory(null)
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
    setSelectedAppType(null)
  }

  const getStatusColor = (status: AppStatus) => {
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

  const getAppTypeColor = (appType: string) => {
    switch (appType) {
      case 'In use app':
        return styles.appTypeInUse
      case 'Integrated':
        return styles.appTypeIntegrated
      case 'Third party':
        return styles.appTypeThirdParty
      case 'Open source':
        return styles.appTypeOpenSource
      case 'Custom':
        return styles.appTypeCustom
      default:
        return ''
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
    // Try to get icon from database category first
    const dbCategory = dbCategories.find((cat) => cat.name === category)
    if (dbCategory?.icon) {
      // If category has an icon name, try to get it
      try {
        const Icon = getIcon(dbCategory.icon)
        return Icon
      } catch {
        // Fallback to default icon mapping
      }
    }

    // Fallback to default icon mapping
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

  // Render Home section with multiple subsections
  const renderHomeSection = () => {
    const sectionsWithApps = homeSections
      .map((section) => ({
        ...section,
        apps: filteredPages.filter(section.filter),
      }))
      .filter((section) => section.apps.length > 0)

    if (sectionsWithApps.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p>No apps found matching your search.</p>
        </div>
      )
    }

    return (
      <div className={styles.homeSections}>
        {sectionsWithApps.map((section) => (
          <div key={section.id} className={styles.homeSection}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            <div className={styles.pagesContainer}>
              {section.apps.map((page) => {
                const Icon = getIcon(page.icon)
                return (
                  <div
                    key={page.id}
                    className={`${styles.pageCard} ${page.featured ? styles.featured : ''}`}
                    onClick={() => handleCardClick(page)}
                  >
                    <div className={styles.pageCardTop}>
                      <div className={styles.pageAvatar}>
                        <Icon />
                      </div>
                      <div className={styles.pageInfo}>
                        <div className={styles.pageHeader}>
                          <h3 className={styles.pageName}>{page.name}</h3>
                        </div>
                        <p className={styles.pageDescription}>{page.description}</p>
                      </div>
                    </div>
                    <div className={styles.pageMeta}>
                      <span className={`${styles.statusBadge} ${getStatusColor(page.status)}`}>
                        {page.status}
                      </span>
                      <span className={`${styles.appTypeBadge} ${getAppTypeColor(page.appType)}`}>
                        {page.appType}
                      </span>
                      <span className={styles.pageCategory}>{page.category}</span>
                    </div>
                    <div className={styles.cardActions}>
                      <button
                        className={styles.actionButton}
                        onClick={(e) => handleDetailClick(e, page)}
                        title="View Details"
                      >
                        <IconEye />
                        <span>Detail</span>
                      </button>
                      <button
                        className={`${styles.actionButton} ${page.status === 'Available' && page.enabled ? styles.actionButtonPrimary : styles.actionButtonDisabled}`}
                        onClick={(e) => handleOpenClick(e, page)}
                        disabled={page.status !== 'Available' || !page.enabled}
                        title="Open App"
                      >
                        <IconExternalLink />
                        <span>Open</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Render All app section in list view
  const renderAllAppSection = () => {
    if (filteredPages.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p>No apps found matching your search.</p>
        </div>
      )
    }

    return (
      <div className={styles.listView}>
        {filteredPages.map((page) => {
          const Icon = getIcon(page.icon)
          return (
            <div
              key={page.id}
              className={`${styles.listCard} ${page.featured ? styles.featured : ''}`}
            >
              <div className={styles.listCardLeft} onClick={() => handleCardClick(page)}>
                <div className={styles.pageAvatar}>
                  <Icon />
                </div>
                <div className={styles.listCardInfo}>
                  <div className={styles.pageHeader}>
                    <h3 className={styles.pageName}>{page.name}</h3>
                  </div>
                  <p className={styles.pageDescription}>{page.description}</p>
                  <div className={styles.pageMeta}>
                    <span className={`${styles.statusBadge} ${getStatusColor(page.status)}`}>
                      {page.status}
                    </span>
                    <span className={`${styles.appTypeBadge} ${getAppTypeColor(page.appType)}`}>
                      {page.appType}
                    </span>
                    <span className={styles.pageCategory}>{page.category}</span>
                  </div>
                </div>
              </div>
              <div className={styles.listCardActions}>
                <button
                  className={styles.actionButton}
                  onClick={(e) => handleDetailClick(e, page)}
                  title="View Details"
                >
                  <IconEye />
                  <span>Detail</span>
                </button>
                <button
                  className={`${styles.actionButton} ${page.status === 'Available' && page.enabled ? styles.actionButtonPrimary : styles.actionButtonDisabled}`}
                  onClick={(e) => handleOpenClick(e, page)}
                  disabled={page.status !== 'Available' || !page.enabled}
                  title="Open App"
                >
                  <IconExternalLink />
                  <span>Open</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Render Categories section
  const renderCategoriesSection = () => {
    // Show apps in selected app type
    if (selectedAppType) {
      const appTypeApps = allPages.filter((page) => page.appType === selectedAppType)
      const filteredAppTypeApps = searchQuery.trim()
        ? searchPages(searchQuery).filter((page) => appTypeApps.includes(page))
        : appTypeApps

      return (
        <div>
          <button className={styles.backButton} onClick={handleBackToCategories}>
            ← Back to Categories
          </button>
          <h2 className={styles.categoryTitle}>{selectedAppType}</h2>
          {filteredAppTypeApps.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No apps found for this app type.</p>
            </div>
          ) : (
            <div className={styles.listView}>
              {filteredAppTypeApps.map((page) => {
                const Icon = getIcon(page.icon)
                return (
                  <div
                    key={page.id}
                    className={`${styles.listCard} ${page.featured ? styles.featured : ''}`}
                  >
                    <div className={styles.listCardLeft} onClick={() => handleCardClick(page)}>
                      <div className={styles.pageAvatar}>
                        <Icon />
                      </div>
                      <div className={styles.listCardInfo}>
                        <div className={styles.pageHeader}>
                          <h3 className={styles.pageName}>{page.name}</h3>
                        </div>
                        <p className={styles.pageDescription}>{page.description}</p>
                        <div className={styles.pageMeta}>
                          <span className={`${styles.statusBadge} ${getStatusColor(page.status)}`}>
                            {page.status}
                          </span>
                          <span className={`${styles.appTypeBadge} ${getAppTypeColor(page.appType)}`}>
                            {page.appType}
                          </span>
                          <span className={styles.pageCategory}>{page.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.listCardActions}>
                      <button
                        className={styles.actionButton}
                        onClick={(e) => handleDetailClick(e, page)}
                        title="View Details"
                      >
                        <IconEye />
                        <span>Detail</span>
                      </button>
                      <button
                        className={`${styles.actionButton} ${page.status === 'Available' && page.enabled ? styles.actionButtonPrimary : styles.actionButtonDisabled}`}
                        onClick={(e) => handleOpenClick(e, page)}
                        disabled={page.status !== 'Available' || !page.enabled}
                        title="Open App"
                      >
                        <IconExternalLink />
                        <span>Open</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    // Show apps in selected category
    if (selectedCategory) {
      const categoryApps = allPages.filter((page) => page.category === selectedCategory)
      const filteredCategoryApps = searchQuery.trim()
        ? searchPages(searchQuery).filter((page) => categoryApps.includes(page))
        : categoryApps

      return (
        <div>
          <button className={styles.backButton} onClick={handleBackToCategories}>
            ← Back to Categories
          </button>
          <h2 className={styles.categoryTitle}>{selectedCategory}</h2>
          {filteredCategoryApps.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No apps found in this category.</p>
            </div>
          ) : (
            <div className={styles.listView}>
              {filteredCategoryApps.map((page) => {
                const Icon = getIcon(page.icon)
                return (
                  <div
                    key={page.id}
                    className={`${styles.listCard} ${page.featured ? styles.featured : ''}`}
                  >
                    <div className={styles.listCardLeft} onClick={() => handleCardClick(page)}>
                      <div className={styles.pageAvatar}>
                        <Icon />
                      </div>
                      <div className={styles.listCardInfo}>
                        <div className={styles.pageHeader}>
                          <h3 className={styles.pageName}>{page.name}</h3>
                        </div>
                        <p className={styles.pageDescription}>{page.description}</p>
                        <div className={styles.pageMeta}>
                          <span className={`${styles.statusBadge} ${getStatusColor(page.status)}`}>
                            {page.status}
                          </span>
                          <span className={`${styles.appTypeBadge} ${getAppTypeColor(page.appType)}`}>
                            {page.appType}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.listCardActions}>
                      <button
                        className={styles.actionButton}
                        onClick={(e) => handleDetailClick(e, page)}
                        title="View Details"
                      >
                        <IconEye />
                        <span>Detail</span>
                      </button>
                      <button
                        className={`${styles.actionButton} ${page.status === 'Available' && page.enabled ? styles.actionButtonPrimary : styles.actionButtonDisabled}`}
                        onClick={(e) => handleOpenClick(e, page)}
                        disabled={page.status !== 'Available' || !page.enabled}
                        title="Open App"
                      >
                        <IconExternalLink />
                        <span>Open</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    // Show category list with App Type and App Categories sections
    const categoryList = categories.filter((cat) => cat !== 'All')
    return (
      <div className={styles.categoriesContent}>
        {/* App Type Section */}
        <div className={styles.filterSection}>
          <h2 className={styles.filterSectionTitle}>App Type</h2>
          <div className={styles.filterOptions}>
            {['In use app', 'Integrated', 'Open source'].map((type) => {
              const TypeIcon = getAppTypeIcon(type)
              const typeApps = allPages.filter((page) => page.appType === type)
              return (
                <div
                  key={type}
                  className={styles.filterOption}
                  onClick={() => handleAppTypeClick(type)}
                >
                  <TypeIcon className={styles.filterOptionIcon} />
                  <span className={styles.filterOptionText}>{type}</span>
                  <span className={styles.filterOptionCount}>{typeApps.length}</span>
                  <IconChevronRight className={styles.filterOptionArrow} />
                </div>
              )
            })}
          </div>
        </div>

        {/* App Categories Section */}
        <div className={styles.filterSection}>
          <h2 className={styles.filterSectionTitle}>App Categories</h2>
          {loadingCategories ? (
            <div className={styles.loadingState}>
              <p>Loading categories...</p>
            </div>
          ) : categoryList.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No categories found.</p>
            </div>
          ) : (
            <div className={styles.filterOptions}>
              {categoryList.map((category) => {
                const CategoryIcon = getCategoryIcon(category)
                const categoryApps = allPages.filter((page) => page.category === category)
                // Get app count from database if available
                const dbCategory = dbCategories.find((cat) => cat.name === category)
                const appCount = dbCategory?.appCount ?? categoryApps.length
                return (
                  <div
                    key={category}
                    className={styles.filterOption}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <CategoryIcon className={styles.filterOptionIcon} />
                    <span className={styles.filterOptionText}>{category}</span>
                    <span className={styles.filterOptionCount}>{appCount}</span>
                    <IconChevronRight className={styles.filterOptionArrow} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render Upcoming section
  const renderUpcomingSection = () => {
    if (filteredPages.length === 0) {
      return (
        <div className={styles.emptyState}>
          <p>No upcoming apps found.</p>
        </div>
      )
    }

    return (
      <div className={styles.listView}>
        {filteredPages.map((page) => {
          const Icon = getIcon(page.icon)
          return (
            <div
              key={page.id}
              className={`${styles.listCard} ${page.featured ? styles.featured : ''}`}
            >
              <div className={styles.listCardLeft} onClick={() => handleCardClick(page)}>
                <div className={styles.pageAvatar}>
                  <Icon />
                </div>
                <div className={styles.listCardInfo}>
                  <div className={styles.pageHeader}>
                    <h3 className={styles.pageName}>{page.name}</h3>
                  </div>
                  <p className={styles.pageDescription}>{page.description}</p>
                  <div className={styles.pageMeta}>
                    <span className={`${styles.statusBadge} ${getStatusColor(page.status)}`}>
                      {page.status}
                    </span>
                    <span className={`${styles.appTypeBadge} ${getAppTypeColor(page.appType)}`}>
                      {page.appType}
                    </span>
                    <span className={styles.pageCategory}>{page.category}</span>
                    {page.publishDate && (
                      <span className={styles.publishDate}>
                        Expected: {new Date(page.publishDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.listCardActions}>
                <button
                  className={styles.actionButton}
                  onClick={(e) => handleDetailClick(e, page)}
                  title="View Details"
                >
                  <IconEye />
                  <span>Detail</span>
                </button>
                <button
                  className={`${styles.actionButton} ${page.status === 'Available' && page.enabled ? styles.actionButtonPrimary : styles.actionButtonDisabled}`}
                  onClick={(e) => handleOpenClick(e, page)}
                  disabled={page.status !== 'Available' || !page.enabled}
                  title="Open App"
                >
                  <IconExternalLink />
                  <span>Open</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={styles.library}>
      {/* Section Selector */}
      <div className={styles.sectionSelector}>
        {(['Home', 'All app', 'Categories', 'Upcoming app'] as Section[]).map((sec) => (
          <button
            key={sec}
            className={`${styles.sectionButton} ${section === sec ? styles.active : ''}`}
            onClick={() => {
              setSection(sec)
              setSelectedCategory(null)
              setSelectedAppType(null)
            }}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Controls: Search, Filter */}
      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <IconSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <button
          className={`${styles.filterButton} ${showFilters ? styles.active : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          title="Filter options"
        >
          <IconFilter />
        </button>
      </div>

      {/* Category Filters (shown when filter button is active) */}
      {showFilters && (
        <div className={styles.filters}>
          {categories.map((category) => (
            <button
              key={category}
              className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category === 'All' ? null : category)}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        {section === 'Home' && renderHomeSection()}
        {section === 'All app' && renderAllAppSection()}
        {section === 'Categories' && renderCategoriesSection()}
        {section === 'Upcoming app' && renderUpcomingSection()}
      </div>
    </div>
  )
}
