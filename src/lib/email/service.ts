import { resend, EMAIL_CONFIG } from '@/lib/resend'
import {
  verificationEmail,
  verificationApprovedEmail,
  verificationRejectedEmail,
  businessNotificationEmail,
  welcomeEmail,
  inquiryNotificationEmail,
} from './templates'

export interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text: string
  replyTo?: string
}

export class EmailService {
  /**
   * Send a generic email with 45s timeout
   */
  static async sendEmail(params: SendEmailParams) {
    if (!resend) {
      console.error('Email service not configured - RESEND_API_KEY missing')
      return { success: false, error: new Error('Email service not configured') }
    }

    try {
      const fromAddress = EMAIL_CONFIG.from
      const toAddress = Array.isArray(params.to) ? params.to.join(', ') : params.to

      console.log(`[EmailService] Attempting to send email:
        Subject: ${params.subject}
        From: ${fromAddress}
        To: ${toAddress}
      `)

      // Detect common delivery pitfalls
      if (fromAddress.toLowerCase().includes('@gmail.com')) {
        console.warn(`[EmailService] WARNING: Sending from a @gmail.com address (${fromAddress}) via Resend is likely to fail or be flagged as spam due to DMARC policies. Please use a verified domain address like noreply@archeryrangescanada.ca for production.`)
      }

      const emailPromise = resend.emails.send({
        from: fromAddress,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        replyTo: params.replyTo || EMAIL_CONFIG.replyTo,
      })

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Email send timeout - exceeded 45 seconds')), 45000)
      )

      const result = await Promise.race([emailPromise, timeoutPromise]) as any

      if (result.error) {
        console.error('[EmailService] Resend returned error:', result.error)
        return { success: false, error: result.error }
      }

      console.log(`[EmailService] Email sent successfully. ID: ${result.data?.id || 'N/A'}`)

      return { success: true, data: result.data }
    } catch (error) {
      console.error('[EmailService] Unexpected error sending email:', error)
      return { success: false, error }
    }
  }

  /**
   * Send verification email to business
   */
  static async sendVerificationEmail(params: {
    to: string
    businessName: string
    rangeName: string
    verificationId: string
  }) {
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/verify/${params.verificationId}`
    const template = verificationEmail({
      businessName: params.businessName,
      rangeName: params.rangeName,
      verificationLink,
    })

    return this.sendEmail({
      to: params.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  /**
   * Send verification approved email
   */
  static async sendVerificationApprovedEmail(params: {
    to: string
    businessName: string
    rangeName: string
    rangeId: string
  }) {
    const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/${params.rangeId}`
    const template = verificationApprovedEmail({
      businessName: params.businessName,
      rangeName: params.rangeName,
      dashboardLink,
    })

    return this.sendEmail({
      to: params.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  /**
   * Send verification rejected email
   */
  static async sendVerificationRejectedEmail(params: {
    to: string
    businessName: string
    rangeName: string
    reason: string
  }) {
    const template = verificationRejectedEmail({
      businessName: params.businessName,
      rangeName: params.rangeName,
      reason: params.reason,
      supportEmail: EMAIL_CONFIG.replyTo,
    })

    return this.sendEmail({
      to: params.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  /**
   * Send welcome email to new business
   */
  static async sendWelcomeEmail(params: {
    to: string
    businessName: string
    rangeId?: string
  }) {
    const dashboardLink = params.rangeId
      ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/${params.rangeId}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`

    const template = welcomeEmail({
      businessName: params.businessName,
      email: params.to,
      dashboardLink,
    })

    return this.sendEmail({
      to: params.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  /**
   * Send inquiry notification to business
   */
  static async sendInquiryNotification(params: {
    to: string
    businessName: string
    rangeName: string
    rangeId: string
    customerName: string
    customerEmail: string
    message: string
  }) {
    const dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    const template = inquiryNotificationEmail({
      businessName: params.businessName,
      rangeName: params.rangeName,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      message: params.message,
      dashboardLink,
    })

    return this.sendEmail({
      to: params.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: params.customerEmail,
    })
  }

  /**
   * Send custom notification to business
   */
  static async sendBusinessNotification(params: {
    to: string | string[]
    businessName: string
    subject: string
    message: string
    actionLink?: string
    actionText?: string
  }) {
    const template = businessNotificationEmail({
      businessName: params.businessName,
      subject: params.subject,
      message: params.message,
      actionLink: params.actionLink,
      actionText: params.actionText,
    })

    return this.sendEmail({
      to: params.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  /**
   * Send bulk emails to multiple businesses
   */
  static async sendBulkEmails(params: {
    recipients: Array<{
      email: string
      businessName: string
    }>
    subject: string
    message: string
    actionLink?: string
    actionText?: string
  }) {
    const results = await Promise.allSettled(
      params.recipients.map((recipient) =>
        this.sendBusinessNotification({
          to: recipient.email,
          businessName: recipient.businessName,
          subject: params.subject,
          message: params.message,
          actionLink: params.actionLink,
          actionText: params.actionText,
        })
      )
    )

    const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - successful

    return {
      success: true,
      total: results.length,
      successful,
      failed,
      results,
    }
  }
}
