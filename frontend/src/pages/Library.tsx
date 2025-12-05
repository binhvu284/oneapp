import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { allPages, categories, searchPages, type PageInfo, type AppStatus } from '@/data/pages'
import { IconSearch, IconFilter, IconChevronRight } from '@/components/Icons'
import { getIcon } from '@/utils/iconUtils'
import styles from './Library.module.css'

type Section = 'Home' | 'All app' | 'Categories' | 'Upcoming app'

export function Library() {
  const navigate = useNavigate()
  const [section, setSection] = useState<Section>('Home')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

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

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
  }

  const handleBackToCategories = () => {
    setSelectedCategory(null)
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
                          <span className={`${styles.statusBadge} ${getStatusColor(page.status)}`}>
                            {page.status}
                          </span>
                        </div>
                        <p className={styles.pageDescription}>{page.description}</p>
                      </div>
                    </div>
                    <div className={styles.pageMeta}>
                      <span className={`${styles.appTypeBadge} ${getAppTypeColor(page.appType)}`}>
                        {page.appType}
                      </span>
                      <span className={styles.pageCategory}>{page.category}</span>
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
              onClick={() => handleCardClick(page)}
            >
              <div className={styles.listCardLeft}>
                <div className={styles.pageAvatar}>
                  <Icon />
                </div>
                <div className={styles.listCardInfo}>
                  <div className={styles.pageHeader}>
                    <h3 className={styles.pageName}>{page.name}</h3>
                    <span className={`${styles.statusBadge} ${getStatusColor(page.status)}`}>
                      {page.status}
                    </span>
                  </div>
                  <p className={styles.pageDescription}>{page.description}</p>
                  <div className={styles.pageMeta}>
                    <span className={`${styles.appTypeBadge} ${getAppTypeColor(page.appType)}`}>
                      {page.appType}
                    </span>
                    <span className={styles.pageCategory}>{page.category}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Render Categories section
  const renderCategoriesSection = () => {
    if (selectedCategory) {
      // Show apps in selected category
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
                    onClick={() => handleCardClick(page)}
                  >
                    <div className={styles.listCardLeft}>
                      <div className={styles.pageAvatar}>
                        <Icon />
                      </div>
                      <div className={styles.listCardInfo}>
                        <div className={styles.pageHeader}>
                          <h3 className={styles.pageName}>{page.name}</h3>
                          <span className={`${styles.statusBadge} ${getStatusColor(page.status)}`}>
                            {page.status}
                          </span>
                        </div>
                        <p className={styles.pageDescription}>{page.description}</p>
                        <div className={styles.pageMeta}>
                          <span className={`${styles.appTypeBadge} ${getAppTypeColor(page.appType)}`}>
                            {page.appType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    // Show category list
    const categoryList = categories.filter((cat) => cat !== 'All')
    return (
      <div className={styles.categoriesList}>
        {categoryList.map((category) => {
          const categoryApps = allPages.filter((page) => page.category === category)
          return (
            <div
              key={category}
              className={styles.categoryCard}
              onClick={() => handleCategoryClick(category)}
            >
              <div className={styles.categoryCardContent}>
                <h3 className={styles.categoryCardTitle}>{category}</h3>
                <p className={styles.categoryCardCount}>{categoryApps.length} app{categoryApps.length !== 1 ? 's' : ''}</p>
              </div>
              <IconChevronRight className={styles.categoryCardArrow} />
            </div>
          )
        })}
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
              onClick={() => handleCardClick(page)}
            >
              <div className={styles.listCardLeft}>
                <div className={styles.pageAvatar}>
                  <Icon />
                </div>
                <div className={styles.listCardInfo}>
                  <div className={styles.pageHeader}>
                    <h3 className={styles.pageName}>{page.name}</h3>
                    <span className={`${styles.statusBadge} ${getStatusColor(page.status)}`}>
                      {page.status}
                    </span>
                  </div>
                  <p className={styles.pageDescription}>{page.description}</p>
                  <div className={styles.pageMeta}>
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
