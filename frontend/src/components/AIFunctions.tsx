import { useState } from 'react'
import { AIChat } from './AIChat'
import { AIPopup } from './AIPopup'
import { AITranslate } from './AITranslate'
import { IconMessage, IconMaximize, IconLanguage } from '@/components/Icons'
import styles from './AIFunctions.module.css'

type FunctionTab = 'chat' | 'popup' | 'translate'

interface AIFunctionsProps {
  selectedAgentId?: string
  onAgentSelect: (agentId: string) => void
}

export function AIFunctions({ selectedAgentId, onAgentSelect }: AIFunctionsProps) {
  const [activeTab, setActiveTab] = useState<FunctionTab>('chat')
  const [showPopup, setShowPopup] = useState(false)

  return (
    <div className={styles.aiFunctions}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'chat' ? styles.active : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <IconMessage />
          <span>AI Chat</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'popup' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('popup')
            setShowPopup(true)
          }}
        >
          <IconMaximize />
          <span>AI Popup</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'translate' ? styles.active : ''}`}
          onClick={() => setActiveTab('translate')}
        >
          <IconLanguage />
          <span>AI Translate</span>
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'chat' && (
          <AIChat selectedAgentId={selectedAgentId} onAgentSelect={onAgentSelect} />
        )}
        {activeTab === 'translate' && (
          <AITranslate selectedAgentId={selectedAgentId} onAgentSelect={onAgentSelect} />
        )}
      </div>

      {showPopup && (
        <AIPopup
          isOpen={showPopup}
          onClose={() => {
            setShowPopup(false)
            setActiveTab('chat')
          }}
          selectedAgentId={selectedAgentId}
          onAgentSelect={onAgentSelect}
        />
      )}
    </div>
  )
}

