// Email template types
export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Base email wrapper with consistent styling
const emailWrapper = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Archery Ranges Canada</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background-color: #10b981; padding: 40px 20px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Archery Ranges Canada</h1>
    </div>

    <!-- Content -->
    <div style="padding: 40px 20px;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        Archery Ranges Canada - Find the perfect archery range near you
      </p>
      <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
        You received this email because you registered on our platform.
      </p>
    </div>
  </div>
</body>
</html>
`

// Verification Email Template
export const verificationEmail = (params: {
  businessName: string
  verificationLink: string
  rangeName: string
}): EmailTemplate => {
  const html = emailWrapper(`
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px;">Verify Your Business Listing</h2>

    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Hello <strong>${params.businessName}</strong>,
    </p>

    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Thank you for claiming <strong>${params.rangeName}</strong> on Archery Ranges Canada.
      To complete the verification process, please submit your business documentation.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${params.verificationLink}"
         style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Verify Your Business
      </a>
    </div>

    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <a href="${params.verificationLink}" style="color: #10b981; word-break: break-all;">${params.verificationLink}</a>
    </p>
  `)

  const text = `
Verify Your Business Listing

Hello ${params.businessName},

Thank you for claiming ${params.rangeName} on Archery Ranges Canada.
To complete the verification process, please submit your business documentation.

Verify your business: ${params.verificationLink}

---
Archery Ranges Canada - Find the perfect archery range near you
`

  return {
    subject: `Verify Your Business - ${params.rangeName}`,
    html,
    text,
  }
}

// Verification Approved Email
export const verificationApprovedEmail = (params: {
  businessName: string
  rangeName: string
  dashboardLink: string
}): EmailTemplate => {
  const html = emailWrapper(`
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px;">🎉 Your Business is Verified!</h2>

    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Congratulations <strong>${params.businessName}</strong>!
    </p>

    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Your claim for <strong>${params.rangeName}</strong> has been approved. You now have full access to manage your listing.
    </p>

    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
        <strong>What you can do now:</strong><br>
        • Update your business information<br>
        • Upload photos and videos<br>
        • Respond to customer inquiries<br>
        • View analytics and insights
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${params.dashboardLink}"
         style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Go to Dashboard
      </a>
    </div>
  `)

  const text = `
Your Business is Verified!

Congratulations ${params.businessName}!

Your claim for ${params.rangeName} has been approved. You now have full access to manage your listing.

What you can do now:
• Update your business information
• Upload photos and videos
• Respond to customer inquiries
• View analytics and insights

Go to your dashboard: ${params.dashboardLink}

---
Archery Ranges Canada - Find the perfect archery range near you
`

  return {
    subject: `✓ Verification Approved - ${params.rangeName}`,
    html,
    text,
  }
}

// Verification Rejected Email
export const verificationRejectedEmail = (params: {
  businessName: string
  rangeName: string
  reason: string
  supportEmail: string
}): EmailTemplate => {
  const html = emailWrapper(`
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px;">Verification Update Required</h2>

    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Hello <strong>${params.businessName}</strong>,
    </p>

    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      We've reviewed your verification request for <strong>${params.rangeName}</strong> and need additional information.
    </p>

    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #991b1b; font-weight: 600;">Reason:</p>
      <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
        ${params.reason}
      </p>
    </div>

    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Please contact our support team at <a href="mailto:${params.supportEmail}" style="color: #10b981;">${params.supportEmail}</a> to resolve this issue.
    </p>
  `)

  const text = `
Verification Update Required

Hello ${params.businessName},

We've reviewed your verification request for ${params.rangeName} and need additional information.

Reason:
${params.reason}

Please contact our support team at ${params.supportEmail} to resolve this issue.

---
Archery Ranges Canada - Find the perfect archery range near you
`

  return {
    subject: `Verification Update Required - ${params.rangeName}`,
    html,
    text,
  }
}

// Business Notification Email
export const businessNotificationEmail = (params: {
  businessName: string
  subject: string
  message: string
  actionLink?: string
  actionText?: string
}): EmailTemplate => {
  const actionButton = params.actionLink && params.actionText ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${params.actionLink}"
         style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
        ${params.actionText}
      </a>
    </div>
  ` : ''

  const html = emailWrapper(`
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px;">${params.subject}</h2>

    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Hello <strong>${params.businessName}</strong>,
    </p>

    <div style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      ${params.message}
    </div>

    ${actionButton}
  `)

  const text = `
${params.subject}

Hello ${params.businessName},

${params.message.replace(/<[^>]*>/g, '')}

${params.actionLink && params.actionText ? `${params.actionText}: ${params.actionLink}` : ''}

---
Archery Ranges Canada - Find the perfect archery range near you
`

  return {
    subject: params.subject,
    html,
    text,
  }
}

// Welcome Email for New Businesses
export const welcomeEmail = (params: {
  businessName: string
  email: string
  dashboardLink: string
}): EmailTemplate => {
  const html = emailWrapper(`
    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Hi ${params.businessName},
    </p>

    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Thanks for joining Archery Ranges Canada. You're now part of the first dedicated directory connecting Canadian archers with facilities like yours.
    </p>

    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6; font-weight: 600;">
      Your next step: Claim your listing and make it yours.
    </p>

    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Add your hours, photos, programs, and what makes your range worth the drive. Archers are already searching — a complete profile means they find you instead of the other guy.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${params.dashboardLink}"
         style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Claim Your Listing →
      </a>
    </div>

    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Questions? Just hit reply. I'm here to help you get set up.
    </p>

    <p style="margin: 0 0 10px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Talk soon,<br>
      <strong>Josh</strong><br>
      Founder, Archery Ranges Canada
    </p>

    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 13px; line-height: 1.6; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      <strong>P.S.</strong> As a founding member of the directory, your feedback shapes what we build next. Don't be a stranger.
    </p>
  `)

  const text = `
Hi ${params.businessName},

Thanks for joining Archery Ranges Canada. You're now part of the first dedicated directory connecting Canadian archers with facilities like yours.

Your next step: Claim your listing and make it yours.

Add your hours, photos, programs, and what makes your range worth the drive. Archers are already searching — a complete profile means they find you instead of the other guy.

Claim Your Listing: ${params.dashboardLink}

Questions? Just hit reply. I'm here to help you get set up.

Talk soon,
Josh
Founder, Archery Ranges Canada

P.S. As a founding member of the directory, your feedback shapes what we build next. Don't be a stranger.

---
Archery Ranges Canada - Find the perfect archery range near you
`

  return {
    subject: `Your range is waiting for you, ${params.businessName}`,
    html,
    text,
  }
}

// Inquiry Notification Email
export const inquiryNotificationEmail = (params: {
  businessName: string
  rangeName: string
  customerName: string
  customerEmail: string
  message: string
  dashboardLink: string
}): EmailTemplate => {
  const html = emailWrapper(`
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px;">New Customer Inquiry</h2>

    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Hello <strong>${params.businessName}</strong>,
    </p>

    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      You have a new inquiry for <strong>${params.rangeName}</strong> from a potential customer.
    </p>

    <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 10px 0; color: #111827; font-weight: 600;">From:</p>
      <p style="margin: 0 0 20px 0; color: #374151;">
        ${params.customerName}<br>
        <a href="mailto:${params.customerEmail}" style="color: #10b981;">${params.customerEmail}</a>
      </p>

      <p style="margin: 0 0 10px 0; color: #111827; font-weight: 600;">Message:</p>
      <p style="margin: 0; color: #374151; line-height: 1.6;">
        ${params.message}
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${params.dashboardLink}"
         style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
        View in Dashboard
      </a>
    </div>

    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
      Reply directly to this email or through your dashboard to respond to the customer.
    </p>
  `)

  const text = `
New Customer Inquiry

Hello ${params.businessName},

You have a new inquiry for ${params.rangeName} from a potential customer.

From:
${params.customerName}
${params.customerEmail}

Message:
${params.message}

View in dashboard: ${params.dashboardLink}

Reply directly to this email or through your dashboard to respond to the customer.

---
Archery Ranges Canada - Find the perfect archery range near you
`

  return {
    subject: `New Inquiry - ${params.rangeName}`,
    html,
    text,
  }
}

// Archer Welcome Email (General Users)
export const archerWelcomeEmail = (params: {
  name: string
}): EmailTemplate => {
  const html = emailWrapper(`
    <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px;">Welcome to the community, ${params.name} 🎯</h2>

    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Hi ${params.name},
    </p>

    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      You're in. Welcome to Archery Ranges Canada.
    </p>

    <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      We're building the most complete directory of archery ranges, clubs, and coaches across the country — so you can spend less time searching and more time shooting.
    </p>

    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
        <strong>A few things you can do:</strong><br>
        Browse ranges near you, check out what programs are offered, and save your favourites. If you find a range that's missing or has outdated info, let us know — we're making this better every week.
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://archeryrangescanada.ca"
         style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Find Ranges Near You →
      </a>
    </div>

    <p style="margin: 0 0 10px 0; color: #374151; font-size: 16px; line-height: 1.6;">
      Happy shooting,<br>
      <strong>Josh</strong><br>
      Founder, Archery Ranges Canada
    </p>

    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 13px; line-height: 1.6; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      <strong>P.S.</strong> Got a home range you love? Tell them about us. The more facilities listed, the better this gets for everyone.
    </p>
  `)

  const text = `
Welcome to the community, ${params.name} 🎯

Hi ${params.name},

You're in. Welcome to Archery Ranges Canada.

We're building the most complete directory of archery ranges, clubs, and coaches across the country — so you can spend less time searching and more time shooting.

A few things you can do:
Browse ranges near you, check out what programs are offered, and save your favourites. If you find a range that's missing or has outdated info, let us know — we're making this better every week.

Find Ranges Near You: https://archeryrangescanada.ca

Happy shooting,
Josh
Founder, Archery Ranges Canada

P.S. Got a home range you love? Tell them about us. The more facilities listed, the better this gets for everyone.

---
Archery Ranges Canada - Find the perfect archery range near you
`

  return {
    subject: `Welcome to the community, ${params.name} 🎯`,
    html,
    text,
  }
}
