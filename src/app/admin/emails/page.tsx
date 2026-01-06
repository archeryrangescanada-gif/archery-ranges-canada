'use client'

import { useState, useEffect } from 'react'
import { Mail, Send, Users, Loader2, CheckCircle, AlertCircle, Search } from 'lucide-react'

interface Business {
  id: string
  rangeId: string
  rangeName: string
  city: string
  province: string
  email: string
  businessName: string
  ownerId: string
}

export default function AdminEmailsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([])
  const [selectedBusinesses, setSelectedBusinesses] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [emailType, setEmailType] = useState<'single' | 'bulk'>('bulk')
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    actionLink: '',
    actionText: '',
  })

  useEffect(() => {
    fetchBusinesses()
  }, [])

  useEffect(() => {
    // Filter businesses based on search term
    if (searchTerm.trim() === '') {
      setFilteredBusinesses(businesses)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = businesses.filter(
        (b) =>
          b.rangeName.toLowerCase().includes(term) ||
          b.businessName.toLowerCase().includes(term) ||
          b.email.toLowerCase().includes(term) ||
          b.city?.toLowerCase().includes(term) ||
          b.province?.toLowerCase().includes(term)
      )
      setFilteredBusinesses(filtered)
    }
  }, [searchTerm, businesses])

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/admin/emails/businesses')
      if (response.ok) {
        const data = await response.json()
        setBusinesses(data.businesses || [])
        setFilteredBusinesses(data.businesses || [])
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleBusinessSelection = (businessId: string) => {
    const newSelection = new Set(selectedBusinesses)
    if (newSelection.has(businessId)) {
      newSelection.delete(businessId)
    } else {
      newSelection.add(businessId)
    }
    setSelectedBusinesses(newSelection)
  }

  const selectAll = () => {
    setSelectedBusinesses(new Set(filteredBusinesses.map((b) => b.id)))
  }

  const deselectAll = () => {
    setSelectedBusinesses(new Set())
  }

  const handleSendEmail = async () => {
    if (!emailData.subject || !emailData.message) {
      setErrorMessage('Please fill in subject and message')
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
      return
    }

    if (selectedBusinesses.size === 0) {
      setErrorMessage('Please select at least one business')
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
      return
    }

    setSending(true)
    setShowError(false)
    setShowSuccess(false)

    try {
      const selectedBizList = businesses.filter((b) => selectedBusinesses.has(b.id))
      const recipients = selectedBizList.map((b) => ({
        email: b.email,
        businessName: b.businessName,
      }))

      const response = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: emailType,
          recipients,
          subject: emailData.subject,
          message: emailData.message,
          actionLink: emailData.actionLink || undefined,
          actionText: emailData.actionText || undefined,
        }),
      })

      if (response.ok) {
        setShowSuccess(true)
        // Reset form
        setEmailData({
          subject: '',
          message: '',
          actionLink: '',
          actionText: '',
        })
        setSelectedBusinesses(new Set())
        setTimeout(() => setShowSuccess(false), 5000)
      } else {
        const error = await response.json()
        setErrorMessage(error.error || 'Failed to send email')
        setShowError(true)
        setTimeout(() => setShowError(false), 5000)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      setErrorMessage('Network error occurred')
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
        <p className="text-gray-600 mt-2">Send emails and notifications to businesses</p>
      </div>

      {/* Success/Error Messages */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-green-800 font-medium">Emails sent successfully!</p>
            <p className="text-green-700 text-sm">
              {selectedBusinesses.size} email(s) have been sent to businesses.
            </p>
          </div>
        </div>
      )}

      {showError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Failed to send emails</p>
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Email Composer */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-50 rounded-lg">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Compose Email</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter email subject"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your message (HTML supported)"
              />
              <p className="text-xs text-gray-500 mt-1">HTML tags are supported</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Button Text (Optional)
              </label>
              <input
                type="text"
                value={emailData.actionText}
                onChange={(e) => setEmailData({ ...emailData, actionText: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., View Dashboard"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Link (Optional)
              </label>
              <input
                type="url"
                value={emailData.actionLink}
                onChange={(e) => setEmailData({ ...emailData, actionLink: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={handleSendEmail}
                disabled={sending || selectedBusinesses.size === 0}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send to {selectedBusinesses.size} Business{selectedBusinesses.size !== 1 ? 'es' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Business Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Recipients ({selectedBusinesses.size})
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={deselectAll}
                className="text-sm text-gray-600 hover:text-gray-700 font-medium"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search businesses..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Business List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredBusinesses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No businesses found</p>
            ) : (
              filteredBusinesses.map((business) => (
                <label
                  key={business.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={selectedBusinesses.has(business.id)}
                    onChange={() => toggleBusinessSelection(business.id)}
                    className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {business.rangeName}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{business.businessName}</p>
                    <p className="text-xs text-gray-500 truncate">{business.email}</p>
                    {business.city && business.province && (
                      <p className="text-xs text-gray-400">
                        {business.city}, {business.province}
                      </p>
                    )}
                  </div>
                </label>
              ))
            )}
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              <strong>{businesses.length}</strong> total businesses
              {searchTerm && (
                <> • <strong>{filteredBusinesses.length}</strong> matching search</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Email Templates Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => setEmailData({
              ...emailData,
              subject: 'Important Update from Archery Ranges Canada',
              message: '<p>Hello <strong>{{businessName}}</strong>,</p><p>We wanted to inform you about an important update to our platform...</p>',
            })}
            className="text-left p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <p className="font-medium text-gray-900">Platform Update</p>
            <p className="text-sm text-gray-600 mt-1">Inform about platform changes</p>
          </button>

          <button
            onClick={() => setEmailData({
              ...emailData,
              subject: 'New Feature: Enhanced Analytics',
              message: '<p>Hello <strong>{{businessName}}</strong>,</p><p>We\'re excited to announce a new feature that will help you better understand your customers...</p>',
              actionText: 'Explore Now',
              actionLink: process.env.NEXT_PUBLIC_APP_URL + '/dashboard',
            })}
            className="text-left p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <p className="font-medium text-gray-900">Feature Announcement</p>
            <p className="text-sm text-gray-600 mt-1">Announce new features</p>
          </button>

          <button
            onClick={() => setEmailData({
              ...emailData,
              subject: 'Thank You for Being Part of Our Community',
              message: '<p>Hello <strong>{{businessName}}</strong>,</p><p>We wanted to take a moment to thank you for being a valued member of Archery Ranges Canada...</p>',
            })}
            className="text-left p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <p className="font-medium text-gray-900">Thank You Note</p>
            <p className="text-sm text-gray-600 mt-1">Send appreciation message</p>
          </button>
        </div>
      </div>
    </div>
  )
}
