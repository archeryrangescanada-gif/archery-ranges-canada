'use client'

import { useState } from 'react'
import { supabaseClient } from '@/lib/auth'

interface ReportRangeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ReportRangeModal({ isOpen, onClose }: ReportRangeModalProps) {
  const [formData, setFormData] = useState({
    range_name: '',
    address: '',
    email: '',
    phone: '',
    website: '',
    socials: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await supabaseClient
        .from('range_submissions')
        .insert([{
          range_name: formData.range_name || null,
          address: formData.address || null,
          email: formData.email || null,
          phone: formData.phone || null,
          website: formData.website || null,
          socials: formData.socials || null,
          status: 'pending',
          submitted_at: new Date().toISOString()
        }])

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        setFormData({
          range_name: '',
          address: '',
          email: '',
          phone: '',
          website: '',
          socials: ''
        })
        setSuccess(false)
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Report Missing Range</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="text-green-500 text-6xl mb-4">✓</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Thank You!</h3>
              <p className="text-gray-600">Your submission has been received. We'll review it soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="text-gray-600 mb-6">
                Help us improve our directory by sharing information about a missing archery range.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Range Name
                  </label>
                  <input
                    type="text"
                    value={formData.range_name}
                    onChange={(e) => setFormData({ ...formData, range_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    placeholder="e.g., Toronto Archery Club"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    placeholder="Full address including city, province"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    placeholder="contact@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    placeholder="example.com or https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Social Media
                  </label>
                  <input
                    type="text"
                    value={formData.socials}
                    onChange={(e) => setFormData({ ...formData, socials: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    placeholder="Facebook, Instagram, etc."
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}