import { NextRequest, NextResponse } from 'next/server'
import { EmailService } from '@/lib/email/service'
import { createClient } from '@supabase/supabase-js'

// Admin authentication check
async function isAdmin(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) return false

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin'
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await isAdmin(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, recipients, subject, message, actionLink, actionText } = body

    if (!type || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'single':
        // Send to a single business
        if (!recipients[0].email || !recipients[0].businessName) {
          return NextResponse.json(
            { error: 'Invalid recipient data' },
            { status: 400 }
          )
        }

        result = await EmailService.sendBusinessNotification({
          to: recipients[0].email,
          businessName: recipients[0].businessName,
          subject,
          message,
          actionLink,
          actionText,
        })
        break

      case 'bulk':
        // Send to multiple businesses
        result = await EmailService.sendBulkEmails({
          recipients,
          subject,
          message,
          actionLink,
          actionText,
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
