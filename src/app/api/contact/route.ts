import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Format email content
    const emailContent = `
New Contact Form Submission from Archery Ranges Canada

From: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Sent from archeryrangescanada.ca contact form
`

    // For now, we'll use a simple fetch to send via a third-party service
    // You can integrate with SendGrid, Resend, or similar later

    // Send email using Resend (you'll need to add RESEND_API_KEY to env vars)
    if (process.env.RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Contact Form <noreply@archeryrangescanada.ca>',
          to: 'archeryrangescanada@gmail.com',
          reply_to: email,
          subject: `Contact Form: ${subject}`,
          text: emailContent
        })
      })

      if (!resendResponse.ok) {
        throw new Error('Failed to send email via Resend')
      }
    } else {
      // Fallback: Log to console (for development)
      console.log('Contact form submission:', {
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString()
      })

      // In production without email service, you could save to database
      // const supabase = createClient(...)
      // await supabase.from('contact_submissions').insert({ ... })
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully'
    })

  } catch (error: any) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}
