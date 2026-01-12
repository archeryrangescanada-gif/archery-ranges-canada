import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('🔐 Auth callback triggered')

  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  console.log('📍 Auth callback params:', {
    hasCode: !!code,
    next,
    origin,
    fullUrl: request.url
  })

  if (code) {
    try {
      const supabase = await createClient()
      console.log('🔄 Exchanging code for session...')

      const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('❌ Code exchange failed:', error)
        return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`)
      }

      console.log('✅ Code exchange successful, session created')

      // If there's a specific redirect, use it
      if (next) {
        console.log(`↗️ Redirecting to specific next: ${next}`)
        const response = NextResponse.redirect(`${origin}${next}`)

        // If redirecting to admin, ensure the legacy admin cookie is set
        if (next.startsWith('/admin')) {
          response.cookies.set('admin-token', 'valid-token', { path: '/' })
          console.log('🔑 Admin cookie set')
        }

        return response
      }

      // Check if user already has a range listing
      console.log('👤 Fetching user data...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error('❌ Failed to get user:', userError)
        return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`)
      }

      if (user) {
        console.log('✅ User found:', user.id)

        const { data: ranges, error: rangesError } = await supabase
          .from('ranges')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1)

        if (rangesError) {
          console.error('❌ Failed to query ranges:', rangesError)
          // Continue anyway - redirect to onboarding by default
        }

        const rangeCount = ranges?.length || 0
        console.log(`📊 User has ${rangeCount} listings`)

        // New user (no listings) → Onboarding
        // Existing user (has listings) → Dashboard
        if (rangeCount === 0) {
          console.log('↗️ Redirecting NEW user to onboarding')
          return NextResponse.redirect(`${origin}/dashboard/onboarding`)
        } else {
          console.log('↗️ Redirecting EXISTING user to dashboard')
          return NextResponse.redirect(`${origin}/dashboard`)
        }
      }

      console.error('❌ No user found after successful session exchange')
    } catch (err) {
      console.error('❌ Unexpected error in auth callback:', err)
      return NextResponse.redirect(`${origin}/auth/login?error=Authentication failed`)
    }
  } else {
    console.warn('⚠️ No authorization code provided')
  }

  // Return to login page with error
  console.log('↗️ Redirecting to login with error (fallback)')
  return NextResponse.redirect(`${origin}/auth/login?error=Could not authenticate`)
}