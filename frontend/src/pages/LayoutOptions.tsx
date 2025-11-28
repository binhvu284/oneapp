import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLayout } from '@/contexts/LayoutContext'
import { IconChevronLeft } from '@/components/Icons'
import styles from './LayoutOptions.module.css'

export function LayoutOptions() {
  const navigate = useNavigate()
  const { preferences, setSidebarWidth, setLayoutStyle, setHeaderHeight, setMobileLayoutType } = useLayout()
  const [localSidebarWidth, setLocalSidebarWidth] = useState(preferences.sidebarWidth)
  const [localHeaderHeight, setLocalHeaderHeight] = useState(preferences.headerHeight)

  useEffect(() => {
    setLocalSidebarWidth(preferences.sidebarWidth)
    setLocalHeaderHeight(preferences.headerHeight)
  }, [preferences.sidebarWidth, preferences.headerHeight])

  const handleSidebarWidthChange = (value: number) => {
    setLocalSidebarWidth(value)
    setSidebarWidth(value)
  }

  const handleHeaderHeightChange = (value: number) => {
    setLocalHeaderHeight(value)
    setHeaderHeight(value)
  }

  return (
    <div className={styles.layoutOptions}>
      <button className={styles.backButton} onClick={() => navigate('/customization/interface')}>
        <IconChevronLeft />
        <span>Back to Interface</span>
      </button>
      <div className={styles.content}>
        <div className={`${styles.section} ${styles.desktopOnly}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2>Sidebar Width</h2>
              <button
                className={styles.defaultButton}
                onClick={() => {
                  setSidebarWidth(260)
                  setLocalSidebarWidth(260)
                }}
              >
                Default
              </button>
            </div>
            <p className={styles.description}>
              Adjust the width of the sidebar to fit your preference. Range: 200px - 400px
            </p>
          </div>
          <div className={styles.controlGroup}>
            <div className={styles.sliderContainer}>
              <input
                type="range"
                min="200"
                max="400"
                value={localSidebarWidth}
                onChange={(e) => handleSidebarWidthChange(Number(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderLabels}>
                <span>200px</span>
                <span className={styles.currentValue}>{localSidebarWidth}px</span>
                <span>400px</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.section} ${styles.desktopOnly}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2>Header Height</h2>
              <button
                className={styles.defaultButton}
                onClick={() => {
                  setHeaderHeight(56)
                  setLocalHeaderHeight(56)
                }}
              >
                Default
              </button>
            </div>
            <p className={styles.description}>
              Adjust the height of the header bar. Range: 48px - 80px
            </p>
          </div>
          <div className={styles.controlGroup}>
            <div className={styles.sliderContainer}>
              <input
                type="range"
                min="48"
                max="80"
                value={localHeaderHeight}
                onChange={(e) => handleHeaderHeightChange(Number(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderLabels}>
                <span>48px</span>
                <span className={styles.currentValue}>{localHeaderHeight}px</span>
                <span>80px</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.section} ${styles.desktopOnly}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2>Layout Style</h2>
              <button
                className={styles.defaultButton}
                onClick={() => setLayoutStyle('default')}
              >
                Default
              </button>
            </div>
            <p className={styles.description}>
              Choose between default (flush) or block style (with margins and rounded corners)
            </p>
          </div>
          <div className={styles.controlGroup}>
            <div className={styles.styleOptions}>
              <button
                onClick={() => setLayoutStyle('default')}
                className={`${styles.styleOption} ${preferences.layoutStyle === 'default' ? styles.active : ''}`}
              >
                <div className={styles.stylePreview}>
                  <div className={styles.previewDefault}>
                    <div className={styles.previewSidebar}></div>
                    <div className={styles.previewContent}></div>
                  </div>
                </div>
                <div className={styles.styleInfo}>
                  <h3>Default</h3>
                  <p>Sidebar and header are flush with the edges</p>
                </div>
              </button>
              <button
                onClick={() => setLayoutStyle('block')}
                className={`${styles.styleOption} ${preferences.layoutStyle === 'block' ? styles.active : ''}`}
              >
                <div className={styles.stylePreview}>
                  <div className={styles.previewBlock}>
                    <div className={styles.previewSidebarBlock}></div>
                    <div className={styles.previewContentBlock}></div>
                  </div>
                </div>
                <div className={styles.styleInfo}>
                  <h3>Block</h3>
                  <p>Sidebar and header have rounded corners and margins</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className={`${styles.section} ${styles.mobileOnly}`}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2>Mobile Layout</h2>
              <button
                className={styles.defaultButton}
                onClick={() => setMobileLayoutType('default')}
              >
                Default
              </button>
            </div>
            <p className={styles.description}>
              Choose how the layout behaves on mobile devices. Floating button provides quick access via a draggable button.
            </p>
          </div>
          <div className={styles.controlGroup}>
            <div className={styles.styleOptions}>
              <button
                onClick={() => setMobileLayoutType('default')}
                className={`${styles.styleOption} ${preferences.mobileLayoutType === 'default' ? styles.active : ''}`}
              >
                <div className={styles.stylePreview}>
                  <div className={styles.previewMobileDefault}>
                    <div className={styles.previewMobileSidebar}></div>
                    <div className={styles.previewMobileContent}></div>
                  </div>
                </div>
                <div className={styles.styleInfo}>
                  <h3>Default</h3>
                  <p>Traditional sidebar slide-in from left</p>
                </div>
              </button>
              <button
                onClick={() => setMobileLayoutType('floating')}
                className={`${styles.styleOption} ${preferences.mobileLayoutType === 'floating' ? styles.active : ''}`}
              >
                <div className={styles.stylePreview}>
                  <div className={styles.previewMobileFloating}>
                    <div className={styles.previewFloatingButton}></div>
                    <div className={styles.previewMobileHeader}></div>
                    <div className={styles.previewMobileSidebarRight}></div>
                  </div>
                </div>
                <div className={styles.styleInfo}>
                  <h3>Floating Button</h3>
                  <p>Draggable button with popup header and sidebar</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

