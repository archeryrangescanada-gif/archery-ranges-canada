import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client with service role key for API routes
 * Includes error handling and validation
 */
export function getSupabaseClient() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined in environment variables')
    }

    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables')
    }

    const client = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    if (!client) {
      throw new Error('Failed to create Supabase client')
    }

    return client
  } catch (error) {
    console.error('Supabase client creation failed:', error)
    throw error
  }
}

/**
 * Execute a Supabase query with error handling
 */
export async function executeSupabaseQuery<T>(
  queryFn: (client: any) => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const client = getSupabaseClient()
    const { data, error } = await queryFn(client)

    if (error) {
      console.error('Database query failed:', error)
      return {
        data: null,
        error: error.message || 'Database error'
      }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error('Fatal error in executeSupabaseQuery:', error)
    return {
      data: null,
      error: error.message || 'Internal server error'
    }
  }
}
