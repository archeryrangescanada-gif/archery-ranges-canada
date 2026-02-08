import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { EmailService } from '@/lib/email/service'

export async function GET(request: Request) {
  console.log('🔐 API Auth callback triggered')

  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'

  // Try to get plan from URL first, then cookie
  const cookieStore = cookies()
  const plan = searchParams.get('plan') || cookieStore.get('signup_plan')?.value

  console.log('📍 API Auth callback params:', {
    hasCode: !!code,
    next,
    plan,
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

        // Check if this is a new user (created within the last minute) for welcome email
        const createdAt = new Date(user.created_at)
        const now = new Date()
        const isNewUser = (now.getTime() - createdAt.getTime()) < 60000 // 1 minute

        // Send welcome email to new general users (OAuth signups)
        if (isNewUser && !hasRanges) {
          const userName = user.user_metadata?.full_name || user.user_metadata?.name || 'Archer'
          const userEmail = user.email

          if (userEmail) {
            console.log(`📧 Sending welcome email to new OAuth user: ${userEmail}`)
            // Non-blocking - don't wait for email to send
            EmailService.sendArcherWelcomeEmail({
              to: userEmail,
              name: userName,
            }).catch(err => console.error('Failed to send welcome email:', err))
          }
        }

        // Redirect to home page - user will see their profile in the header
        console.log('↗️ Redirecting to home page')
        return NextResponse.redirect(`${origin}/`)
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
