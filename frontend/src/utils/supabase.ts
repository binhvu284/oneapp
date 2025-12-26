import { createClient, SupabaseClient } from '@supabase/supabase-js'

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

// Create Supabase client for direct database access
let supabaseClient: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  // Validate URL before creating client
  if (!isValidUrl(supabaseUrl)) {
    console.error('❌ Invalid Supabase URL format. Must be a valid HTTP or HTTPS URL.')
    console.error('   Current value:', supabaseUrl || '(empty)')
    console.error('   Expected format: https://your-project-id.supabase.co')
  } else {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false, // We handle sessions via AuthContext
        },
      })
      console.log('✅ Supabase client initialized for direct database access')
    } catch (error: any) {
      console.error('❌ Failed to initialize Supabase client:', error.message)
      console.error('   Please check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables')
    }
  }
} else {
  console.warn('⚠️  Supabase credentials not configured. Some features will not work.')
  console.warn('   VITE_SUPABASE_URL:', supabaseUrl ? `Set (${supabaseUrl.substring(0, 30)}...)` : 'Missing')
  console.warn('   VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
  console.warn('   To fix: Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel environment variables')
}

export function getSupabaseClient(): SupabaseClient | null {
  return supabaseClient
}

export default supabaseClient

