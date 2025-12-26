import { useState, useRef, useEffect } from 'react'
import { AgentSelector } from './AgentSelector'
import { IconSend, IconRefreshCw, IconMenu, IconSearch, IconPlus, IconFile, IconTools, IconX } from '@/components/Icons'
import styles from './AIChat.module.css'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
}

interface AIChatProps {
  selectedAgentId?: string
  onAgentSelect: (agentId: string) => void
}

export function AIChat({ selectedAgentId, onAgentSelect }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. Select an agent to start chatting.',
      timestamp: new Date(),
    },
  ])
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'New Conversation',
      lastMessage: 'Hello! I\'m your AI assistant...',
      timestamp: new Date(),
    },
  ])
  const [currentConversationId, setCurrentConversationId] = useState<string>('1')
  const [conversationTitle, setConversationTitle] = useState<string>('New Conversation')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSend = async () => {
    if (!input.trim() || !selectedAgentId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    
    // Update conversation title if it's still "New Conversation"
    if (conversationTitle === 'New Conversation' && input.trim()) {
      const newTitle = input.trim().slice(0, 50) + (input.trim().length > 50 ? '...' : '')
      setConversationTitle(newTitle)
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId ? { ...conv, title: newTitle, lastMessage: input.trim() } : conv
        )
      )
    } else {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId ? { ...conv, lastMessage: input.trim() } : conv
        )
      )
    }

    setInput('')
    setLoading(true)

    // TODO: Replace with actual API call using selectedAgentId
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'This is a placeholder response. The AI API will be integrated here with agent memory.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setLoading(false)
    }, 1000)
  }

  const handleNewConversation = () => {
    const newId = Date.now().toString()
    const newConversation: Conversation = {
      id: newId,
      title: 'New Conversation',
      lastMessage: '',
      timestamp: new Date(),
    }
    setConversations((prev) => [newConversation, ...prev])
    setCurrentConversationId(newId)
    setConversationTitle('New Conversation')
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. How can I help you today?',
        timestamp: new Date(),
      },
    ])
  }

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id)
    const conversation = conversations.find((c) => c.id === id)
    if (conversation) {
      setConversationTitle(conversation.title)
      // TODO: Load messages for this conversation
    }
    setSidebarOpen(false)
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={styles.aiChatFullScreen}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <AgentSelector selectedAgentId={selectedAgentId} onSelect={onAgentSelect} />
        </div>
        <div className={styles.headerCenter}>
          <h2 className={styles.conversationTitle}>{conversationTitle}</h2>
        </div>
        <div className={styles.headerRight}>
          <button
            className={styles.headerButton}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <IconMenu />
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - Right Side */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarHeaderTop}>
            <button className={styles.newConversationButton} onClick={handleNewConversation}>
              <IconPlus />
              <span>New Conversation</span>
            </button>
            <button
              className={styles.searchToggleButton}
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Toggle search"
            >
              <IconSearch />
            </button>
          </div>
          {searchOpen && (
            <div className={styles.searchBar}>
              <IconSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                autoFocus
              />
              <button
                className={styles.searchCloseButton}
                onClick={() => {
                  setSearchOpen(false)
                  setSearchQuery('')
                }}
              >
                <IconX />
              </button>
            </div>
          )}
        </div>
        <div className={styles.conversationsList}>
          {filteredConversations.length === 0 ? (
            <div className={styles.emptyConversations}>
              <p>No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`${styles.conversationItem} ${
                  currentConversationId === conversation.id ? styles.active : ''
                }`}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <div className={styles.conversationContent}>
                  <div className={styles.conversationTitle}>{conversation.title}</div>
                  {conversation.lastMessage && (
                    <div className={styles.conversationPreview}>{conversation.lastMessage}</div>
                  )}
                </div>
                <div className={styles.conversationTime}>
                  {conversation.timestamp.toLocaleDateString()}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={styles.contentArea}>
        <div className={styles.messagesContainer}>
          <div className={styles.messages}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${styles[message.role]}`}
              >
                <div className={styles.messageContent}>{message.content}</div>
                <div className={styles.timestamp}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            {loading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.messageContent}>
                  <IconRefreshCw className={styles.thinkingIcon} />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed Bottom Input Section */}
        <div className={styles.inputSection}>
          <div className={styles.inputWrapper}>
            <div className={styles.inputActions}>
              <button className={styles.actionButton} title="Add file">
                <IconFile />
              </button>
              <button className={styles.actionButton} title="Add tool">
                <IconTools />
              </button>
            </div>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder={selectedAgentId ? "Type your message..." : "Select an agent to start chatting..."}
              className={styles.textarea}
              disabled={loading || !selectedAgentId}
              rows={1}
            />
            <button
              onClick={handleSend}
              className={styles.sendButton}
              disabled={loading || !input.trim() || !selectedAgentId}
              title="Send message"
            >
              <IconSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
