import { createClient, SupabaseClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables from .env file BEFORE reading them
// This ensures .env is loaded even if index.ts hasn't called dotenv.config() yet
const envResult = dotenv.config()
console.log('[Dotenv] Config loaded:', {
  error: envResult.error?.message || null,
  parsed: envResult.parsed ? Object.keys(envResult.parsed) : null,
  cwd: process.cwd(),
})

// Debug: Log environment variables (without exposing full keys)
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || ''

console.log('[Supabase Config]', {
  hasUrl: !!supabaseUrl,
  urlLength: supabaseUrl.length,
  urlValue: supabaseUrl || 'EMPTY',
  hasKey: !!supabaseKey,
  keyLength: supabaseKey.length,
  keyPrefix: supabaseKey ? supabaseKey.substring(0, 15) + '...' : 'EMPTY',
  envKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE')),
})

let supabase: SupabaseClient | null = null
let supabaseAdmin: SupabaseClient | null = null

// Regular client (uses anon key or service_role key)
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // We handle sessions via JWT
    },
  })
  console.log('✅ Supabase client initialized')
} else {
  console.warn('⚠️  Supabase credentials not configured. Running in demo mode.')
  console.warn('   SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.warn('   SUPABASE_KEY:', supabaseKey ? 'Set' : 'Missing')
  console.warn('   Some features (auth, database) will not work without Supabase.')
}

// Admin client (uses service_role key for admin operations like auto-confirming users)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  console.log('✅ Supabase Admin client initialized')
} else if (supabaseUrl && !supabaseServiceRoleKey) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not set. Email auto-confirmation will be disabled.')
  console.warn('   To enable auto-confirmation, add SUPABASE_SERVICE_ROLE_KEY to your .env file.')
}

export { supabase, supabaseAdmin }
export default supabase

