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
  config?: Record<string, unknown>
}

// Task types
export interface Task {
  id: string
  userId: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

// AI Message types
export interface AIMessage {
  id: string
  userId: string
  role: 'user' | 'assistant'
  content: string
  metadata?: Record<string, unknown>
  createdAt: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

