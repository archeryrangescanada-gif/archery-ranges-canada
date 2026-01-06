import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || 'Archery Ranges Canada <noreply@archeryrangescanada.com>',
  replyTo: process.env.RESEND_REPLY_TO_EMAIL || 'support@archeryrangescanada.com',
}
