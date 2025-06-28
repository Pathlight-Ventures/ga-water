import { createClient as createSupabaseJsClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !(supabaseAnonKey || supabaseServiceRoleKey)) {
  throw new Error('Missing Supabase environment variables')
}

export const createSupabaseClient = (): SupabaseClient => {
  // Use service role key if available (for scripts), otherwise anon key
  const key = supabaseServiceRoleKey || supabaseAnonKey
  return createSupabaseJsClient(supabaseUrl, key, {
    auth: {
      persistSession: false
    }
  })
}

// Export alias for compatibility
export const createClient = createSupabaseClient 