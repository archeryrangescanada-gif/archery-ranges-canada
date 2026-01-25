'use client'

import { useState } from 'react'
import { Mail, Send, Users, CheckCircle, AlertCircle } from 'lucide-react'

export default function EmailsPage() {
  const [emailType, setEmailType] = useState<'single' | 'bulk'>('single')
  const [recipient, setRecipient] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSendEmail = async () => {
    if (!recipient || !subject || !message) {
      setStatus({ type: 'error', message: 'Please fill in all fields' })
      return
    }

    setSending(true)
    setStatus(null)

    try {
      const response = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          subject,
          message,
          type: emailType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      setStatus({ type: 'success', message: 'Email sent successfully!' })
      setRecipient('')
      setSubject('')
      setMessage('')
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message })
    } finally {
      setSending(false)
    }
  }

  // Email templates
  const templates = [
    {
      name: 'Welcome New User',
      subject: 'Welcome to Archery Ranges Canada!',
      message: `Hi [Name],

Welcome to Archery Ranges Canada! We're excited to have you as part of our community.

Your account has been created and you can now:
- Claim your archery range listing
- Manage your business profile
- Connect with archery enthusiasts

If you have any questions, feel free to reach out.

Best regards,
The Archery Ranges Canada Team`,
    },
    {
      name: 'Subscription Reminder',
      subject: 'Your subscription is expiring soon',
      message: `Hi [Name],

Just a friendly reminder that your [Plan] subscription for [Range Name] will expire on [Date].

To continue enjoying all the benefits of your listing, please renew your subscription.

Renew now: [Link]

Thanks for being part of Archery Ranges Canada!

Best regards,
The Archery Ranges Canada Team`,
    },
    {
      name: 'Listing Approved',
      subject: 'Your listing has been approved!',
      message: `Hi [Name],

Great news! Your listing for [Range Name] has been approved and is now live on Archery Ranges Canada.

View your listing: [Link]

You can manage your listing from your dashboard at any time.

Best regards,
The Archery Ranges Canada Team`,
    },
  ]

  const applyTemplate = (template: typeof templates[0]) => {
    setSubject(template.subject)
    setMessage(template.message)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-stone-900">Email Management</h1>
        <p className="text-stone-500 mt-2 text-lg">Send emails to users and manage communications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Email Composer */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Compose Email
          </h2>

          {/* Email Type Toggle */}
          <div className="flex gap-2 p-1 bg-stone-100 rounded-xl mb-6">
            <button
              onClick={() => setEmailType('single')}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                emailType === 'single' ? 'bg-white shadow text-stone-900' : 'text-stone-500'
              }`}
            >
              <Mail className="w-4 h-4" />
              Single Email
            </button>
            <button
              onClick={() => setEmailType('bulk')}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                emailType === 'bulk' ? 'bg-white shadow text-stone-900' : 'text-stone-500'
              }`}
            >
              <Users className="w-4 h-4" />
              Bulk Email
            </button>
          </div>

          {/* Status Message */}
          {status && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
              status.type === 'success'
                ? 'bg-emerald-50 border-2 border-emerald-200 text-emerald-700'
                : 'bg-red-50 border-2 border-red-200 text-red-700'
            }`}>
              {status.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              {status.message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">
                {emailType === 'single' ? 'Recipient Email' : 'Recipients (comma-separated)'}
              </label>
              <input
                type={emailType === 'single' ? 'email' : 'text'}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={emailType === 'single' ? 'user@example.com' : 'user1@example.com, user2@example.com'}
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-emerald-500 outline-none text-stone-900"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject line"
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-emerald-500 outline-none text-stone-900"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your email message here..."
                rows={10}
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-emerald-500 outline-none text-stone-900 resize-none"
              />
            </div>

            <button
              onClick={handleSendEmail}
              disabled={sending || !recipient || !subject || !message}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-300 text-white font-black rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {sending ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </div>

        {/* Templates Sidebar */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-xl font-bold text-stone-800 mb-6">Email Templates</h2>
          <p className="text-sm text-stone-500 mb-4">Click a template to load it into the composer.</p>

          <div className="space-y-3">
            {templates.map((template, index) => (
              <button
                key={index}
                onClick={() => applyTemplate(template)}
                className="w-full p-4 text-left bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors border border-stone-200"
              >
                <div className="font-bold text-stone-800">{template.name}</div>
                <div className="text-sm text-stone-500 mt-1 truncate">{template.subject}</div>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Replace placeholders like [Name], [Range Name], [Link], etc. with actual values before sending.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
