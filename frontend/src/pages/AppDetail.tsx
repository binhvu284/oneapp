import { useParams, useNavigate } from 'react-router-dom'
import { getPageById } from '@/data/pages'
import { getIcon } from '@/utils/iconUtils'
import { IconCode, IconChevronLeft, IconInUse, IconIntegrated, IconOpenSource, IconCore, IconTools, IconCategory, IconSettings } from '@/components/Icons'
import styles from './AppDetail.module.css'

export function AppDetail() {
  const { appId } = useParams<{ appId: string }>()
  const navigate = useNavigate()
  const app = appId ? getPageById(appId) : undefined

  if (!app) {
    return (
      <div className={styles.appDetail}>
        <div className={styles.notFound}>
          <h2>Application not found</h2>
          <p>The application you're looking for doesn't exist.</p>
          <button className={styles.backButton} onClick={() => navigate('/library')}>
            <IconChevronLeft />
            <span>Back to Library</span>
          </button>
        </div>
      </div>
    )
  }

  const Icon = getIcon(app.icon)

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

  const handleDownloadSource = () => {
    if (app.sourceCodeUrl) {
      window.open(app.sourceCodeUrl, '_blank')
    }
  }

  const handleOpenApp = () => {
    if (app.status === 'Available' && app.enabled) {
      navigate(app.path)
    }
  }

  return (
    <div className={styles.appDetail}>
      <button className={styles.backButton} onClick={() => navigate('/library')}>
        <IconChevronLeft />
        <span>Back to Library</span>
      </button>

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.appIcon}>
            <Icon />
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.appName}>{app.name}</h1>
            <p className={styles.appDescription}>{app.description}</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          {app.status === 'Available' && app.enabled ? (
            <button className={styles.headerButton} onClick={handleOpenApp}>
              Open App
            </button>
          ) : (
            <button className={styles.headerButtonDisabled} disabled>
              {app.status === 'Coming soon' ? 'Coming Soon' : 'Unavailable'}
            </button>
          )}
          {app.appType === 'Open source' && (
            <button
              className={app.sourceCodeUrl ? styles.headerButtonSecondary : styles.headerButtonSecondaryDisabled}
              onClick={handleDownloadSource}
              disabled={!app.sourceCodeUrl}
              title={app.sourceCodeUrl ? 'Download Source Code' : 'Source code URL not available'}
            >
              <IconCode />
              <span>Download Source</span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.mainContent}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Description</h2>
            <p className={styles.sectionText}>{app.description}</p>
          </div>

          {/* App Image Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>App Image</h2>
            {app.image ? (
              <div className={styles.appImageContainer}>
                <img src={app.image} alt={app.name} className={styles.appImage} />
              </div>
            ) : (
              <div className={styles.appImagePlaceholder}>
                <div className={styles.appImagePlaceholderIcon}>
                  <Icon />
                </div>
                <p className={styles.appImagePlaceholderText}>No image available</p>
              </div>
            )}
          </div>

          {/* App Type Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>App Type</h2>
            <div className={styles.infoList}>
              <div className={`${styles.infoItemRow} ${styles.active}`}>
                {(() => {
                  const TypeIcon = getAppTypeIcon(app.appType)
                  return (
                    <>
                      <TypeIcon className={styles.infoIcon} />
                      <span className={styles.infoText}>{app.appType}</span>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>

          {/* App Categories Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>App Categories</h2>
            <div className={styles.infoList}>
              <div className={`${styles.infoItemRow} ${styles.active}`}>
                {(() => {
                  const CategoryIcon = getCategoryIcon(app.category)
                  return (
                    <>
                      <CategoryIcon className={styles.infoIcon} />
                      <span className={styles.infoText}>{app.category}</span>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>App Information</h3>
            <div className={styles.infoList}>
              {app.publisher && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Publisher:</span>
                  <span className={styles.infoValue}>{app.publisher}</span>
                </div>
              )}
              {app.developer && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Developer:</span>
                  <span className={styles.infoValue}>{app.developer}</span>
                </div>
              )}
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>App Type:</span>
                <span className={styles.infoValue}>{app.appType}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Category:</span>
                <span className={styles.infoValue}>{app.category}</span>
              </div>
              {app.appSize && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>App Size:</span>
                  <span className={styles.infoValue}>{app.appSize}</span>
                </div>
              )}
              {app.createDate && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Created:</span>
                  <span className={styles.infoValue}>{formatDate(app.createDate)}</span>
                </div>
              )}
              {app.publishDate && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Published:</span>
                  <span className={styles.infoValue}>{formatDate(app.publishDate)}</span>
                </div>
              )}
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Status:</span>
                <span
                  className={`${styles.statusBadge} ${
                    app.status === 'Available'
                      ? styles.statusAvailable
                      : app.status === 'Coming soon'
                      ? styles.statusComingSoon
                      : styles.statusUnavailable
                  }`}
                >
                  {app.status}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

