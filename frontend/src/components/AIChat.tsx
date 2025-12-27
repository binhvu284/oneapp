import { useState, useRef, useEffect } from 'react'
import { AgentSelector } from './AgentSelector'
import { StreamingText } from './StreamingText'
import { MarkdownRenderer } from './MarkdownRenderer'
import { IconSend, IconRefreshCw, IconMenu, IconSearch, IconPlus, IconFile, IconTools, IconX, IconEdit, IconTrash, IconMessage, IconMoreVertical, IconImage, IconBrain, IconCopy, IconSparkles } from '@/components/Icons'
import { useAuth } from '@/contexts/AuthContext'
import { conversationsService, type Conversation as DBConversation, type Message as DBMessage } from '@/services/conversations'
import api from '@/services/api'
import geminiLogo from '@/logo/gemeni.png'
import chatgptLogo from '@/logo/ChatGPT.png'
import styles from './AIChat.module.css'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  streaming?: boolean
}

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  pinned?: boolean
  agent_id?: string
}

interface AIChatProps {
  selectedAgentId?: string
  onAgentSelect: (agentId: string) => void
}

export function AIChat({ selectedAgentId, onAgentSelect }: AIChatProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [thinkingText, setThinkingText] = useState('Thinking...')
  const [selectedAgent, setSelectedAgent] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [conversationTitle, setConversationTitle] = useState<string>('New Conversation')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingConversation, setLoadingConversation] = useState(false)
  const [deletingConversationId, setDeletingConversationId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [titlePopupOpen, setTitlePopupOpen] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [conversationMenuOpen, setConversationMenuOpen] = useState<string | null>(null)
  const [conversationMenuPosition, setConversationMenuPosition] = useState<'below' | 'above'>('below')
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null)
  const [editingConversationTitle, setEditingConversationTitle] = useState('')
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false)
  const [selectedActions, setSelectedActions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const titlePopupRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const conversationMenuRef = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const conversationInputRef = useRef<HTMLInputElement>(null)
  const conversationMenuButtonRef = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  const actionsMenuRef = useRef<HTMLDivElement>(null)

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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Function to scroll to bottom (can be called during streaming)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Fetch selected agent details
  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (selectedAgentId) {
        try {
          const response = await api.get(`/ai-agents/${selectedAgentId}`)
          if (response.data.success) {
            setSelectedAgent(response.data.data)
          }
        } catch (error) {
          console.error('Error fetching agent details:', error)
        }
      }
    }
    fetchAgentDetails()
  }, [selectedAgentId])

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      if (user?.id) {
        try {
          const response = await conversationsService.getConversations(user.id)
          if (response.success && response.data) {
            const formattedConversations = response.data.map((conv: DBConversation) => ({
              id: conv.id,
              title: conv.title,
              lastMessage: '', // We'll get this from the last message
              timestamp: new Date(conv.updated_at),
              pinned: conv.pinned,
              agent_id: conv.agent_id
            }))
            setConversations(formattedConversations)
          }
        } catch (error) {
          console.error('Error loading conversations:', error)
        }
      }
    }
    loadConversations()
  }, [user?.id])

  const handleSend = async () => {
    if (!input.trim() || !selectedAgentId || !user?.id) return

    const messageContent = input.trim()
    setInput('')
    
    // Add user message immediately
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, tempUserMsg])
    setLoading(true)

    // Simulate thinking process with changing text
    const thinkingSteps = [
      'Analyzing your question...',
      'Gathering information...',
      'Processing context...',
      'Formulating response...',
      'Almost there...'
    ]
    let stepIndex = 0
    const thinkingInterval = setInterval(() => {
      setThinkingText(thinkingSteps[stepIndex])
      stepIndex = (stepIndex + 1) % thinkingSteps.length
    }, 800)

    try {
      // Create conversation if it doesn't exist
      let convId = currentConversationId
      if (!convId) {
        const createResponse = await conversationsService.createConversation(
          user.id,
          selectedAgentId,
          'New Conversation'
        )
        if (createResponse.success) {
          convId = createResponse.data.id
          setCurrentConversationId(convId)
          setConversationTitle(createResponse.data.title)
          
          // Add to conversations list
          setConversations(prev => [{
            id: convId!,
            title: createResponse.data.title,
            lastMessage: '',
            timestamp: new Date(),
            agent_id: selectedAgentId
          }, ...prev])
        }
      }

      if (!convId) {
        throw new Error('Failed to create conversation')
      }

      // Send message and get AI response
      const response = await conversationsService.sendMessage(convId, user.id, messageContent)
      
      clearInterval(thinkingInterval)
      setThinkingText('Thinking...')

      if (response.success) {
        // Replace temp user message with real one
        const userMsg: Message = {
          id: response.data.userMessage.id,
          role: 'user',
          content: response.data.userMessage.content,
          timestamp: new Date(response.data.userMessage.created_at)
        }
        
        // Add assistant message with streaming effect
        const assistantMsg: Message = {
          id: response.data.assistantMessage.id,
          role: 'assistant',
          content: response.data.assistantMessage.content,
          timestamp: new Date(response.data.assistantMessage.created_at),
          streaming: true
        }
        
        setMessages(prev => {
          const withoutTemp = prev.filter(m => m.id !== tempUserMsg.id)
          return [...withoutTemp, userMsg, assistantMsg]
        })
        
        // Update conversation in list
        setConversations(prev => prev.map(conv => 
          conv.id === convId ? {
            ...conv,
            lastMessage: messageContent,
            timestamp: new Date()
          } : conv
        ))
      }
    } catch (error: any) {
      clearInterval(thinkingInterval)
      setThinkingText('Thinking...')
      console.error('Error sending message:', error)
      
      // Show error message
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Failed to get response'}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleNewConversation = () => {
    // Simply reset state to show empty conversation screen
    // Actual conversation will be created when first message is sent
    setCurrentConversationId(null)
    setConversationTitle('New Conversation')
    setMessages([])
    setSidebarOpen(false)
  }

  const handleSelectConversation = async (id: string) => {
    // Close sidebar immediately
    setSidebarOpen(false)
    setConversationMenuOpen(null)
    
    // Show loading state
    setLoadingConversation(true)
    setMessages([])
    
    setCurrentConversationId(id)
    const conversation = conversations.find((c) => c.id === id)
    if (conversation) {
      setConversationTitle(conversation.title)
      onAgentSelect(conversation.agent_id)
      
      // Load messages for this conversation
      try {
        const response = await conversationsService.getMessages(id)
        if (response.success && response.data) {
          const formattedMessages: Message[] = response.data.map((msg: DBMessage) => ({
            id: msg.id,
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: new Date(msg.created_at)
          }))
          setMessages(formattedMessages)
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      } finally {
        setLoadingConversation(false)
      }
    } else {
      setLoadingConversation(false)
    }
  }

  const handleConversationMenuClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation()
    
    // Calculate if menu should open above or below
    const button = e.currentTarget as HTMLButtonElement
    const buttonRect = button.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const menuHeight = 150 // Approximate menu height
    
    // If button is in bottom 200px of window, open menu above
    if (buttonRect.bottom + menuHeight > windowHeight) {
      setConversationMenuPosition('above')
    } else {
      setConversationMenuPosition('below')
    }
    
    setConversationMenuOpen(conversationMenuOpen === conversationId ? null : conversationId)
  }

  const handleEditConversationName = (conversationId: string) => {
    const conversation = conversations.find((c) => c.id === conversationId)
    if (conversation) {
      setEditingConversationId(conversationId)
      setEditingConversationTitle(conversation.title)
      setConversationMenuOpen(null)
    }
  }

  const handleSaveConversationName = async (conversationId: string) => {
    if (editingConversationTitle.trim()) {
      try {
        await conversationsService.updateConversation(conversationId, {
          title: editingConversationTitle.trim()
        } as any)
        
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? { ...conv, title: editingConversationTitle.trim() } : conv
          )
        )
        if (conversationId === currentConversationId) {
          setConversationTitle(editingConversationTitle.trim())
        }
      } catch (error) {
        console.error('Error saving conversation name:', error)
      }
    }
    setEditingConversationId(null)
    setEditingConversationTitle('')
  }

  const handlePinConversation = async (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId)
    if (conversation) {
      try {
        await conversationsService.updateConversation(conversationId, {
          pinned: !conversation.pinned
        } as any)
        
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? { ...conv, pinned: !conv.pinned } : conv
          )
        )
      } catch (error) {
        console.error('Error pinning conversation:', error)
      }
    }
    setConversationMenuOpen(null)
  }

  const handleDeleteConversation = async (conversationId: string) => {
    // Confirm deletion
    const conversation = conversations.find((c) => c.id === conversationId)
    if (!conversation) return
    
    const confirmed = window.confirm(`Are you sure you want to delete "${conversation.title}"?`)
    if (!confirmed) {
      setConversationMenuOpen(null)
      return
    }
    
    setDeletingConversationId(conversationId)
    setConversationMenuOpen(null)
    
    try {
      await conversationsService.deleteConversation(conversationId)
      
      const remainingConversations = conversations.filter((conv) => conv.id !== conversationId)
      setConversations(remainingConversations)
      
      // Show success notification
      setNotification({ message: 'Conversation deleted successfully', type: 'success' })
      setTimeout(() => setNotification(null), 3000)
      
      if (conversationId === currentConversationId) {
        if (remainingConversations.length > 0) {
          handleSelectConversation(remainingConversations[0].id)
        } else {
          handleNewConversation()
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      setNotification({ message: 'Failed to delete conversation', type: 'error' })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setDeletingConversationId(null)
    }
  }

  const handleToggleAction = (action: string) => {
    setSelectedActions((prev) =>
      prev.includes(action)
        ? prev.filter((a) => a !== action)
        : [...prev, action]
    )
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    // TODO: Show a toast notification "Copied!"
  }

  const handleRegenerateMessage = async (messageId: string) => {
    // Find the user message before this assistant message
    const messageIndex = messages.findIndex((m) => m.id === messageId)
    if (messageIndex > 0) {
      const userMessage = messages[messageIndex - 1]
      if (userMessage.role === 'user') {
        // Remove the last assistant message and regenerate
        setMessages(prev => prev.slice(0, messageIndex))
        setInput(userMessage.content)
        // Trigger send automatically
        setTimeout(() => handleSend(), 100)
      }
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTitleClick = () => {
    setTitlePopupOpen(true)
    setEditedTitle(conversationTitle)
  }

  const handleRename = async () => {
    if (editedTitle.trim() && editedTitle.trim() !== conversationTitle && currentConversationId) {
      try {
        await conversationsService.updateConversation(currentConversationId, {
          title: editedTitle.trim()
        } as any)
        
        setConversationTitle(editedTitle.trim())
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversationId ? { ...conv, title: editedTitle.trim() } : conv
          )
        )
      } catch (error) {
        console.error('Error renaming conversation:', error)
      }
    }
    setIsEditingTitle(false)
    setTitlePopupOpen(false)
  }

  const handleDelete = async () => {
    if (currentConversationId) {
      await handleDeleteConversation(currentConversationId)
    }
    setTitlePopupOpen(false)
  }

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (titlePopupRef.current && !titlePopupRef.current.contains(event.target as Node)) {
        setTitlePopupOpen(false)
        setIsEditingTitle(false)
      }
    }

    if (titlePopupOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [titlePopupOpen])

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setActionsMenuOpen(false)
      }
    }

    if (actionsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [actionsMenuOpen])

  // Focus conversation input when editing starts
  useEffect(() => {
    if (editingConversationId && conversationInputRef.current) {
      conversationInputRef.current.focus()
      conversationInputRef.current.select()
    }
  }, [editingConversationId])

  // Close conversation menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (conversationMenuOpen) {
        const menuElement = conversationMenuRef.current[conversationMenuOpen]
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setConversationMenuOpen(null)
        }
      }
    }

    if (conversationMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [conversationMenuOpen])

  // Sort conversations: pinned first, then by timestamp
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return b.timestamp.getTime() - a.timestamp.getTime()
  })

  return (
    <div className={styles.aiChatFullScreen}>
      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.headerLeft}>
          <AgentSelector selectedAgentId={selectedAgentId} onSelect={onAgentSelect} />
        </div>
        <div className={styles.headerCenter}>
          <div className={styles.titleContainer}>
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRename()
                  } else if (e.key === 'Escape') {
                    setIsEditingTitle(false)
                    setTitlePopupOpen(false)
                  }
                }}
                onBlur={handleRename}
                className={styles.titleInput}
              />
            ) : (
              <h2 
                className={styles.conversationTitle} 
                onClick={handleTitleClick}
                data-tooltip={conversationTitle}
                title={conversationTitle}
              >
                {conversationTitle}
              </h2>
            )}
            {titlePopupOpen && !isEditingTitle && (
              <div ref={titlePopupRef} className={styles.titlePopup}>
                <button
                  className={styles.titlePopupButton}
                  onClick={() => {
                    setIsEditingTitle(true)
                  }}
                >
                  <IconEdit />
                  <span>Rename</span>
                </button>
                <button
                  className={styles.titlePopupButton}
                  onClick={handleDelete}
                >
                  <IconTrash />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
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
            <button
              className={styles.closeSidebarButton}
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <IconX />
            </button>
            <button className={styles.newConversationButton} onClick={handleNewConversation}>
              <IconMessage />
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
          {sortedConversations.length === 0 ? (
            <div className={styles.emptyConversations}>
              <p>No conversations found</p>
            </div>
          ) : (
            sortedConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`${styles.conversationItemWrapper} ${
                  currentConversationId === conversation.id ? styles.active : ''
                } ${deletingConversationId === conversation.id ? styles.deleting : ''}`}
              >
                {deletingConversationId === conversation.id ? (
                  <div className={styles.deletingOverlay}>
                    <div className={styles.deletingSpinner}></div>
                    <span>Deleting...</span>
                  </div>
                ) : editingConversationId === conversation.id ? (
                  <input
                    ref={conversationInputRef}
                    type="text"
                    value={editingConversationTitle}
                    onChange={(e) => setEditingConversationTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveConversationName(conversation.id)
                      } else if (e.key === 'Escape') {
                        setEditingConversationId(null)
                        setEditingConversationTitle('')
                      }
                    }}
                    onBlur={() => handleSaveConversationName(conversation.id)}
                    className={styles.conversationTitleInput}
                  />
                ) : (
                  <>
                    <button
                      className={styles.conversationItem}
                      onClick={() => handleSelectConversation(conversation.id)}
                    >
                      <div 
                        className={styles.conversationTitle}
                        data-tooltip={conversation.title}
                        title={conversation.title}
                      >
                        {conversation.title}
                      </div>
                    </button>
                    <button
                      className={styles.conversationMenuButton}
                      onClick={(e) => handleConversationMenuClick(e, conversation.id)}
                      aria-label="More options"
                    >
                      <IconMoreVertical />
                    </button>
                    {conversationMenuOpen === conversation.id && (
                      <div
                        ref={(el) => (conversationMenuRef.current[conversation.id] = el)}
                        className={`${styles.conversationMenu} ${conversationMenuPosition === 'above' ? styles.conversationMenuAbove : ''}`}
                      >
                        <button
                          className={styles.conversationMenuItem}
                          onClick={() => handleEditConversationName(conversation.id)}
                        >
                          <IconEdit />
                          <span>Edit name</span>
                        </button>
                        <button
                          className={styles.conversationMenuItem}
                          onClick={() => handlePinConversation(conversation.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="17" x2="12" y2="22" />
                            <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
                          </svg>
                          <span>{conversation.pinned ? 'Unpin chat' : 'Pin chat'}</span>
                        </button>
                        <button
                          className={`${styles.conversationMenuItem} ${styles.deleteMenuItem}`}
                          onClick={() => handleDeleteConversation(conversation.id)}
                        >
                          <IconTrash />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={styles.contentArea}>
        <div className={styles.messagesContainer}>
          <div className={styles.messages}>
            {/* Empty State - Show when no messages */}
            {messages.length === 0 && !loading && (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateContent}>
                  <div className={styles.greetingIcon}>
                    <IconSparkles />
                  </div>
                  <h1 className={styles.greeting}>
                    Hello{user?.name ? `, ${user.name}` : ''}!
                  </h1>
                  <p className={styles.subGreeting}>How can I help you today?</p>
                  
                  <div className={styles.suggestions}>
                    <button 
                      className={styles.suggestionCard}
                      onClick={() => setInput('Help me plan a trip to Japan')}
                    >
                      <div className={styles.suggestionIcon}>✈️</div>
                      <div className={styles.suggestionText}>Help me plan a trip</div>
                    </button>
                    <button 
                      className={styles.suggestionCard}
                      onClick={() => setInput('Explain quantum computing in simple terms')}
                    >
                      <div className={styles.suggestionIcon}>🧪</div>
                      <div className={styles.suggestionText}>Explain a complex topic</div>
                    </button>
                    <button 
                      className={styles.suggestionCard}
                      onClick={() => setInput('Write a professional email')}
                    >
                      <div className={styles.suggestionIcon}>✉️</div>
                      <div className={styles.suggestionText}>Write an email</div>
                    </button>
                    <button 
                      className={styles.suggestionCard}
                      onClick={() => setInput('Give me creative ideas for a project')}
                    >
                      <div className={styles.suggestionIcon}>💡</div>
                      <div className={styles.suggestionText}>Get creative ideas</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${styles[message.role]}`}
              >
                <div className={styles.messageContent}>
                  {message.streaming ? (
                    <StreamingText 
                      text={message.content} 
                      speed={1} 
                      chunkSize={10}
                      onUpdate={scrollToBottom}
                    />
                  ) : message.role === 'assistant' ? (
                    <MarkdownRenderer content={message.content} />
                  ) : (
                    message.content
                  )}
                </div>
                {message.role === 'user' && (
                  <div className={styles.userMessageActions}>
                    <button
                      className={styles.messageActionButton}
                      onClick={() => handleCopyMessage(message.content)}
                      title="Copy"
                    >
                      <IconCopy />
                    </button>
                  </div>
                )}
                {message.role === 'assistant' && !message.streaming && (
                  <div className={styles.messageActions}>
                    <button
                      className={styles.messageActionButton}
                      onClick={() => handleCopyMessage(message.content)}
                      title="Copy"
                    >
                      <IconCopy />
                    </button>
                    <button
                      className={styles.messageActionButton}
                      onClick={() => handleRegenerateMessage(message.id)}
                      title="Regenerate"
                    >
                      <IconRefreshCw />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {loadingConversation && (
              <div className={styles.conversationLoadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <div className={styles.loadingText}>Loading conversation...</div>
              </div>
            )}
            {loading && (
              <div className={styles.thinkingContainer}>
                <div className={styles.thinkingContent}>
                  <div className={styles.thinkingAvatar}>
                    {selectedAgent?.avatar_url ? (
                      <img 
                        src={selectedAgent.avatar_url} 
                        alt={selectedAgent.name}
                        className={styles.thinkingAvatarImage}
                      />
                    ) : selectedAgent?.is_default ? (
                      <img 
                        src={selectedAgent.model === 'gemini' || selectedAgent.model_provider === 'google' ? geminiLogo : chatgptLogo}
                        alt={selectedAgent.name}
                        className={styles.thinkingAvatarImage}
                      />
                    ) : (
                      <div className={styles.thinkingAvatarPlaceholder}>
                        {selectedAgent?.name?.charAt(0) || 'AI'}
                      </div>
                    )}
                  </div>
                  <div className={styles.thinkingTextWrapper}>
                    <div className={styles.thinkingDots}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <div className={styles.thinkingText}>{thinkingText}</div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Fixed Bottom Input Section */}
        <div className={styles.inputSection}>
          {/* Selected Actions Tags - Separate Line */}
          {selectedActions.length > 0 && (
            <div className={styles.selectedActionsTags}>
              {selectedActions.map((action) => (
                <div key={action} className={styles.actionTag}>
                  {action === 'file' && <IconFile />}
                  {action === 'image' && <IconImage />}
                  {action === 'research' && <IconBrain />}
                  <span>
                    {action === 'file' && 'Add file'}
                    {action === 'image' && 'Generate Image'}
                    {action === 'research' && 'Deep Research'}
                  </span>
                  <button
                    className={styles.removeTag}
                    onClick={() => handleToggleAction(action)}
                  >
                    <IconX />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.inputWrapper}>
            <div className={styles.inputActions} ref={actionsMenuRef}>
              <button 
                className={styles.actionButton} 
                onClick={() => setActionsMenuOpen(!actionsMenuOpen)}
                title="Add actions"
              >
                <IconPlus />
              </button>
              
              {actionsMenuOpen && (
                <div className={styles.actionsMenu}>
                  <button
                    className={`${styles.actionMenuItem} ${selectedActions.includes('file') ? styles.selected : ''}`}
                    onClick={() => handleToggleAction('file')}
                  >
                    <div className={styles.actionMenuItemContent}>
                      <IconFile />
                      <span>Add file</span>
                    </div>
                    {selectedActions.includes('file') && (
                      <div className={styles.checkmark}>✓</div>
                    )}
                  </button>
                  <button
                    className={`${styles.actionMenuItem} ${selectedActions.includes('image') ? styles.selected : ''}`}
                    onClick={() => handleToggleAction('image')}
                  >
                    <div className={styles.actionMenuItemContent}>
                      <IconImage />
                      <span>Generate Image</span>
                    </div>
                    {selectedActions.includes('image') && (
                      <div className={styles.checkmark}>✓</div>
                    )}
                  </button>
                  <button
                    className={`${styles.actionMenuItem} ${selectedActions.includes('research') ? styles.selected : ''}`}
                    onClick={() => handleToggleAction('research')}
                  >
                    <div className={styles.actionMenuItemContent}>
                      <IconBrain />
                      <span>Deep Research</span>
                    </div>
                    {selectedActions.includes('research') && (
                      <div className={styles.checkmark}>✓</div>
                    )}
                  </button>
                </div>
              )}
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

      {/* Notification Toast */}
      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          <div className={styles.notificationContent}>
            {notification.type === 'success' ? (
              <svg className={styles.notificationIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg className={styles.notificationIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}
