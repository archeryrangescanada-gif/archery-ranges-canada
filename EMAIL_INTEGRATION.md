# Email Integration Documentation

This document explains how the Resend email integration works in the Archery Ranges Canada platform.

## Overview

The platform uses [Resend](https://resend.com) for sending transactional emails to businesses and users. Email functionality is integrated into:

- Admin dashboard for bulk email sending
- Verification workflow (approve/reject claims)
- Business notifications
- User onboarding

## Setup Instructions

### 1. Configure Environment Variables

Add the following to your `.env` file:

```bash
# Resend Email API Configuration
RESEND_API_KEY=re_your_api_key_here

# Email sender configuration
RESEND_FROM_EMAIL="Archery Ranges Canada <noreply@archeryrangescanada.com>"
RESEND_REPLY_TO_EMAIL="support@archeryrangescanada.com"

# Application URL for email links
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Get Your Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (e.g., archeryrangescanada.com)
3. Generate an API key from the [API Keys page](https://resend.com/api-keys)
4. Add the key to your `.env` file

### 3. Domain Verification

For production, you need to verify your domain:

1. Go to [Resend Domains](https://resend.com/domains)
2. Add your domain (e.g., archeryrangescanada.com)
3. Add the DNS records provided by Resend to your domain
4. Wait for verification (usually takes a few minutes)

For development, you can use Resend's test domain.

## File Structure

```
src/
├── lib/
│   ├── resend.ts                    # Resend client configuration
│   └── email/
│       ├── templates.ts              # Email HTML/text templates
│       └── service.ts                # Email sending service
│
└── app/
    ├── admin/
    │   └── emails/
    │       └── page.tsx              # Admin email management UI
    │
    └── api/
        └── admin/
            └── emails/
                ├── send/
                │   └── route.ts      # Send bulk/single emails
                ├── businesses/
                │   └── route.ts      # Get email recipients
                ├── verification-approved/
                │   └── route.ts      # Send approval emails
                └── verification-rejected/
                    └── route.ts      # Send rejection emails
```

## Email Templates

### Available Templates

1. **Verification Email** - Sent when a business needs to verify their claim
2. **Verification Approved** - Sent when admin approves a business claim
3. **Verification Rejected** - Sent when admin rejects a business claim
4. **Welcome Email** - Sent to new businesses joining the platform
5. **Business Notification** - Generic template for custom messages
6. **Inquiry Notification** - Sent when a customer inquires about a range

### Template Features

- Responsive HTML design
- Plain text fallback
- Consistent branding (green theme)
- Action buttons with links
- Personalization (business name, range name, etc.)

## Usage Examples

### Send a Verification Approved Email

```typescript
import { EmailService } from '@/lib/email/service'

await EmailService.sendVerificationApprovedEmail({
  to: 'business@example.com',
  businessName: 'Toronto Archery Club',
  rangeName: 'Toronto Indoor Range',
  rangeId: 'range-123',
})
```

### Send a Custom Business Notification

```typescript
import { EmailService } from '@/lib/email/service'

await EmailService.sendBusinessNotification({
  to: 'business@example.com',
  businessName: 'Toronto Archery Club',
  subject: 'Platform Update',
  message: '<p>We have exciting new features...</p>',
  actionLink: 'https://archeryrangescanada.com/dashboard',
  actionText: 'View Dashboard',
})
```

### Send Bulk Emails (Admin)

```typescript
import { EmailService } from '@/lib/email/service'

const result = await EmailService.sendBulkEmails({
  recipients: [
    { email: 'business1@example.com', businessName: 'Range 1' },
    { email: 'business2@example.com', businessName: 'Range 2' },
  ],
  subject: 'Important Platform Update',
  message: '<p>Hello <strong>{{businessName}}</strong>...</p>',
  actionLink: 'https://archeryrangescanada.com/updates',
  actionText: 'Learn More',
})

console.log(`Sent ${result.successful} emails, ${result.failed} failed`)
```

## Admin Dashboard

### Accessing the Email Management Page

1. Login to admin dashboard at `/admin/login`
2. Navigate to "Emails" in the sidebar
3. You'll see the email composer interface

### Features

- **Compose emails** with subject, message, and optional action buttons
- **Select recipients** from verified businesses (search and filter)
- **Quick templates** for common email types
- **Bulk sending** to multiple businesses at once
- **Success/error notifications**

### Email Templates in Dashboard

Quick templates available:
- Platform Update
- Feature Announcement
- Thank You Note

Click a template to auto-fill the composer.

## Verification Workflow Integration

### Automatic Emails

When an admin approves or rejects a business claim:

1. **Approval**: Sends "Verification Approved" email with dashboard link
2. **Rejection**: Sends "Verification Rejected" email with reason

These are automatically triggered in `/admin/claims` page.

### Email Content

**Approval Email:**
- Congratulates business
- Provides dashboard link
- Lists what they can do next

**Rejection Email:**
- Explains why verification failed
- Provides support contact
- Offers next steps

## API Endpoints

### POST `/api/admin/emails/send`

Send single or bulk emails.

**Request Body:**
```json
{
  "type": "bulk",
  "recipients": [
    {
      "email": "business@example.com",
      "businessName": "Toronto Archery Club"
    }
  ],
  "subject": "Platform Update",
  "message": "<p>Your message here...</p>",
  "actionLink": "https://...",
  "actionText": "View Details"
}
```

### GET `/api/admin/emails/businesses`

Get all verified businesses for email sending.

**Response:**
```json
{
  "success": true,
  "businesses": [
    {
      "id": "claim-123",
      "rangeId": "range-456",
      "rangeName": "Toronto Indoor Range",
      "email": "business@example.com",
      "businessName": "Toronto Archery Club"
    }
  ],
  "total": 1
}
```

### POST `/api/admin/emails/verification-approved`

Send approval email for a verification request.

**Request Body:**
```json
{
  "requestId": "verification-request-123"
}
```

### POST `/api/admin/emails/verification-rejected`

Send rejection email for a verification request.

**Request Body:**
```json
{
  "requestId": "verification-request-123",
  "reason": "Invalid business license"
}
```

## Error Handling

The email service gracefully handles errors:

- Returns `{ success: false, error }` on failure
- Logs errors to console
- Doesn't block main workflow (e.g., claim approval still works even if email fails)

Example:
```typescript
const result = await EmailService.sendWelcomeEmail({...})

if (!result.success) {
  console.error('Email failed:', result.error)
  // Handle gracefully
}
```

## Testing

### Development Testing

1. Use Resend's test mode for development
2. Check the Resend dashboard for sent emails
3. View email previews in Resend's email viewer

### Test Email Template

```typescript
await EmailService.sendBusinessNotification({
  to: 'test@example.com',
  businessName: 'Test Business',
  subject: 'Test Email',
  message: '<p>This is a test email</p>',
})
```

## Production Checklist

- [ ] Domain verified in Resend
- [ ] DNS records configured
- [ ] API key updated in production environment
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] `RESEND_FROM_EMAIL` uses verified domain
- [ ] Test emails sent successfully
- [ ] Email delivery monitored in Resend dashboard

## Troubleshooting

### Emails Not Sending

1. Check `RESEND_API_KEY` is set correctly
2. Verify domain in Resend dashboard
3. Check console for error messages
4. Verify API key has correct permissions

### Email Going to Spam

1. Verify domain with SPF/DKIM records
2. Use verified sender email
3. Avoid spammy content
4. Test with different email providers

### Template Variables Not Replacing

Use the template functions directly - variables like `{{businessName}}` are replaced by the template functions before sending.

## Support

For issues with Resend:
- [Resend Documentation](https://resend.com/docs)
- [Resend Support](https://resend.com/support)

For platform-specific issues:
- Check server logs
- Review API endpoint responses
- Contact development team
