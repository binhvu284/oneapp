import { useState } from 'react'
import { AgentSelector } from './AgentSelector'
import { IconSend, IconRefreshCw } from '@/components/Icons'
import styles from './AIPopupPage.module.css'

interface AIPopupPageProps {
  selectedAgentId?: string
  onAgentSelect: (agentId: string) => void
}

export function AIPopupPage({ selectedAgentId, onAgentSelect }: AIPopupPageProps) {
  const [input, setInput] = useState('')
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <div className={styles.popupPage}>
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
            rows={6}
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
  )
}

