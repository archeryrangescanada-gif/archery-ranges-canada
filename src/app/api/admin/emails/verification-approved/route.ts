import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/service'
import { getSupabaseClient } from '@/lib/supabase/safe-client'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Use safe client wrapper
    const supabase = getSupabaseClient()

    let body;
    try {
        body = await request.json()
    } catch(e) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { requestId } = body

    if (!requestId || typeof requestId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid requestId' }, { status: 400 })
    }

    // Add timeout for email operations
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 45000) // 45s max

    // Fetch the verification request with range and user data
    const { data: verificationRequest, error } = await supabase
      .from('verification_requests')
      .select(`
        *,
        range:ranges(id, name),
        user:profiles(id, email, full_name)
      `)
      .eq('id', requestId)
      .single()

    if (error || !verificationRequest) {
      clearTimeout(timeoutId)
      return NextResponse.json({ error: 'Verification request not found' }, { status: 404 })
    }

    // Check if user and email exist
    // Handle nested arrays if Supabase returns them (unlikely with .single(), but good for safety)
    const user = Array.isArray(verificationRequest.user) ? verificationRequest.user[0] : verificationRequest.user;
    const range = Array.isArray(verificationRequest.range) ? verificationRequest.range[0] : verificationRequest.range;

    if (!user || !user.email) {
        clearTimeout(timeoutId)
        return NextResponse.json({ error: 'User email not found associated with this request' }, { status: 400 })
    }

    try {
        const result = await EmailService.sendVerificationApprovedEmail({
          to: user.email,
          businessName: user.full_name || range.name,
          rangeName: range.name,
          rangeId: range.id,
        })

        clearTimeout(timeoutId)

        if (!result.success) {
          return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
        }

        return NextResponse.json({ success: true, data: result.data })
    } catch (emailError) {
        clearTimeout(timeoutId)
        console.error('Email sending failed:', emailError)
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

  } catch (error: any) {
    // Handle timeout specifically if using fetch (though Resend SDK might throw generic error)
    if (error.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timeout' }, { status: 504 })
    }

    console.error('Error sending verification approved email:', error)
    // Safe error message for client
    const message = error.message === 'Failed to create Supabase client' ? 'Configuration error' : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
