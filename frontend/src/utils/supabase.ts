import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Get and trim environment variables
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

// Check if secret key is being used (secret keys are longer and start with 'eyJ')
function isSecretKey(key: string): boolean {
  if (!key) return false
  // Secret keys are typically much longer than anon keys
  // Anon keys are usually ~200-300 chars, secret keys are ~400+ chars
  // Also check if it contains "secret" in common patterns
  return key.length > 350 || key.includes('secret')
}

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
  // Check if secret key is being used instead of anon key
  if (isSecretKey(supabaseAnonKey)) {
    console.error('❌ SECURITY ERROR: You are using a SECRET API key in the frontend!')
    console.error('   Secret keys should NEVER be exposed in browser/client code.')
    console.error('   You must use the ANON PUBLIC key instead.')
    console.error('   How to fix:')
    console.error('   1. Go to Supabase Dashboard → Settings → API')
    console.error('   2. Copy the "anon public" key (NOT the "service_role" secret key)')
    console.error('   3. Update VITE_SUPABASE_ANON_KEY in Vercel with the anon key')
    console.error('   4. Delete the exposed secret key from Supabase Dashboard immediately!')
  } else if (!isValidUrl(supabaseUrl)) {
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

