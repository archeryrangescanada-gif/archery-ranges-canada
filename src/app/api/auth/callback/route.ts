import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('🔐 API Auth callback triggered')

  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'

  console.log('📍 API Auth callback params:', {
    hasCode: !!code,
    next,
    origin,
    fullUrl: request.url
  })

  if (code) {
    try {
      const supabase = await createClient()
      console.log('🔄 Exchanging code for session...')

      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('❌ Code exchange failed:', error)
        return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error.message)}`)
      }

      console.log('✅ Code exchange successful')

      // Get the user to determine where to redirect
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        console.log('✅ User found:', user.id)

        // Check if user has any ranges
        const { data: ranges } = await supabase
          .from('ranges')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1)

        const hasRanges = ranges && ranges.length > 0

        // Redirect based on user status
        if (hasRanges) {
          console.log('↗️ Redirecting to dashboard (existing user)')
          return NextResponse.redirect(`${origin}/dashboard`)
        } else {
          console.log('↗️ Redirecting to onboarding (new user)')
          return NextResponse.redirect(`${origin}/dashboard/onboarding`)
        }
      }
    } catch (err) {
      console.error('❌ Unexpected error:', err)
      return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed`)
    }
  }

  // No code provided
  console.log('↗️ No code - redirecting to login')
  return NextResponse.redirect(`${origin}/auth/login?error=No authorization code`)
}
