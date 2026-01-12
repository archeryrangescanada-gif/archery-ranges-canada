import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/service'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()

    const body = await request.json()
    const { requestId } = body

    if (!requestId) {
      return NextResponse.json({ error: 'Missing requestId' }, { status: 400 })
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

    // Send approval email
    const result = await EmailService.sendVerificationApprovedEmail({
      to: verificationRequest.user.email,
      businessName: verificationRequest.user.full_name || verificationRequest.range.name,
      rangeName: verificationRequest.range.name,
      rangeId: verificationRequest.range.id,
    })

    if (!result.success) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Error sending verification approved email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
