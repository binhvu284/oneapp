import { useState } from 'react'
import { AgentSelector } from './AgentSelector'
import { IconRefreshCw, IconCopy } from '@/components/Icons'
import styles from './AITranslate.module.css'

interface AITranslateProps {
  selectedAgentId?: string
  onAgentSelect: (agentId: string) => void
}

export function AITranslate({ selectedAgentId, onAgentSelect }: AITranslateProps) {
  const [sourceText, setSourceText] = useState('')
  const [targetLanguage, setTargetLanguage] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [loading, setLoading] = useState(false)

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'vi', name: 'Vietnamese' },
  ]

  const handleTranslate = async () => {
    if (!sourceText.trim() || !targetLanguage || !selectedAgentId) return

    setLoading(true)
    setTranslatedText('')

    // TODO: Replace with actual API call
    setTimeout(() => {
      setTranslatedText('This is a placeholder translation. The AI translation API will be integrated here.')
      setLoading(false)
    }, 1000)
  }

  const handleCopy = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText)
    }
  }

  return (
    <div className={styles.aiTranslate}>
      <div className={styles.header}>
        <div className={styles.agentSelectorWrapper}>
          <label>Select Agent:</label>
          <AgentSelector selectedAgentId={selectedAgentId} onSelect={onAgentSelect} />
        </div>
      </div>

      <div className={styles.translateContainer}>
        <div className={styles.sourceSection}>
          <div className={styles.sectionHeader}>
            <h3>Source Text</h3>
          </div>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Enter text to translate..."
            className={styles.textarea}
            rows={10}
          />
        </div>

        <div className={styles.controls}>
          <div className={styles.languageSelector}>
            <label>Translate to:</label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className={styles.select}
            >
              <option value="">Select language...</option>
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleTranslate}
            className={styles.translateButton}
            disabled={loading || !sourceText.trim() || !targetLanguage || !selectedAgentId}
          >
            {loading ? (
              <>
                <IconRefreshCw className={styles.spinning} />
                <span>Translating...</span>
              </>
            ) : (
              <span>Translate</span>
            )}
          </button>
        </div>

        <div className={styles.targetSection}>
          <div className={styles.sectionHeader}>
            <h3>Translated Text</h3>
            {translatedText && (
              <button className={styles.copyButton} onClick={handleCopy} title="Copy">
                <IconCopy />
              </button>
            )}
          </div>
          <div className={styles.translatedContent}>
            {loading ? (
              <div className={styles.loading}>
                <IconRefreshCw className={styles.spinning} />
                <span>Translating...</span>
              </div>
            ) : translatedText ? (
              translatedText
            ) : (
              <div className={styles.placeholder}>Translation will appear here...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

