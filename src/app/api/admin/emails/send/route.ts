import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { EmailService } from '@/lib/email/service'

export async function POST(request: Request) {
  try {
    // Check for admin token cookie (legacy/demo auth)
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin-token')?.value

    // Verify admin user via Supabase OR admin token
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // If valid admin token, allow through (skip all other checks)
    if (adminToken === 'valid-token') {
      // Admin token is valid, proceed
    } else if (user) {
      // Check if user has admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || !['admin', 'admin_employee', 'super_admin'].includes(profile.role)) {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
      }
    } else {
      // No valid auth
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { to, subject, message, type } = await request.json()

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, message' },
        { status: 400 }
      )
    }

    // Convert plain text message to simple HTML
    const htmlMessage = message
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
    const html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>${htmlMessage}</p>
      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">Sent from Archery Ranges Canada Admin</p>
    </div>`

    if (type === 'bulk') {
      // Handle bulk emails - comma separated
      const recipients = to.split(',').map((email: string) => email.trim()).filter(Boolean)

      const results = await Promise.allSettled(
        recipients.map((email: string) =>
          EmailService.sendEmail({
            to: email,
            subject,
            html,
            text: message,
          })
        )
      )

      const successful = results.filter((r) => r.status === 'fulfilled').length
      const failed = results.length - successful

      return NextResponse.json({
        success: true,
        message: `Sent ${successful} of ${results.length} emails`,
        successful,
        failed,
      })
    } else {
      // Single email
      const result = await EmailService.sendEmail({
        to,
        subject,
        html,
        text: message,
      })

      if (!result.success) {
        throw new Error('Failed to send email')
      }

      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
      })
    }
  } catch (error: any) {
    console.error('Admin send email error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}
