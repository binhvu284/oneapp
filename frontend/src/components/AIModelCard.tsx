import { useState } from 'react'
import { IconCheckCircle, IconXCircle, IconKey } from '@/components/Icons'
import { ManageAPIModal } from './ManageAPIModal'
import geminiLogo from '@/logo/gemeni.png'
import chatgptLogo from '@/logo/ChatGPT.png'
import styles from './AIModelCard.module.css'

interface AIModelCardProps {
  model: 'gemini' | 'chatgpt'
  name: string
  description: string
  apiKey?: string
  isConnected: boolean
  isActive: boolean
  agentId?: string
  onApiKeyChange: (apiKey: string) => Promise<void>
  onToggle: () => void
  onConnectionSuccess?: () => void
}

export function AIModelCard({
  model,
  name,
  description,
  apiKey = '',
  isConnected,
  isActive,
  agentId,
  onApiKeyChange,
  onToggle,
  onConnectionSuccess,
}: AIModelCardProps) {
  const [showManageModal, setShowManageModal] = useState(false)

  return (
    <div className={styles.modelCard}>
      <div className={styles.cardRow}>
        {/* Model Info - Left */}
        <div className={styles.modelInfo}>
          <div className={`${styles.modelIcon} ${model === 'chatgpt' ? styles.chatgptIcon : ''}`}>
            <img 
              src={model === 'gemini' ? geminiLogo : chatgptLogo} 
              alt={name}
              className={styles.modelIconImage}
            />
          </div>
          <div className={styles.modelDetails}>
            <div className={styles.modelNameRow}>
              <h3 className={styles.modelName}>{name}</h3>
              {isConnected && (
                <span className={styles.modelVersion}>
                  {model === 'gemini' ? 'Gemini Flash' : 'GPT-3.5 Turbo'}
                </span>
              )}
              {isConnected ? (
                <span className={styles.connectedBadge}>
                  <IconCheckCircle className={styles.statusIcon} />
                  Connected
                </span>
              ) : (
                <span className={styles.disconnectedBadge}>
                  <IconXCircle className={styles.statusIcon} />
                  Not Connected
                </span>
              )}
            </div>
          </div>
        </div>

        {/* API Key Section - Middle */}
        <div className={styles.apiKeySection}>
          {isConnected && (
            <span className={styles.connectedText}>API Key configured</span>
          )}
        </div>

        {/* Actions - Right */}
        <div className={styles.actionsSection}>
          <button
            className={styles.manageApiButton}
            onClick={() => setShowManageModal(true)}
          >
            <IconKey />
            <span>Manage API</span>
          </button>
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

      {/* Manage API Modal */}
      {showManageModal && agentId && (
        <ManageAPIModal
          isOpen={showManageModal}
          onClose={() => setShowManageModal(false)}
          agentId={agentId}
          agentName={name}
          currentApiKey={apiKey}
          onApiKeyUpdate={onApiKeyChange}
          onConnectionSuccess={onConnectionSuccess}
        />
      )}
    </div>
  )
}

