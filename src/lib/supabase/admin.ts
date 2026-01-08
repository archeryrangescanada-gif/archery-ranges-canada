import { createClient } from '@supabase/supabase-js';

export const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    // Return a mock client if keys are missing (e.g. during build without env vars)
    console.warn('Supabase keys missing in getAdminClient - returning mock');
    // Recursive proxy to mock any method chain
    const createMock = () => new Proxy(() => Promise.resolve({ data: [], error: null }), {
      get: (target, prop) => {
        if (prop === 'then') return undefined;
        return createMock();
      }
    });
    return createMock() as any;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
