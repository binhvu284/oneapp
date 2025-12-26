import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient, SupabaseClient, Session } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/utils/supabase'

interface User {
  id: string
  email?: string
  name?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  supabase: SupabaseClient | null
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  signUp: (email: string, password: string, name?: string, inviteCode?: string) => Promise<void>
  signOut: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (password: string, token?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Get and trim environment variables
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

// Validate URL format
function isValidUrl(url: string): boolean {
  if (!url) return false
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch {
    return false
  }
}

// Create Supabase client only if credentials are provided and valid
let supabase: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  if (isValidUrl(supabaseUrl)) {
    try {
      supabase = createClient(supabaseUrl, supabaseAnonKey)
    } catch (error: any) {
      console.error('❌ Failed to initialize Supabase client in AuthContext:', error.message)
      supabase = null
    }
  } else {
    console.error('❌ Invalid Supabase URL format in AuthContext. Must be a valid HTTP or HTTPS URL.')
    supabase = null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If Supabase is not configured, skip auth check
    if (!supabase) {
      console.warn('⚠️  Supabase not configured. Running in demo mode.')
      setLoading(false)
      return
    }

    // Helper function to fetch user name from oneapp_users table
    const fetchUserName = async (userId: string): Promise<string | undefined> => {
      const supabaseClient = getSupabaseClient()
      if (!supabaseClient) return undefined
      
      try {
        const { data, error } = await supabaseClient
          .from('oneapp_users')
          .select('name')
          .eq('id', userId)
          .single()
        
        if (error || !data) return undefined
        return data.name
      } catch {
        return undefined
      }
    }

    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: Session | null } }) => {
      if (session?.user) {
        const userName = await fetchUserName(session.user.id)
        setUser({ 
          id: session.user.id, 
          email: session.user.email,
          name: userName || session.user.user_metadata?.full_name || session.user.user_metadata?.name
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      if (session?.user) {
        const userName = await fetchUserName(session.user.id)
        setUser({ 
          id: session.user.id, 
          email: session.user.email,
          name: userName || session.user.user_metadata?.full_name || session.user.user_metadata?.name
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set up your environment variables.')
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    
    // Fetch user name from oneapp_users table after signin
    if (data.user) {
      const supabaseClient = getSupabaseClient()
      if (supabaseClient) {
        try {
          const { data: userData } = await supabaseClient
            .from('oneapp_users')
            .select('name')
            .eq('id', data.user.id)
            .single()
          
          if (userData?.name) {
            setUser({ 
              id: data.user.id, 
              email: data.user.email,
              name: userData.name
            })
          } else {
            // Fallback to metadata if name not found in database
            setUser({ 
              id: data.user.id, 
              email: data.user.email,
              name: data.user.user_metadata?.full_name || data.user.user_metadata?.name
            })
          }
        } catch {
          // If fetching name fails, use metadata or email
          setUser({ 
            id: data.user.id, 
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name
          })
        }
      }
    }
    
    if (rememberMe) {
      localStorage.setItem('rememberEmail', email)
    } else {
      localStorage.removeItem('rememberEmail')
    }
  }

  const signUp = async (email: string, password: string, name?: string, inviteCode?: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set up your environment variables.')
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
          invite_code: inviteCode,
        },
      },
    })
    if (error) throw error
  }

  const forgotPassword = async (email: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set up your environment variables.')
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
  }

  const resetPassword = async (password: string) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set up your environment variables.')
    }
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  }

  const signOut = async () => {
    if (!supabase) {
      setUser(null)
      return
    }
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      supabase: supabase || null as any, 
      signIn, 
      signUp, 
      signOut,
      forgotPassword,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

