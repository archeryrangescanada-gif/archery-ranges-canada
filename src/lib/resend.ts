import { Resend } from 'resend'

// Graceful fallback for build time - warn but don't crash
if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ WARNING: RESEND_API_KEY is not defined - email features will be disabled')
}

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.RESEND_FROM_EMAIL || 'Archery Ranges Canada <noreply@archeryrangescanada.com>',
  replyTo: process.env.RESEND_REPLY_TO_EMAIL || 'support@archeryrangescanada.com',
}
