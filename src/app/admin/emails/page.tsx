'use client'

import { useState, useEffect } from 'react'
import { Mail, Send, Users, CheckCircle, AlertCircle, Building2, UserPlus, Check } from 'lucide-react'

interface ListingEmail {
  name: string
  email: string
}

interface UserEmail {
  id: string
  email: string
  full_name?: string
}

export default function EmailsPage() {
  const [emailType, setEmailType] = useState<'single' | 'bulk'>('single')
  const [recipient, setRecipient] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Email lists
  const [listingEmails, setListingEmails] = useState<ListingEmail[]>([])
  const [userEmails, setUserEmails] = useState<UserEmail[]>([])
  const [loadingEmails, setLoadingEmails] = useState(true)
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set())
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

  // Fetch emails on load
  useEffect(() => {
    async function fetchEmails() {
      setLoadingEmails(true)
      try {
        // Fetch listing emails
        const listingsRes = await fetch('/api/admin/emails/listings')
        if (listingsRes.ok) {
          const listingsData = await listingsRes.json()
          setListingEmails(listingsData.listings || [])
        }

        // Fetch user emails
        const usersRes = await fetch('/api/admin/users')
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUserEmails(usersData.users || [])
        }
      } catch (err) {
        console.error('Failed to fetch emails:', err)
      } finally {
        setLoadingEmails(false)
      }
    }
    fetchEmails()
  }, [])

  const toggleListingEmail = (email: string) => {
    const newSelected = new Set(selectedListings)
    if (newSelected.has(email)) {
      newSelected.delete(email)
    } else {
      newSelected.add(email)
    }
    setSelectedListings(newSelected)
    updateRecipients(newSelected, selectedUsers)
  }

  const toggleUserEmail = (email: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(email)) {
      newSelected.delete(email)
    } else {
      newSelected.add(email)
    }
    setSelectedUsers(newSelected)
    updateRecipients(selectedListings, newSelected)
  }

  const selectAllListings = () => {
    const allEmails = new Set(listingEmails.map(l => l.email))
    setSelectedListings(allEmails)
    updateRecipients(allEmails, selectedUsers)
  }

  const selectAllUsers = () => {
    const allEmails = new Set(userEmails.map(u => u.email))
    setSelectedUsers(allEmails)
    updateRecipients(selectedListings, allEmails)
  }

  const clearAllListings = () => {
    setSelectedListings(new Set())
    updateRecipients(new Set(), selectedUsers)
  }

  const clearAllUsers = () => {
    setSelectedUsers(new Set())
    updateRecipients(selectedListings, new Set())
  }

  const updateRecipients = (listings: Set<string>, users: Set<string>) => {
    const allEmails = [...Array.from(listings), ...Array.from(users)]
    setRecipient(allEmails.join(', '))
    if (allEmails.length > 1) {
      setEmailType('bulk')
    }
  }

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
      setSelectedListings(new Set())
      setSelectedUsers(new Set())
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message })
    } finally {
      setSending(false)
    }
  }

  // Email templates
  const templates = [
    {
      id: 'archer_welcome',
      name: 'Welcome New Archer (General User)',
      subject: 'Welcome to the community, [Name] 🎯',
      message: `Hi [Name],

You're in. Welcome to Archery Ranges Canada.

We're building the most complete directory of archery ranges, clubs, and coaches across the country — so you can spend less time searching and more time shooting.

A few things you can do:

Browse ranges near you, check out what programs are offered, and save your favourites. If you find a range that's missing or has outdated info, let us know — we're making this better every week.

[Find Ranges Near You →]

Happy shooting,

Josh
Founder, Archery Ranges Canada

P.S. Got a home range you love? Tell them about us. The more facilities listed, the better this gets for everyone.`,
    },
    {
      id: 'business_welcome',
      name: 'Welcome New User (Business)',
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
      id: 'subscription_reminder',
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
      id: 'listing_approved',
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

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return

    let finalMessage = template.message
    let finalSubject = template.subject

    // Auto-fill [Name] if exactly one user is selected
    if (selectedUsers.size === 1) {
      const userEmail = Array.from(selectedUsers)[0]
      const user = userEmails.find(u => u.email === userEmail)
      if (user?.full_name) {
        finalMessage = finalMessage.replace(/\[Name\]/g, user.full_name)
        finalSubject = finalSubject.replace(/\[Name\]/g, user.full_name)
      }
    } else if (selectedListings.size === 1) {
      const listingEmail = Array.from(selectedListings)[0]
      const listing = listingEmails.find(l => l.email === listingEmail)
      if (listing?.name) {
        finalMessage = finalMessage.replace(/\[Name\]/g, listing.name)
        finalSubject = finalSubject.replace(/\[Name\]/g, listing.name)
      }
    }

    setSubject(finalSubject)
    setMessage(finalMessage)
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Compose Email
            </h2>

            {/* Template Dropdown */}
            <div className="w-64">
              <select
                onChange={(e) => applyTemplate(e.target.value)}
                defaultValue=""
                className="w-full px-3 py-2 bg-stone-50 border-2 border-stone-200 rounded-xl focus:border-emerald-500 outline-none text-stone-900 text-sm font-bold"
              >
                <option value="" disabled>Select a template...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email Type Toggle */}
          <div className="flex gap-2 p-1 bg-stone-100 rounded-xl mb-6">
            <button
              onClick={() => setEmailType('single')}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${emailType === 'single' ? 'bg-white shadow text-stone-900' : 'text-stone-500'
                }`}
            >
              <Mail className="w-4 h-4" />
              Single Email
            </button>
            <button
              onClick={() => setEmailType('bulk')}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${emailType === 'bulk' ? 'bg-white shadow text-stone-900' : 'text-stone-500'
                }`}
            >
              <Users className="w-4 h-4" />
              Bulk Email
            </button>
          </div>

          {/* Status Message */}
          {status && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success'
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
              {(selectedListings.size > 0 || selectedUsers.size > 0) && (
                <p className="text-sm text-emerald-600 mt-1">
                  {selectedListings.size} listing(s) + {selectedUsers.size} user(s) selected
                </p>
              )}
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Listing Emails */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Listing Emails
              </h2>
              <span className="text-sm text-stone-500">{listingEmails.length}</span>
            </div>

            {loadingEmails ? (
              <p className="text-sm text-stone-400">Loading...</p>
            ) : listingEmails.length === 0 ? (
              <p className="text-sm text-stone-400">No listing emails found</p>
            ) : (
              <>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={selectAllListings}
                    className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearAllListings}
                    className="text-xs px-3 py-1 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200"
                  >
                    Clear
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {listingEmails.map((listing, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleListingEmail(listing.email)}
                      className={`w-full text-left p-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${selectedListings.has(listing.email)
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                        }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedListings.has(listing.email)
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-stone-300'
                        }`}>
                        {selectedListings.has(listing.email) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="truncate">
                        <div className="font-medium truncate">{listing.name}</div>
                        <div className="text-xs text-stone-500 truncate">{listing.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* User Emails */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                User Emails
              </h2>
              <span className="text-sm text-stone-500">{userEmails.length}</span>
            </div>

            {loadingEmails ? (
              <p className="text-sm text-stone-400">Loading...</p>
            ) : userEmails.length === 0 ? (
              <p className="text-sm text-stone-400">No registered users found</p>
            ) : (
              <>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={selectAllUsers}
                    className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearAllUsers}
                    className="text-xs px-3 py-1 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200"
                  >
                    Clear
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {userEmails.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => toggleUserEmail(user.email)}
                      className={`w-full text-left p-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${selectedUsers.has(user.email)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                        }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedUsers.has(user.email)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-stone-300'
                        }`}>
                        {selectedUsers.has(user.email) && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="truncate">
                        <div className="font-medium truncate">
                          {user.full_name || 'Unknown User'}
                        </div>
                        <div className="text-xs text-stone-500 truncate">{user.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
