import { useState } from 'react'
import { IconEye, IconEyeOff, IconCheckCircle, IconXCircle, IconRefreshCw } from '@/components/Icons'
import styles from './AIModelCard.module.css'

interface AIModelCardProps {
  model: 'gemini' | 'chatgpt'
  name: string
  description: string
  apiKey?: string
  isConnected: boolean
  isActive: boolean
  onApiKeyChange: (apiKey: string) => void
  onConnect: () => void
  onToggle: () => void
  testing: boolean
}

export function AIModelCard({
  model,
  name,
  description,
  apiKey = '',
  isConnected,
  isActive,
  onApiKeyChange,
  onConnect,
  onToggle,
  testing,
}: AIModelCardProps) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [localApiKey, setLocalApiKey] = useState(apiKey)

  const handleSaveApiKey = () => {
    onApiKeyChange(localApiKey)
  }

  return (
    <div className={styles.modelCard}>
      <div className={styles.cardHeader}>
        <div className={styles.modelInfo}>
          <div className={styles.modelIcon}>
            {model === 'gemini' ? '🤖' : '💬'}
          </div>
          <div className={styles.modelDetails}>
            <h3 className={styles.modelName}>{name}</h3>
            <p className={styles.modelDescription}>{description}</p>
          </div>
        </div>
        <div className={styles.cardActions}>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={onToggle}
              disabled={!isConnected}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>
      </div>

      <div className={styles.apiKeySection}>
        <div className={styles.apiKeyInputWrapper}>
          <label className={styles.apiKeyLabel}>API Key</label>
          <div className={styles.passwordInputWrapper}>
            <input
              type={showApiKey ? 'text' : 'password'}
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder="Enter your API key..."
              className={styles.apiKeyInput}
            />
            <button
              className={styles.passwordToggle}
              onClick={() => setShowApiKey(!showApiKey)}
              type="button"
            >
              {showApiKey ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>
        </div>

        <div className={styles.connectionSection}>
          <div className={styles.connectionStatus}>
            {isConnected ? (
              <>
                <IconCheckCircle className={styles.connectedIcon} />
                <span className={styles.connectedText}>Connected</span>
              </>
            ) : (
              <>
                <IconXCircle className={styles.disconnectedIcon} />
                <span className={styles.disconnectedText}>Not Connected</span>
              </>
            )}
          </div>
          <div className={styles.connectionActions}>
            <button
              className={styles.saveButton}
              onClick={handleSaveApiKey}
              disabled={localApiKey === apiKey}
            >
              Save API Key
            </button>
            <button
              className={styles.connectButton}
              onClick={onConnect}
              disabled={testing || !localApiKey.trim()}
            >
              {testing ? (
                <>
                  <IconRefreshCw className={styles.spinning} />
                  <span>Testing...</span>
                </>
              ) : (
                <span>Connect</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

