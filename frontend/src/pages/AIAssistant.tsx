import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AIAgentManagement } from '@/components/AIAgentManagement'
import { AIChat } from '@/components/AIChat'
import { AIPopupPage } from '@/components/AIPopupPage'
import { AITranslate } from '@/components/AITranslate'
import { IconMessage, IconMaximize, IconLanguage, IconSearch } from '@/components/Icons'
import styles from './AIAssistant.module.css'

type Section = 'functions' | 'agents'
type FunctionType = 'chat' | 'popup' | 'translate'

interface FunctionCard {
  id: FunctionType
  name: string
  description: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  path: string
}

const functionCards: FunctionCard[] = [
  {
    id: 'chat',
    name: 'AI Chat',
    description: 'Have conversations with AI assistants. Select an agent and start chatting.',
    icon: IconMessage,
    path: '/ai/chat',
  },
  {
    id: 'popup',
    name: 'AI Popup',
    description: 'Quick AI interactions in a popup window for fast responses.',
    icon: IconMaximize,
    path: '/ai/popup',
  },
  {
    id: 'translate',
    name: 'AI Translate',
    description: 'Translate text between multiple languages using AI agents.',
    icon: IconLanguage,
    path: '/ai/translate',
  },
]

export function AIAssistant() {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeSection, setActiveSection] = useState<Section>('functions')
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  
  // Check if we're on a function page
  const currentFunction = functionCards.find(card => location.pathname === card.path)

  // If on a function page, show that function
  if (currentFunction) {
    return (
      <div className={styles.aiAssistantFullScreen}>
        {currentFunction.id === 'chat' && (
          <AIChat selectedAgentId={selectedAgentId} onAgentSelect={setSelectedAgentId} />
        )}
        {currentFunction.id === 'popup' && (
          <div className={styles.functionContent}>
            <AIPopupPage
              selectedAgentId={selectedAgentId}
              onAgentSelect={setSelectedAgentId}
            />
          </div>
        )}
        {currentFunction.id === 'translate' && (
          <div className={styles.functionContent}>
            <AITranslate selectedAgentId={selectedAgentId} onAgentSelect={setSelectedAgentId} />
          </div>
        )}
      </div>
    )
  }

  // Main page with cards
  const filteredFunctions = functionCards.filter(card =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={styles.aiAssistant}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeSection === 'functions' ? styles.active : ''}`}
          onClick={() => setActiveSection('functions')}
        >
          AI Functions
        </button>
        <button
          className={`${styles.tab} ${activeSection === 'agents' ? styles.active : ''}`}
          onClick={() => setActiveSection('agents')}
        >
          AI Agents
        </button>
      </div>

      {activeSection === 'functions' && (
        <>
          <div className={styles.searchBar}>
            <IconSearch />
            <input
              type="text"
              placeholder="Search AI functions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.content}>
            <div className={styles.functionsGrid}>
              {filteredFunctions.map((card) => {
                const IconComponent = card.icon
                return (
                  <div
                    key={card.id}
                    className={styles.functionCard}
                    onClick={() => navigate(card.path)}
                  >
                    <div className={styles.functionIcon}>
                      <IconComponent />
                    </div>
                    <div className={styles.functionInfo}>
                      <h2 className={styles.functionName}>{card.name}</h2>
                      <p className={styles.functionDescription}>{card.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
      {activeSection === 'agents' && (
        <div className={styles.content}>
          <AIAgentManagement />
        </div>
      )}
    </div>
  )
}
