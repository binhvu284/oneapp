import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHeader, type DisplayType } from '@/contexts/HeaderContext'
import { IconChevronLeft } from '@/components/Icons'
import { getIcon } from '@/utils/iconUtils'
import styles from './HeaderSetting.module.css'

export function HeaderSetting() {
  const navigate = useNavigate()
  const {
    config,
    toggleItem,
    updateItemDisplayType,
    updateToggleValues,
    updateDropdownValues,
    updateNavigationPath,
  } = useHeader()

  const [editingDropdown, setEditingDropdown] = useState<string | null>(null)

  const enabledCount = config.items.filter((item) => item.enabled).length
  const maxReached = enabledCount >= 2

  const handleToggleChange = (id: string, value: string) => {
    const item = config.items.find((i) => i.id === id)
    if (item?.toggleValues) {
      updateToggleValues(
        id,
        item.toggleValues.value1,
        item.toggleValues.value2,
        value
      )
    }
  }

  const handleDropdownAdd = (id: string, value: string) => {
    const item = config.items.find((i) => i.id === id)
    if (item?.dropdownValues && value.trim()) {
      updateDropdownValues(id, [...item.dropdownValues, value.trim()])
    }
  }

  const handleDropdownRemove = (id: string, value: string) => {
    const item = config.items.find((i) => i.id === id)
    if (item?.dropdownValues) {
      updateDropdownValues(
        id,
        item.dropdownValues.filter((v) => v !== value)
      )
    }
  }

  return (
    <div className={styles.headerSetting}>
      <button className={styles.backButton} onClick={() => navigate('/customization/interface')}>
        <IconChevronLeft />
        <span>Back to Interface</span>
      </button>

      <div className={styles.content}>
        {/* Header Items */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Header Items</h2>
            <p className={styles.description}>
              Select which items should appear in the header (maximum 2).
            </p>
          </div>

          <div className={styles.itemsList}>
            {config.items.map((item) => {
              const Icon = getIcon(item.icon)
              const isMaxReached = maxReached && !item.enabled

              return (
                <div key={item.id} className={styles.headerItem}>
                  <div className={styles.itemHeader}>
                    <label className={`${styles.checkboxItem} ${isMaxReached ? styles.disabled : ''}`}>
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={() => toggleItem(item.id)}
                        disabled={isMaxReached}
                        title={isMaxReached ? 'Maximum 2 items can be enabled' : ''}
                      />
                      <Icon className={styles.itemIcon} />
                      <span className={styles.itemLabel}>{item.label}</span>
                    </label>
                  </div>

                  {item.enabled && (
                    <div className={styles.displayTypeSection}>
                      <label className={styles.displayTypeLabel}>
                        Display Type:
                        <select
                          value={item.displayType}
                          onChange={(e) => {
                            const newType = e.target.value as DisplayType
                            // Prevent setting Toggle if locked
                            if (newType === 'Toggle' && item.lockToggle) {
                              return
                            }
                            updateItemDisplayType(item.id, newType)
                          }}
                          className={styles.displayTypeSelect}
                          disabled={item.lockToggle && item.displayType === 'Toggle'}
                        >
                          {!item.lockToggle && <option value="Toggle">Toggle</option>}
                          <option value="Dropdown">Dropdown</option>
                          <option value="Navigation">Navigation</option>
                        </select>
                      </label>

                      {/* Toggle Configuration */}
                      {item.displayType === 'Toggle' && item.toggleValues && (
                        <div className={styles.toggleConfig}>
                          <div className={styles.toggleValues}>
                            <label>
                              Value 1:
                              <input
                                type="text"
                                value={item.toggleValues.value1}
                                onChange={(e) =>
                                  updateToggleValues(
                                    item.id,
                                    e.target.value,
                                    item.toggleValues!.value2,
                                    item.toggleValues!.currentValue
                                  )
                                }
                                className={styles.toggleInput}
                              />
                            </label>
                            <label>
                              Value 2:
                              <input
                                type="text"
                                value={item.toggleValues.value2}
                                onChange={(e) =>
                                  updateToggleValues(
                                    item.id,
                                    item.toggleValues!.value1,
                                    e.target.value,
                                    item.toggleValues!.currentValue
                                  )
                                }
                                className={styles.toggleInput}
                              />
                            </label>
                          </div>
                          <div className={styles.toggleCurrent}>
                            <span>Current Value:</span>
                            <div className={styles.toggleButtons}>
                              <button
                                className={`${styles.toggleButton} ${
                                  item.toggleValues.currentValue === item.toggleValues.value1
                                    ? styles.active
                                    : ''
                                }`}
                                onClick={() =>
                                  handleToggleChange(item.id, item.toggleValues!.value1)
                                }
                              >
                                {item.toggleValues.value1}
                              </button>
                              <button
                                className={`${styles.toggleButton} ${
                                  item.toggleValues.currentValue === item.toggleValues.value2
                                    ? styles.active
                                    : ''
                                }`}
                                onClick={() =>
                                  handleToggleChange(item.id, item.toggleValues!.value2)
                                }
                              >
                                {item.toggleValues.value2}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Dropdown Configuration */}
                      {item.displayType === 'Dropdown' && item.dropdownValues && (
                        <div className={styles.dropdownConfig}>
                          <div className={styles.dropdownValues}>
                            {item.dropdownValues.map((value, index) => (
                              <div key={index} className={styles.dropdownValueItem}>
                                <span>{value}</span>
                                <button
                                  onClick={() => handleDropdownRemove(item.id, value)}
                                  className={styles.removeButton}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          {editingDropdown === item.id ? (
                            <div className={styles.addDropdownForm}>
                              <input
                                type="text"
                                placeholder="Add dropdown value"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleDropdownAdd(item.id, e.currentTarget.value)
                                    e.currentTarget.value = ''
                                  } else if (e.key === 'Escape') {
                                    setEditingDropdown(null)
                                  }
                                }}
                                className={styles.dropdownInput}
                                autoFocus
                              />
                              <button
                                onClick={() => setEditingDropdown(null)}
                                className={styles.cancelButton}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingDropdown(item.id)}
                              className={styles.addButton}
                            >
                              + Add Value
                            </button>
                          )}
                        </div>
                      )}

                      {/* Navigation Configuration */}
                      {item.displayType === 'Navigation' && (
                        <div className={styles.navigationConfig}>
                          <label>
                            Navigation Path:
                            <input
                              type="text"
                              value={item.navigationPath || ''}
                              onChange={(e) => updateNavigationPath(item.id, e.target.value)}
                              placeholder="/path/to/page"
                              className={styles.navigationInput}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
