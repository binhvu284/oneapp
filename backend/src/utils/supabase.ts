import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || ''

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
  console.warn('   Some features (auth, database) will not work without Supabase.')
}

export { supabase }
export default supabase

