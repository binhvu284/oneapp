import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { allPages, categories, searchPages, type PageInfo } from '@/data/pages'
import { IconSearch } from '@/components/Icons'
import { getIcon } from '@/utils/iconUtils'
import styles from './Library.module.css'

export function Library() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredPages = useMemo(() => {
    let result = allPages

    // Apply search filter
    if (searchQuery.trim()) {
      result = searchPages(searchQuery)
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      result = result.filter((page) => page.category === selectedCategory)
    }

    return result
  }, [searchQuery, selectedCategory])

  const handlePageClick = (page: PageInfo) => {
    navigate(page.path)
  }

  return (
    <div className={styles.library}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Library</h1>
          <p className={styles.subtitle}>Browse and access all pages and applications</p>
        </div>
      </div>

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

        <div className={styles.viewControls}>
          <button
            className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
            title="List view"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.filters}>
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

      <div className={styles.content}>
        {filteredPages.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No pages found matching your search.</p>
          </div>
        ) : (
          <div className={`${styles.pagesContainer} ${viewMode === 'grid' ? styles.grid : styles.list}`}>
            {filteredPages.map((page) => {
              const Icon = getIcon(page.icon)
              return (
                <div
                  key={page.id}
                  className={`${styles.pageCard} ${page.featured ? styles.featured : ''}`}
                  onClick={() => handlePageClick(page)}
                >
                  <div className={styles.pageAvatar}>
                    <Icon />
                  </div>
                  <div className={styles.pageInfo}>
                    <h3 className={styles.pageName}>{page.name}</h3>
                    <p className={styles.pageDescription}>{page.description}</p>
                    <div className={styles.pageMeta}>
                      <span className={styles.pageCategory}>{page.category}</span>
                      {page.featured && <span className={styles.featuredBadge}>Featured</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

