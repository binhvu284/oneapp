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

export { supabase }
export default supabase

