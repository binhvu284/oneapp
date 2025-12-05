import { useState, useMemo, useEffect } from 'react'
import { allPages, type PageInfo, type AppManagementStatus } from '@/data/pages'
import { getIcon } from '@/utils/iconUtils'
import { IconPlus, IconMoreVertical, IconInfo, IconEdit, IconTrash } from '@/components/Icons'
import styles from './ApplicationManagement.module.css'

export function ApplicationManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AppManagementStatus | 'all'>('all')
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  const filteredApps = useMemo(() => {
    let result = allPages

    // Apply search filter
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase()
      result = result.filter(
        (app) =>
          app.name.toLowerCase().includes(lowerQuery) ||
          app.description.toLowerCase().includes(lowerQuery) ||
          app.developer?.toLowerCase().includes(lowerQuery) ||
          app.category.toLowerCase().includes(lowerQuery)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((app) => app.managementStatus === statusFilter)
    }

    return result
  }, [searchQuery, statusFilter])

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return 'N/A'
    }
  }

  const handleCreate = () => {
    // TODO: Implement create functionality
    alert('Create new application - To be implemented')
  }

  const handleViewDetail = (app: PageInfo) => {
    setOpenDropdownId(null)
    // TODO: Implement view detail functionality (could open a modal)
    alert(`View details for ${app.name} - To be implemented`)
  }

  const handleEdit = (app: PageInfo) => {
    setOpenDropdownId(null)
    // TODO: Implement edit functionality
    alert(`Edit ${app.name} - To be implemented`)
  }

  const handleToggleStatus = (app: PageInfo) => {
    setOpenDropdownId(null)
    const newStatus = app.managementStatus === 'active' ? 'inactive' : 'active'
    // TODO: Implement status toggle functionality
    alert(`Toggle ${app.name} status to ${newStatus} - To be implemented`)
  }

  const handleDelete = (app: PageInfo) => {
    setOpenDropdownId(null)
    if (window.confirm(`Are you sure you want to delete "${app.name}"?`)) {
      // TODO: Implement delete functionality
      alert(`Delete ${app.name} - To be implemented`)
    }
  }

  const toggleDropdown = (appId: string) => {
    setOpenDropdownId(openDropdownId === appId ? null : appId)
  }

  return (
    <div className={styles.applicationManagement}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Application Management</h1>
          <p className={styles.subtitle}>Manage, edit, delete, and create all pages and applications</p>
        </div>
        <button className={styles.createButton} onClick={handleCreate}>
          <IconPlus />
          <span>Create Application</span>
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.statusFilter}>
          <button
            className={`${styles.statusButton} ${statusFilter === 'all' ? styles.active : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button
            className={`${styles.statusButton} ${statusFilter === 'active' ? styles.active : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Active
          </button>
          <button
            className={`${styles.statusButton} ${statusFilter === 'inactive' ? styles.active : ''}`}
            onClick={() => setStatusFilter('inactive')}
          >
            Inactive
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Application</th>
              <th>Categories</th>
              <th>Create Date</th>
              <th>Developer</th>
              <th>Publish Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyState}>
                  No applications found matching your search.
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => {
                const Icon = getIcon(app.icon)
                const isDropdownOpen = openDropdownId === app.id
                return (
                  <tr key={app.id}>
                    <td>
                      <div className={styles.appCell}>
                        <div className={styles.appAvatar}>
                          <Icon />
                        </div>
                        <div className={styles.appInfo}>
                          <div className={styles.appName}>{app.name}</div>
                          <div className={styles.appDescription}>{app.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.categoriesCell}>
                        <span className={styles.categoryTag}>{app.category}</span>
                        {app.tags.length > 0 && (
                          <span className={styles.tagsCount}>+{app.tags.length} tags</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={styles.dateCell}>{formatDate(app.createDate)}</span>
                    </td>
                    <td>
                      <span className={styles.developerCell}>{app.developer || 'N/A'}</span>
                    </td>
                    <td>
                      <span className={styles.dateCell}>{formatDate(app.publishDate)}</span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${
                          app.managementStatus === 'active' ? styles.statusActive : styles.statusInactive
                        }`}
                      >
                        {app.managementStatus === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <div className={styles.dropdownContainer}>
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
                                onClick={() => handleViewDetail(app)}
                              >
                                <IconInfo />
                                <span>View Detail</span>
                              </button>
                              <button
                                className={styles.dropdownItem}
                                onClick={() => handleEdit(app)}
                              >
                                <IconEdit />
                                <span>Edit</span>
                              </button>
                              <button
                                className={styles.dropdownItem}
                                onClick={() => handleToggleStatus(app)}
                              >
                                <span>
                                  {app.managementStatus === 'active' ? 'Deactivate' : 'Activate'}
                                </span>
                              </button>
                              <div className={styles.dropdownDivider} />
                              <button
                                className={`${styles.dropdownItem} ${styles.deleteItem}`}
                                onClick={() => handleDelete(app)}
                              >
                                <IconTrash />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
