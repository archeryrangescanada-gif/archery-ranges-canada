import { createClient } from '@supabase/supabase-js';

export function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL or Service Role Key is missing. Check your environment variables.');
  }

  try {
    const client = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    if (!client) {
      throw new Error('Failed to create Supabase client instance.');
    }

    return client;
  } catch (error) {
    console.error('Supabase client creation failed:', error);
    throw error;
  }
}
