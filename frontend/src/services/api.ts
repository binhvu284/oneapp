import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    // TODO: Add auth token from Supabase session
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log all errors for debugging
    console.error('[API Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      pathname: window.location.pathname,
    })
    
    if (error.response?.status === 401) {
      // Only redirect to login if we're not already on a public page
      const publicPaths = ['/oneapp-data', '/oneapp-developer', '/library']
      const currentPath = window.location.pathname
      const isPublicPath = publicPaths.some(path => currentPath.startsWith(path))
      
      if (!isPublicPath) {
        // Handle unauthorized access
        localStorage.removeItem('token')
        // Only redirect if login page exists, otherwise just log the error
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    // Don't redirect on 500 errors - just log them
    return Promise.reject(error)
  }
)

export default api

