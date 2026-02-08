import { createClient } from '@/lib/supabase/server'

// Server-side Supabase client for Server Components and API routes
export async function createServerSupabaseClient() {
  return createClient()
}

// Get current user on server side
export async function getCurrentUserServer() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Check if user is authenticated on server side
export async function isAuthenticatedServer() {
  const { user } = await getCurrentUserServer()
  return !!user
}

// Get user profile on server side
export async function getUserProfileServer(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return { data, error }
}

// Check if user is admin on server side
export async function isAdminServer(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return data?.role === 'admin'
}
