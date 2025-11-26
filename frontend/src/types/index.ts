// User types
export interface User {
  id: string
  email?: string
  name?: string
  createdAt?: string
  updatedAt?: string
}

// Module types
export interface Module {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive' | 'pending'
  icon?: string
  version?: string
  dependencies?: string[]
}

// AI Assistant types
export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

// Task types
export interface Task {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  createdAt: string
  updatedAt: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

