import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNavigation } from '@/contexts/NavigationContext'
import { allPages, categories, searchPages, type PageInfo } from '@/data/pages'
import { IconChevronLeft, IconPlus, IconTrash, IconEdit, IconSearch, IconX, IconFilter } from '@/components/Icons'
import { getIcon } from '@/utils/iconUtils'
import styles from './SidebarConfiguration.module.css'

export function SidebarConfiguration() {
  const navigate = useNavigate()
  const {
    config,
    toggleBasicItem,
    addCustomSection,
    deleteCustomSection,
    updateCustomSectionLabel,
    removeItemFromSection,
    addItemToSection,
    reorderSectionItems,
  } = useNavigation()

  // Safety check
  if (!config) {
    return <div>Loading...</div>
  }

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [newSectionLabel, setNewSectionLabel] = useState('')
  const [showAddSection, setShowAddSection] = useState(false)
  const [addItemModalOpen, setAddItemModalOpen] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedAppType, setSelectedAppType] = useState('All')
  const [showFilters, setShowFilters] = useState(false)
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null)

  const handleStartEdit = (sectionId: string, currentLabel: string) => {
    setEditingSectionId(sectionId)
    setEditingLabel(currentLabel)
  }

  const handleSaveEdit = (sectionId: string) => {
    if (editingLabel.trim()) {
      updateCustomSectionLabel(sectionId, editingLabel.trim())
    }
    setEditingSectionId(null)
    setEditingLabel('')
  }

  const handleAddSection = () => {
    if (newSectionLabel.trim()) {
      addCustomSection(newSectionLabel.trim())
      setNewSectionLabel('')
      setShowAddSection(false)
    }
  }

  const handleOpenAddItemModal = (sectionId: string) => {
    setAddItemModalOpen(sectionId)
    setSearchQuery('')
    setSelectedCategory('All')
    setSelectedAppType('All')
    setShowFilters(false)
  }

  const handleCloseAddItemModal = () => {
    setAddItemModalOpen(null)
    setSearchQuery('')
    setSelectedCategory('All')
    setSelectedAppType('All')
    setShowFilters(false)
  }

  const handleAddItemToSection = (sectionId: string, page: PageInfo) => {
    addItemToSection(sectionId, {
      path: page.path,
      label: page.name,
      icon: page.icon,
    })
    handleCloseAddItemModal()
  }

  // Get available pages (exclude basic items and pages already in the section)
  const getAvailablePages = (sectionId: string) => {
    const section = config.customSections.find((s) => s.id === sectionId)
    const existingItemPaths = section?.items.map((item) => item.path) || []
    const basicItemPaths = config.basicItems.map((item) => item.path)

    let availablePages = allPages.filter(
      (page) =>
        !basicItemPaths.includes(page.path) &&
        !existingItemPaths.includes(page.path) &&
        page.status === 'Available'
    )

    // Apply search filter
    if (searchQuery.trim()) {
      const searchResults = searchPages(searchQuery)
      availablePages = availablePages.filter((page) => searchResults.includes(page))
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      availablePages = availablePages.filter((page) => page.category === selectedCategory)
    }

    // Apply app type filter
    if (selectedAppType !== 'All') {
      availablePages = availablePages.filter((page) => page.appType === selectedAppType)
    }

    return availablePages
  }

  const appTypes = ['All', 'In use app', 'Integrated', 'Third party', 'Open source', 'Custom']

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

  return (
    <div className={styles.sidebarConfig}>
      <button className={styles.backButton} onClick={() => navigate('/customization/interface')}>
        <IconChevronLeft />
        <span>Back to Interface</span>
      </button>

      <div className={styles.content}>
        {/* Basic Navigation Items */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Basic Navigation Items</h2>
            <p className={styles.description}>
              Select which basic function pages should appear in the sidebar (maximum 3).
            </p>
          </div>
          <div className={styles.basicItems}>
            {config.basicItems.map((item) => {
              const Icon = getIcon(item.icon)
              const enabledCount = config.basicItems.filter((i) => i.enabled).length
              const isMaxReached = enabledCount >= 3 && !item.enabled
              
              return (
                <label 
                  key={item.id} 
                  className={`${styles.checkboxItem} ${isMaxReached ? styles.disabled : ''}`}
                  title={isMaxReached ? 'Maximum 3 items can be enabled' : ''}
                >
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={() => toggleBasicItem(item.id)}
                    disabled={isMaxReached}
                  />
                  <Icon className={styles.itemIcon} />
                  <span>{item.label}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Custom Sections */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Custom Sections</h2>
            <p className={styles.description}>
              Create custom sections to organize your navigation items. These appear between basic items and customization.
            </p>
          </div>

          <div className={styles.customSectionsContainer}>
            {config.customSections.map((section) => (
              <div key={section.id} className={styles.customSection}>
                <div className={styles.sectionTitleBar}>
                  {editingSectionId === section.id ? (
                    <div className={styles.editInputGroup}>
                      <input
                        type="text"
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                        onBlur={() => handleSaveEdit(section.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit(section.id)
                          } else if (e.key === 'Escape') {
                            setEditingSectionId(null)
                            setEditingLabel('')
                          }
                        }}
                        className={styles.editInput}
                        autoFocus
                      />
                    </div>
                  ) : (
                    <>
                      <h3>{section.label}</h3>
                      <div className={styles.sectionActions}>
                        <button
                          className={styles.iconButton}
                          onClick={() => handleStartEdit(section.id, section.label)}
                          title="Edit section name"
                        >
                          <IconEdit />
                        </button>
                        <button
                          className={styles.iconButton}
                          onClick={() => deleteCustomSection(section.id)}
                          title="Delete section"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className={styles.sectionItems}>
                  {section.items.length === 0 ? (
                    <p className={styles.emptyMessage}>No items in this section</p>
                  ) : (
                    section.items.map((item) => {
                      const Icon = getIcon(item.icon)
                      const isDragging = draggedItemId === item.id
                      const isDragOver = dragOverItemId === item.id
                      
                      return (
                        <div
                          key={item.id}
                          className={`${styles.sectionItem} ${isDragging ? styles.dragging : ''} ${isDragOver ? styles.dragOver : ''}`}
                          draggable
                          onDragStart={(e) => {
                            setDraggedItemId(item.id)
                            e.dataTransfer.effectAllowed = 'move'
                            e.dataTransfer.setData('text/plain', item.id)
                          }}
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.dataTransfer.dropEffect = 'move'
                            if (draggedItemId !== item.id) {
                              setDragOverItemId(item.id)
                            }
                          }}
                          onDragLeave={() => {
                            setDragOverItemId(null)
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            const draggedId = draggedItemId
                            const targetId = item.id
                            
                            if (draggedId && draggedId !== targetId) {
                              const currentItems = [...section.items]
                              const draggedIndex = currentItems.findIndex((i) => i.id === draggedId)
                              const targetIndex = currentItems.findIndex((i) => i.id === targetId)
                              
                              if (draggedIndex !== -1 && targetIndex !== -1) {
                                // Remove dragged item from its current position
                                const [draggedItem] = currentItems.splice(draggedIndex, 1)
                                // Insert at target position
                                currentItems.splice(targetIndex, 0, draggedItem)
                                // Update the section with reordered items
                                reorderSectionItems(section.id, currentItems)
                              }
                            }
                            
                            setDraggedItemId(null)
                            setDragOverItemId(null)
                          }}
                          onDragEnd={() => {
                            setDraggedItemId(null)
                            setDragOverItemId(null)
                          }}
                        >
                          <div className={styles.dragHandle} title="Drag to reorder">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="9" cy="12" r="1" />
                              <circle cx="9" cy="5" r="1" />
                              <circle cx="9" cy="19" r="1" />
                              <circle cx="15" cy="12" r="1" />
                              <circle cx="15" cy="5" r="1" />
                              <circle cx="15" cy="19" r="1" />
                            </svg>
                          </div>
                          <Icon className={styles.itemIcon} />
                          <span>{item.label}</span>
                          <button
                            className={styles.removeButton}
                            onClick={() => removeItemFromSection(section.id, item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      )
                    })
                  )}
                  <button
                    className={styles.addItemButton}
                    onClick={() => handleOpenAddItemModal(section.id)}
                  >
                    <IconPlus />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>
            ))}

            {showAddSection ? (
              <div className={styles.addSectionForm}>
                <input
                  type="text"
                  value={newSectionLabel}
                  onChange={(e) => setNewSectionLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSection()
                    } else if (e.key === 'Escape') {
                      setShowAddSection(false)
                      setNewSectionLabel('')
                    }
                  }}
                  placeholder="Section name"
                  className={styles.sectionInput}
                  autoFocus
                />
                <div className={styles.addSectionActions}>
                  <button onClick={handleAddSection} className={styles.saveButton}>
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddSection(false)
                      setNewSectionLabel('')
                    }}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className={styles.addSectionButton}
                onClick={() => setShowAddSection(true)}
              >
                <IconPlus />
                <span>Create New Section</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {addItemModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseAddItemModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Add Page to Section</h2>
              <button className={styles.modalClose} onClick={handleCloseAddItemModal}>
                <IconX />
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Search and Filter Row */}
              <div className={styles.searchFilterRow}>
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
                  className={styles.filterToggleButton}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <IconFilter />
                  {(selectedCategory !== 'All' || selectedAppType !== 'All') && (
                    <span className={styles.filterBadge}>
                      {(selectedCategory !== 'All' ? 1 : 0) + (selectedAppType !== 'All' ? 1 : 0)}
                    </span>
                  )}
                </button>
              </div>

              {/* Filters Content */}
              {showFilters && (
                <div className={styles.filterContent}>
                  <div className={styles.filterRow}>
                    <div className={styles.filterGroup}>
                      <span className={styles.filterLabel}>Category:</span>
                      <div className={styles.filterChips}>
                        {categories.map((category) => (
                          <button
                            key={category}
                            className={`${styles.filterChip} ${
                              selectedCategory === category ? styles.active : ''
                            }`}
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className={styles.filterGroup}>
                      <span className={styles.filterLabel}>App Type:</span>
                      <div className={styles.filterChips}>
                        {appTypes.map((appType) => (
                          <button
                            key={appType}
                            className={`${styles.filterChip} ${
                              selectedAppType === appType ? styles.active : ''
                            }`}
                            onClick={() => setSelectedAppType(appType)}
                          >
                            {appType}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pages List */}
              <div className={styles.pagesList}>
                {getAvailablePages(addItemModalOpen).length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No available pages found.</p>
                  </div>
                ) : (
                  getAvailablePages(addItemModalOpen).map((page) => {
                    const Icon = getIcon(page.icon)
                    return (
                      <div
                        key={page.id}
                        className={styles.pageOption}
                        onClick={() => handleAddItemToSection(addItemModalOpen, page)}
                      >
                        <div className={styles.pageOptionLeft}>
                          <div className={styles.pageOptionIcon}>
                            <Icon />
                          </div>
                          <div className={styles.pageOptionInfo}>
                            <h3 className={styles.pageOptionName}>{page.name}</h3>
                            <p className={styles.pageOptionDescription}>{page.description}</p>
                            <div className={styles.pageOptionMeta}>
                              <span className={styles.pageOptionCategory}>{page.category}</span>
                              <span className={`${styles.pageOptionAppType} ${getAppTypeColor(page.appType)}`}>
                                {page.appType}
                              </span>
                            </div>
                          </div>
                        </div>
                        <IconPlus className={styles.addIcon} />
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

