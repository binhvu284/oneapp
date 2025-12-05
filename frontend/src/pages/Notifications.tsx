import { useState, useMemo } from 'react'
import { IconBell, IconCheck, IconTrash, IconFilter } from '@/components/Icons'
import styles from './Notifications.module.css'

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Application Updated',
    message: 'Your application has been successfully updated to version 2.0',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
    actionUrl: '/settings',
  },
  {
    id: '2',
    type: 'info',
    title: 'New Feature Available',
    message: 'Check out the new Library feature to browse all available applications',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    actionUrl: '/library',
  },
  {
    id: '3',
    type: 'warning',
    title: 'Storage Limit Warning',
    message: 'You are using 85% of your storage quota. Consider upgrading your plan.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
  },
  {
    id: '4',
    type: 'error',
    title: 'Connection Failed',
    message: 'Unable to connect to the server. Please check your internet connection.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true,
  },
  {
    id: '5',
    type: 'info',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur on Sunday, 10:00 PM - 11:00 PM',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
  },
]

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all')
  const [showFilters, setShowFilters] = useState(false)

  const filteredNotifications = useMemo(() => {
    let filtered = notifications

    if (filterType !== 'all') {
      filtered = filtered.filter((n) => n.type === filterType)
    }

    return filtered.sort((a, b) => {
      // Unread first, then by timestamp (newest first)
      if (a.read !== b.read) {
        return a.read ? 1 : -1
      }
      return b.timestamp.getTime() - a.timestamp.getTime()
    })
  }, [notifications, filterType])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
        return 'ℹ'
      default:
        return '•'
    }
  }

  return (
    <div className={styles.notifications}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Notifications</h1>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount} unread</span>
          )}
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.filterButton}
            onClick={() => setShowFilters(!showFilters)}
            title="Filter notifications"
          >
            <IconFilter />
            {filterType !== 'all' && <span className={styles.filterBadge} />}
          </button>
          {unreadCount > 0 && (
            <button className={styles.markAllButton} onClick={markAllAsRead}>
              <IconCheck />
              <span>Mark all as read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button className={styles.clearAllButton} onClick={clearAll}>
              <IconTrash />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={styles.filters}>
          <button
            className={`${styles.filterTag} ${filterType === 'all' ? styles.active : ''}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button
            className={`${styles.filterTag} ${filterType === 'info' ? styles.active : ''}`}
            onClick={() => setFilterType('info')}
          >
            Info
          </button>
          <button
            className={`${styles.filterTag} ${filterType === 'success' ? styles.active : ''}`}
            onClick={() => setFilterType('success')}
          >
            Success
          </button>
          <button
            className={`${styles.filterTag} ${filterType === 'warning' ? styles.active : ''}`}
            onClick={() => setFilterType('warning')}
          >
            Warning
          </button>
          <button
            className={`${styles.filterTag} ${filterType === 'error' ? styles.active : ''}`}
            onClick={() => setFilterType('error')}
          >
            Error
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className={styles.notificationsList}>
        {filteredNotifications.length === 0 ? (
          <div className={styles.emptyState}>
            <IconBell className={styles.emptyIcon} />
            <h2>No notifications</h2>
            <p>
              {filterType !== 'all'
                ? `No ${filterType} notifications found.`
                : "You're all caught up! No new notifications."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`${styles.notificationItem} ${
                !notification.read ? styles.unread : ''
              } ${styles[notification.type]}`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className={styles.notificationContent}>
                <div className={styles.notificationIcon}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className={styles.notificationText}>
                  <div className={styles.notificationHeader}>
                    <h3 className={styles.notificationTitle}>{notification.title}</h3>
                    {!notification.read && <span className={styles.unreadDot} />}
                  </div>
                  <p className={styles.notificationMessage}>{notification.message}</p>
                  <span className={styles.notificationTime}>
                    {formatTimestamp(notification.timestamp)}
                  </span>
                </div>
              </div>
              <div className={styles.notificationActions}>
                {!notification.read && (
                  <button
                    className={styles.actionButton}
                    onClick={(e) => {
                      e.stopPropagation()
                      markAsRead(notification.id)
                    }}
                    title="Mark as read"
                  >
                    <IconCheck />
                  </button>
                )}
                <button
                  className={styles.actionButton}
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNotification(notification.id)
                  }}
                  title="Delete"
                >
                  <IconTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

