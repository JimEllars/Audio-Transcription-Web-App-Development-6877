import { createClient } from '@supabase/supabase-js'

// Use environment variables for security
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase credentials not configured. Using demo mode.')
}

export const supabase = createClient(
  SUPABASE_URL || 'https://demo.supabase.co',
  SUPABASE_ANON_KEY || 'demo-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  }
)

export default supabase