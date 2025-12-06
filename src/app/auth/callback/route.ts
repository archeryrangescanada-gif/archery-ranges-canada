import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // If there's a specific redirect, use it
      if (next) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      // Check if user already has a range listing
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: ranges } = await supabase
          .from('ranges')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1)

        // New user (no listings) → Onboarding
        // Existing user (has listings) → Dashboard
        if (!ranges || ranges.length === 0) {
          return NextResponse.redirect(`${origin}/dashboard/onboarding`)
        } else {
          return NextResponse.redirect(`${origin}/dashboard`)
        }
      }
    }
  }

  // Return to login page with error
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`)
}