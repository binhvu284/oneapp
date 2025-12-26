import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create Supabase client for direct database access
let supabaseClient: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // We handle sessions via AuthContext
    },
  })
  console.log('✅ Supabase client initialized for direct database access')
} else {
  console.warn('⚠️  Supabase credentials not configured. Some features will not work.')
  console.warn('   VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.warn('   VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
}

export function getSupabaseClient(): SupabaseClient | null {
  return supabaseClient
}

export default supabaseClient

