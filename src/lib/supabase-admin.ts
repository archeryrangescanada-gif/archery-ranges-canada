import 'server-only'
import { createClient } from '@supabase/supabase-js'

/**
 * SECURE ADMIN CLIENT - SERVER ONLY
 * This file is protected by 'server-only' and will throw an error if imported on the client
 * Use this ONLY in API routes and Server Components
 */

export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseServiceRoleKey) {
    const envKeys = Object.keys(process.env).sort().join(', ')
    const hasNextPublic = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const debugMsg = `Env check: NEXT_PUBLIC=${hasNextPublic}, Keys=${envKeys}`
    throw new Error(`Missing SUPABASE_SERVICE_ROLE_KEY. ${debugMsg}`)
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
