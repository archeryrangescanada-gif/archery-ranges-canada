import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/service'
import { getSupabaseClient } from '@/lib/supabase/safe-client'
import { logger } from '@/lib/logger'

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

    const { requestId, reason } = body

    if (!requestId || !reason) {
      return NextResponse.json({ error: 'Missing requestId or reason' }, { status: 400 })
    }

    if (typeof requestId !== 'string' || typeof reason !== 'string') {
        return NextResponse.json({ error: 'Invalid field types' }, { status: 400 })
    }

    // Add timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 45000)

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

    const user = Array.isArray(verificationRequest.user) ? verificationRequest.user[0] : verificationRequest.user;
    const range = Array.isArray(verificationRequest.range) ? verificationRequest.range[0] : verificationRequest.range;

    if (!user || !user.email) {
        clearTimeout(timeoutId)
        return NextResponse.json({ error: 'User email not found associated with this request' }, { status: 400 })
    }

    try {
        // Send rejection email
        const result = await EmailService.sendVerificationRejectedEmail({
          to: user.email,
          businessName: user.full_name || range.name,
          rangeName: range.name,
          reason,
        })

        clearTimeout(timeoutId)

        if (!result.success) {
          return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
        }

        return NextResponse.json({ success: true, data: result.data })
    } catch (emailError) {
        clearTimeout(timeoutId)
        logger.error('Email sending failed:', emailError)
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

  } catch (error: any) {
    if (error.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timeout' }, { status: 504 })
    }
    logger.error('Error sending verification rejected email:', error)
    const message = error.message === 'Failed to create Supabase client' ? 'Configuration error' : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
