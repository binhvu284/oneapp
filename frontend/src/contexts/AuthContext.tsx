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

// Helper function to fetch user name from oneapp_users table with timeout
async function fetchUserName(userId: string): Promise<string | undefined> {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:69',message:'fetchUserName called',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const supabaseClient = getSupabaseClient()
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:71',message:'getSupabaseClient result',data:{hasClient:!!supabaseClient},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  if (!supabaseClient) {
    return undefined
  }
  
  try {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:74',message:'Starting database query with timeout',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    // Add timeout to prevent hanging (5 seconds)
    const queryPromise = supabaseClient
      .from('oneapp_users')
      .select('name')
      .eq('id', userId)
      .single()
    
    const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolveTimeout) => {
      setTimeout(() => {
        resolveTimeout({ data: null, error: { message: 'Query timeout' } })
      }, 5000)
    })
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise])
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:80',message:'Database query completed',data:{hasData:!!data,hasError:!!error,error:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (error || !data) {
      return undefined
    }
    return data.name
  } catch (err: any) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:83',message:'fetchUserName catch block',data:{error:err?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return undefined
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:57',message:'AuthProvider initialized',data:{initialLoading:true,supabaseExists:!!supabase},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:60',message:'useEffect started',data:{supabaseIsNull:!supabase},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // If Supabase is not configured, skip auth check
    if (!supabase) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:63',message:'Supabase is null, setting loading to false',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      console.warn('⚠️  Supabase not configured. Running in demo mode.')
      setLoading(false)
      return
    }

    // Check active session with timeout
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:88',message:'Calling getSession',data:{supabaseExists:!!supabase},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const sessionPromise = supabase.auth.getSession()
    const sessionTimeoutPromise = new Promise<{ data: { session: null }; error: { message: string } }>((resolve) => {
      setTimeout(() => {
        resolve({ data: { session: null }, error: { message: 'getSession timeout' } })
      }, 3000)
    })
    
    Promise.race([sessionPromise, sessionTimeoutPromise]).then(async (result: any) => {
      const { data: { session } } = result
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:89',message:'getSession resolved',data:{hasSession:!!session,hasUser:!!session?.user},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Set loading to false immediately, don't wait for userName fetch
      setLoading(false)
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:99',message:'Setting loading to false in getSession then',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      if (session?.user) {
        // Set user immediately with available data
        setUser({ 
          id: session.user.id, 
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name
        })
        // Fetch userName asynchronously without blocking and update if found
        fetchUserName(session.user.id).then((userName) => {
          if (userName) {
            setUser({ 
              id: session.user.id, 
              email: session.user.email,
              name: userName
            })
          }
        }).catch(() => {
          // If fetchUserName fails, user is already set with metadata
        })
      } else {
        setUser(null)
      }
    }).catch((err: any) => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:100',message:'getSession catch block',data:{error:err?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      setLoading(false)
    })

    // Listen for auth changes
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:105',message:'Setting up onAuthStateChange subscription',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:107',message:'onAuthStateChange fired',data:{event:_event,hasSession:!!session,hasUser:!!session?.user},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      // Set loading to false immediately, don't wait for userName fetch
      setLoading(false)
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:118',message:'Setting loading to false in onAuthStateChange',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      if (session?.user) {
        // Set user immediately with available data
        setUser({ 
          id: session.user.id, 
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name
        })
        // Fetch userName asynchronously without blocking
        fetchUserName(session.user.id).then((userName) => {
          if (userName) {
            setUser({ 
              id: session.user.id, 
              email: session.user.email,
              name: userName
            })
          }
        }).catch(() => {
          // If fetchUserName fails, user is already set with metadata
        })
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:213',message:'signIn called',data:{email,hasSupabase:!!supabase},timestamp:Date.now(),sessionId:'debug-session',runId:'login-fix',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set up your environment variables.')
    }
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:217',message:'Calling signInWithPassword',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'login-fix',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:218',message:'signInWithPassword completed',data:{hasError:!!error,hasUser:!!data?.user,error:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'login-fix',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (error) throw error
    
    // Set user immediately with available data, don't wait for database query
    if (data.user) {
      // Set user immediately with metadata
      setUser({ 
        id: data.user.id, 
        email: data.user.email,
        name: data.user.user_metadata?.full_name || data.user.user_metadata?.name
      })
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:222',message:'User set with metadata, fetching name from DB',data:{userId:data.user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'login-fix',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      // Fetch user name from oneapp_users table asynchronously without blocking
      const supabaseClient = getSupabaseClient()
      if (supabaseClient) {
        // Use the existing fetchUserName function with timeout
        fetchUserName(data.user.id).then((userName) => {
          if (userName) {
            setUser({ 
              id: data.user.id, 
              email: data.user.email,
              name: userName
            })
          }
        }).catch(() => {
          // If fetchUserName fails, user is already set with metadata
        })
      }
    }
    
    if (rememberMe) {
      localStorage.setItem('rememberEmail', email)
    } else {
      localStorage.removeItem('rememberEmail')
    }
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/d9b8d4a1-e56f-447d-a381-d93a62672caf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.tsx:261',message:'signIn completed',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'login-fix',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
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

