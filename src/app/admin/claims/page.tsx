'use client'

import { useEffect, useState } from 'react'
import { FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { VerificationRequest } from '@/types/database'

export default function ClaimsPage() {
  const supabase = createClient()
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const [licenseUrl, setLicenseUrl] = useState<string | null>(null)
  const [insuranceUrl, setInsuranceUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  useEffect(() => {
    if (selectedRequest && showModal) {
      fetchDocumentUrls()
    }
  }, [selectedRequest, showModal])

  const fetchDocumentUrls = async () => {
    if (!selectedRequest) return

    try {
      // Generate signed URLs for the documents (valid for 1 hour)
      const { data: licenseData } = await supabase.storage
        .from('verification-documents')
        .createSignedUrl(selectedRequest.business_license_url, 3600)

      const { data: insuranceData } = await supabase.storage
        .from('verification-documents')
        .createSignedUrl(selectedRequest.insurance_certificate_url, 3600)

      setLicenseUrl(licenseData?.signedUrl || null)
      setInsuranceUrl(insuranceData?.signedUrl || null)
    } catch (err) {
      console.error('Error fetching document URLs:', err)
    }
  }

  const fetchRequests = async () => {
    setLoading(true)
    try {
      // In a real app, we'd use a join or handle the user data properly. 
      // For now, we fetch requests and try to get range names.
      const { data, error } = await supabase
        .from('verification_requests')
        .select(`
          *,
          range:ranges(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRequests((data as VerificationRequest[]) || [])
    } catch (err) {
      console.error('Error fetching requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (request: VerificationRequest) => {
    if (!confirm('Are you sure you want to approve this claim? This will set the owner and mark the range as claimed.')) return

    setProcessing(true)
    try {
      // 1. Update request status
      const { error: reqError } = await supabase
        .from('verification_requests')
        .update({ status: 'approved' })
        .eq('id', request.id)

      if (reqError) throw reqError

      // 2. Update range owner
      const { error: rangeError } = await supabase
        .from('ranges')
        .update({
          owner_id: request.user_id,
          is_claimed: true
        })
        .eq('id', request.range_id)

      if (rangeError) throw rangeError

      // 3. Send approval email
      try {
        await fetch('/api/admin/emails/verification-approved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: request.id,
          }),
        })
      } catch (emailErr) {
        console.error('Failed to send approval email:', emailErr)
        // Don't fail the approval if email fails
      }

      alert('Claim approved successfully! Confirmation email sent.')
      fetchRequests()
      setShowModal(false)
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  const handleDeny = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      alert('Please provide a reason for denial.')
      return
    }

    setProcessing(true)
    try {
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason
        })
        .eq('id', selectedRequest.id)

      if (error) throw error

      // Send rejection email
      try {
        await fetch('/api/admin/emails/verification-rejected', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestId: selectedRequest.id,
            reason: rejectionReason,
          }),
        })
      } catch (emailErr) {
        console.error('Failed to send rejection email:', emailErr)
        // Don't fail the rejection if email fails
      }

      alert('Claim denied. Notification email sent.')
      fetchRequests()
      setShowModal(false)
      setRejectionReason('')
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="p-12 text-center text-stone-500">Loading claims...</div>

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-stone-900">Verification Requests</h1>
        <p className="text-stone-500 mt-2 text-lg">Review and process business ownership claims</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Pending</p>
          <p className="text-4xl font-black text-amber-600 mt-1">{requests.filter(r => r.status === 'pending').length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Approved</p>
          <p className="text-4xl font-black text-emerald-600 mt-1">{requests.filter(r => r.status === 'approved').length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Rejected</p>
          <p className="text-4xl font-black text-red-600 mt-1">{requests.filter(r => r.status === 'rejected').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-stone-600">Range Name</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-stone-600">Applicant</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-stone-600">Status</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-stone-600">Submitted</th>
              <th className="px-6 py-4 text-right text-sm font-bold text-stone-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-6 py-6 font-bold text-stone-800">{request.range?.name || 'Unknown Range'}</td>
                <td className="px-6 py-6">
                  <div className="text-stone-700">
                    {request.first_name} {request.last_name}
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight ${request.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                    }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-6 text-sm text-stone-500">{new Date(request.submitted_at).toLocaleDateString()}</td>
                <td className="px-6 py-6 text-right">
                  <button
                    onClick={() => { setSelectedRequest(request); setShowModal(true); }}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-black text-stone-900 mb-6">Review Claim</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-stone-400 uppercase mb-1">Range</label>
                  <p className="text-xl font-bold text-stone-900">{selectedRequest.range?.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-400 uppercase mb-1">Applicant</label>
                  <p className="text-xl font-bold text-stone-900">{selectedRequest.first_name} {selectedRequest.last_name}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-stone-400 uppercase mb-1">GST Number</label>
                <p className="text-lg font-mono font-bold text-stone-900">{selectedRequest.gst_number}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-stone-400 uppercase mb-2">Business License</label>
                  {licenseUrl ? (
                    <a
                      href={licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-bold rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <FileText className="w-5 h-5" />
                      View Document
                    </a>
                  ) : (
                    <p className="text-sm text-stone-500">Loading...</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-black text-stone-400 uppercase mb-2">Insurance Certificate</label>
                  {insuranceUrl ? (
                    <a
                      href={insuranceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-200 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <FileText className="w-5 h-5" />
                      View Document
                    </a>
                  ) : (
                    <p className="text-sm text-stone-500">Loading...</p>
                  )}
                </div>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="pt-6 border-t border-stone-100">
                  <label className="block text-sm font-bold text-stone-700 mb-3">Rejection Reason (only for Denial)</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-4 border-2 border-stone-100 rounded-2xl focus:border-emerald-500 focus:ring-0 outline-none transition-all text-stone-900"
                    placeholder="Tell the user why you're denying their claim..."
                    rows={3}
                  />
                </div>
              )}
            </div>

            <div className="mt-10 flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl transition-all"
              >
                Close
              </button>

              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleDeny()}
                    disabled={processing}
                    className="flex-1 py-4 bg-red-100 hover:bg-red-200 text-red-700 font-black rounded-2xl transition-all disabled:opacity-50"
                  >
                    DENY CLAIM
                  </button>
                  <button
                    onClick={() => handleApprove(selectedRequest)}
                    disabled={processing}
                    className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
                  >
                    ACCEPT CLAIM
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}