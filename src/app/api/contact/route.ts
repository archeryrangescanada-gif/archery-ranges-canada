import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

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

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return NextResponse.json(
        { error: 'Email service not configured. Please contact us at archeryrangescanada@gmail.com' },
        { status: 500 }
      )
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Format email content with HTML
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">New Contact Form Submission</h2>
        <p style="background-color: #f3f4f6; padding: 15px; border-radius: 5px;">
          <strong>From:</strong> ${name}<br>
          <strong>Email:</strong> <a href="mailto:${email}">${email}</a><br>
          <strong>Subject:</strong> ${subject}
        </p>
        <div style="margin-top: 20px;">
          <h3 style="color: #374151;">Message:</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Sent from archeryrangescanada.ca contact form
        </p>
      </div>
    `

    const textContent = `
New Contact Form Submission from Archery Ranges Canada

From: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Sent from archeryrangescanada.ca contact form
`

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Archery Ranges Canada <noreply@archeryrangescanada.ca>',
      to: 'archeryrangescanada@gmail.com',
      reply_to: email,
      subject: `Contact Form: ${subject}`,
      html: htmlContent,
      text: textContent
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error('Failed to send email')
    }

    console.log('Email sent successfully:', data)

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully'
    })

  } catch (error: any) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later or email us directly at archeryrangescanada@gmail.com' },
      { status: 500 }
    )
  }
}
