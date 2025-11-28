import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNavigation } from '@/contexts/NavigationContext'
import { IconChevronLeft, IconPlus, IconTrash, IconEdit } from '@/components/Icons'
import { getIcon } from '@/utils/iconUtils'
import styles from './SidebarConfiguration.module.css' // Reuse same styles

export function HeaderSetting() {
  const navigate = useNavigate()
  const {
    config,
    toggleBasicItem,
    addCustomSection,
    deleteCustomSection,
    updateCustomSectionLabel,
    removeItemFromSection,
  } = useNavigation()

  const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [newSectionLabel, setNewSectionLabel] = useState('')
  const [showAddSection, setShowAddSection] = useState(false)

  // Safety check
  if (!config) {
    return <div>Loading...</div>
  }

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

  return (
    <div className={styles.sidebarConfig}>
      <button className={styles.backButton} onClick={() => navigate('/customization/interface')}>
        <IconChevronLeft />
        <span>Back to Interface</span>
      </button>

      <div className={styles.content}>
        {/* Basic Header Items */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Basic Header Items</h2>
            <p className={styles.description}>
              Select which basic function pages should appear in the header.
            </p>
          </div>
          <div className={styles.basicItems}>
            {config.basicItems.map((item) => {
              const Icon = getIcon(item.icon)
              return (
                <label key={item.id} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={() => toggleBasicItem(item.id)}
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
              Create custom sections to organize your header navigation items.
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
                      return (
                        <div key={item.id} className={styles.sectionItem}>
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
                    onClick={() => {
                      // TODO: Open modal/dialog to add item
                      alert('Add item functionality coming soon')
                    }}
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
    </div>
  )
}

