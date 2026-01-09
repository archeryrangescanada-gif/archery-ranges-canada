import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/service'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
    if (!verificationRequest.user || !verificationRequest.user.email) {
        clearTimeout(timeoutId)
        return NextResponse.json({ error: 'User email not found associated with this request' }, { status: 400 })
    }

    try {
        const result = await EmailService.sendVerificationApprovedEmail({
          to: verificationRequest.user.email,
          businessName: verificationRequest.user.full_name || verificationRequest.range.name,
          rangeName: verificationRequest.range.name,
          rangeId: verificationRequest.range.id,
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

  } catch (error) {
    console.error('Error sending verification approved email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
