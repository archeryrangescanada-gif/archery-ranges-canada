import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/service'
import { getAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = getAdminClient()

    const body = await request.json()
    const { requestId, reason } = body

    if (!requestId || !reason) {
      return NextResponse.json({ error: 'Missing requestId or reason' }, { status: 400 })
    }

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
      return NextResponse.json({ error: 'Verification request not found' }, { status: 404 })
    }

    // Send rejection email
    const result = await EmailService.sendVerificationRejectedEmail({
      to: verificationRequest.user.email,
      businessName: verificationRequest.user.full_name || verificationRequest.range.name,
      rangeName: verificationRequest.range.name,
      reason,
    })

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Error sending verification rejected email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
