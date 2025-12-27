import api from './api'

export interface Conversation {
  id: string
  user_id: string
  agent_id: string
  title: string
  pinned: boolean
  total_tokens: number
  message_count: number
  settings: any
  metadata: any
  created_at: string
  updated_at: string
  deleted_at: string | null
  ai_agents?: {
    name: string
    avatar_url?: string
    model: string
  }
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  token_count: number
  metadata: any
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export const conversationsService = {
  // Create a new conversation
  async createConversation(userId: string, agentId: string, title?: string) {
    const response = await api.post('/conversations', {
      user_id: userId,
      agent_id: agentId,
      title: title || 'New Conversation'
    })
    return response.data
  },

  // Get all conversations for a user
  async getConversations(userId: string) {
    const response = await api.get(`/conversations?user_id=${userId}`)
    return response.data
  },

  // Get a single conversation with messages
  async getConversation(conversationId: string) {
    const response = await api.get(`/conversations/${conversationId}`)
    return response.data
  },

  // Get messages for a conversation
  async getMessages(conversationId: string) {
    const response = await api.get(`/conversations/${conversationId}`)
    return {
      success: response.data.success,
      data: response.data.data?.messages || []
    }
  },

  // Send a message and get AI response
  async sendMessage(conversationId: string, userId: string, content: string) {
    const response = await api.post(`/conversations/${conversationId}/messages`, {
      user_id: userId,
      content
    })
    return response.data
  },

  // Update conversation
  async updateConversation(conversationId: string, updates: Partial<Conversation>) {
    const response = await api.patch(`/conversations/${conversationId}`, updates)
    return response.data
  },

  // Delete conversation
  async deleteConversation(conversationId: string) {
    const response = await api.delete(`/conversations/${conversationId}`)
    return response.data
  }
}

