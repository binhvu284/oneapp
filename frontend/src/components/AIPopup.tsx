import { useState } from 'react'
import { AgentSelector } from './AgentSelector'
import { IconX, IconSend, IconRefreshCw } from '@/components/Icons'
import styles from './AIPopup.module.css'

interface AIPopupProps {
  isOpen: boolean
  onClose: () => void
  selectedAgentId?: string
  onAgentSelect: (agentId: string) => void
}

export function AIPopup({ isOpen, onClose, selectedAgentId, onAgentSelect }: AIPopupProps) {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSend = async () => {
    if (!input.trim() || !selectedAgentId) return

    setLoading(true)
    setResponse(null)

    // TODO: Replace with actual API call
    setTimeout(() => {
      setResponse('This is a placeholder response. The AI API will be integrated here.')
      setLoading(false)
    }, 1000)
  }

  const handleClose = () => {
    setInput('')
    setResponse(null)
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Quick AI Assistant</h3>
          <button className={styles.closeButton} onClick={handleClose}>
            <IconX />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.agentSelectorWrapper}>
            <label>Select Agent:</label>
            <AgentSelector selectedAgentId={selectedAgentId} onSelect={onAgentSelect} />
          </div>

          <div className={styles.inputWrapper}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedAgentId ? "Ask your question..." : "Select an agent first..."}
              className={styles.textarea}
              disabled={loading || !selectedAgentId}
              rows={4}
            />
            <button
              onClick={handleSend}
              className={styles.sendButton}
              disabled={loading || !input.trim() || !selectedAgentId}
            >
              {loading ? <IconRefreshCw className={styles.spinning} /> : <IconSend />}
              <span>Send</span>
            </button>
          </div>

          {response && (
            <div className={styles.response}>
              <div className={styles.responseLabel}>Response:</div>
              <div className={styles.responseContent}>{response}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

