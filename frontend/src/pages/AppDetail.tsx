import { useParams, useNavigate } from 'react-router-dom'
import { getPageById } from '@/data/pages'
import { getIcon } from '@/utils/iconUtils'
import { IconCode, IconChevronLeft } from '@/components/Icons'
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
        <div className={styles.appIcon}>
          <Icon />
        </div>
        <div className={styles.headerInfo}>
          <h1 className={styles.appName}>{app.name}</h1>
          <p className={styles.appDescription}>{app.description}</p>
        </div>
      </div>

      {app.image && (
        <div className={styles.appImageContainer}>
          <img src={app.image} alt={app.name} className={styles.appImage} />
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.mainContent}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Description</h2>
            <p className={styles.sectionText}>{app.description}</p>
          </div>

          {app.tags.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Tags</h2>
              <div className={styles.tags}>
                {app.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
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

          <div className={styles.actions}>
            {app.status === 'Available' && app.enabled ? (
              <button className={styles.primaryButton} onClick={handleOpenApp}>
                Open App
              </button>
            ) : (
              <button className={styles.primaryButtonDisabled} disabled>
                {app.status === 'Coming soon' ? 'Coming Soon' : 'Unavailable'}
              </button>
            )}

            {app.sourceCodeUrl && (
              <button className={styles.secondaryButton} onClick={handleDownloadSource}>
                <IconCode />
                <span>Download Source Code</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

