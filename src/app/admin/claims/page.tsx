'use client'

import { useEffect, useState } from 'react'
import { FileText, UserPlus, CreditCard, Search, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { VerificationRequest } from '@/types/database'

interface RangeBasic {
  id: string
  name: string
  owner_id: string | null
  is_claimed: boolean
  subscription_tier: string
}

interface UserBasic {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
}

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

  // Transfer Claim State
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [ranges, setRanges] = useState<RangeBasic[]>([])
  const [users, setUsers] = useState<UserBasic[]>([])
  const [selectedRangeId, setSelectedRangeId] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [rangeSearch, setRangeSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [transferring, setTransferring] = useState(false)

  // Manual Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentRangeId, setPaymentRangeId] = useState('')
  const [paymentPlan, setPaymentPlan] = useState<'silver' | 'gold' | 'platinum'>('silver')
  const [paymentEmail, setPaymentEmail] = useState('')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [paymentLink, setPaymentLink] = useState<string | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  useEffect(() => {
    if (selectedRequest && showModal) {
      fetchDocumentUrls()
    }
  }, [selectedRequest, showModal])

  // Fetch ranges and users when transfer modal opens
  useEffect(() => {
    if (showTransferModal) {
      fetchRangesAndUsers()
    }
  }, [showTransferModal])

  // Fetch ranges when payment modal opens
  useEffect(() => {
    if (showPaymentModal) {
      fetchRanges()
    }
  }, [showPaymentModal])

  const fetchRanges = async () => {
    const { data } = await supabase
      .from('ranges')
      .select('id, name, owner_id, is_claimed, subscription_tier')
      .order('name')
    setRanges(data || [])
  }

  const fetchRangesAndUsers = async () => {
    // Fetch ranges
    const { data: rangesData } = await supabase
      .from('ranges')
      .select('id, name, owner_id, is_claimed, subscription_tier')
      .order('name')
    setRanges(rangesData || [])

    // Fetch users from profiles
    const { data: usersData } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name')
      .order('email')
    setUsers(usersData || [])
  }

  const fetchDocumentUrls = async () => {
    if (!selectedRequest) return

    try {
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
      const { error: reqError } = await supabase
        .from('verification_requests')
        .update({ status: 'approved' })
        .eq('id', request.id)

      if (reqError) throw reqError

      const { error: rangeError } = await supabase
        .from('ranges')
        .update({
          owner_id: request.user_id,
          is_claimed: true
        })
        .eq('id', request.range_id)

      if (rangeError) throw rangeError

      try {
        await fetch('/api/admin/emails/verification-approved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId: request.id }),
        })
      } catch (emailErr) {
        console.error('Failed to send approval email:', emailErr)
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

  // Transfer claim to a user
  const handleTransferClaim = async () => {
    if (!selectedRangeId || !selectedUserId) {
      alert('Please select both a range and a user.')
      return
    }

    setTransferring(true)
    try {
      const { error } = await supabase
        .from('ranges')
        .update({
          owner_id: selectedUserId,
          is_claimed: true
        })
        .eq('id', selectedRangeId)

      if (error) throw error

      alert('Claim transferred successfully!')
      setShowTransferModal(false)
      setSelectedRangeId('')
      setSelectedUserId('')
      setRangeSearch('')
      setUserSearch('')
      fetchRequests()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setTransferring(false)
    }
  }

  // Generate payment link for a range
  const handleGeneratePaymentLink = async () => {
    if (!paymentRangeId || !paymentEmail) {
      alert('Please select a range and enter the customer email.')
      return
    }

    setProcessingPayment(true)
    setPaymentLink(null)
    try {
      const response = await fetch('/api/admin/stripe/create-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rangeId: paymentRangeId,
          planId: paymentPlan,
          customerEmail: paymentEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment link')
      }

      setPaymentLink(data.url)
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setProcessingPayment(false)
    }
  }

  // Apply subscription directly (without payment - for manual processing)
  const handleApplySubscription = async () => {
    if (!paymentRangeId) {
      alert('Please select a range.')
      return
    }

    if (!confirm('This will apply the subscription directly without processing a Stripe payment. Use this only if payment was collected separately (phone, etc.). Continue?')) {
      return
    }

    setProcessingPayment(true)
    try {
      const PLAN_TO_TIER: Record<string, string> = {
        silver: 'basic',
        gold: 'pro',
        platinum: 'premium',
      }

      const { error } = await supabase
        .from('ranges')
        .update({
          subscription_tier: PLAN_TO_TIER[paymentPlan],
          subscription_status: 'active',
          subscription_updated_at: new Date().toISOString(),
          is_featured: true,
        })
        .eq('id', paymentRangeId)

      if (error) throw error

      alert(`Subscription applied! Range upgraded to ${paymentPlan} tier.`)
      setShowPaymentModal(false)
      setPaymentRangeId('')
      setPaymentEmail('')
      setPaymentLink(null)
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setProcessingPayment(false)
    }
  }

  // Filter ranges and users by search
  const filteredRanges = ranges.filter(r =>
    r.name.toLowerCase().includes(rangeSearch.toLowerCase())
  )

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.first_name && u.first_name.toLowerCase().includes(userSearch.toLowerCase())) ||
    (u.last_name && u.last_name.toLowerCase().includes(userSearch.toLowerCase()))
  )

  const filteredPaymentRanges = ranges.filter(r =>
    r.name.toLowerCase().includes(rangeSearch.toLowerCase())
  )

  if (loading) return <div className="p-12 text-center text-stone-500">Loading claims...</div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-black text-stone-900">Verification Requests</h1>
          <p className="text-stone-500 mt-2 text-lg">Review and process business ownership claims</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Transfer Claim
          </button>
          <button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            Process Payment
          </button>
        </div>
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

      {/* Review Claim Modal */}
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

      {/* Transfer Claim Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black text-stone-900">Transfer Claim</h2>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-stone-500" />
              </button>
            </div>

            <p className="text-stone-600 mb-6">
              Transfer ownership of a range to a user. Use this when a business owner calls to claim their listing.
            </p>

            <div className="space-y-6">
              {/* Select Range */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Select Range</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="text"
                    value={rangeSearch}
                    onChange={(e) => setRangeSearch(e.target.value)}
                    placeholder="Search ranges..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-stone-200 rounded-xl focus:border-emerald-500 outline-none text-stone-900"
                  />
                </div>
                <div className="mt-2 max-h-40 overflow-y-auto border-2 border-stone-100 rounded-xl">
                  {filteredRanges.slice(0, 50).map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setSelectedRangeId(range.id)}
                      className={`w-full px-4 py-3 text-left hover:bg-stone-50 transition-colors ${selectedRangeId === range.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''
                        }`}
                    >
                      <div className="font-medium text-stone-900">{range.name}</div>
                      <div className="text-sm text-stone-500">
                        {range.is_claimed ? 'Currently claimed' : 'Not claimed'} | Tier: {range.subscription_tier}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select User */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Select User (New Owner)</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users by email or name..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-stone-200 rounded-xl focus:border-emerald-500 outline-none text-stone-900"
                  />
                </div>
                <div className="mt-2 max-h-40 overflow-y-auto border-2 border-stone-100 rounded-xl">
                  {filteredUsers.slice(0, 50).map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`w-full px-4 py-3 text-left hover:bg-stone-50 transition-colors ${selectedUserId === user.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''
                        }`}
                    >
                      <div className="font-medium text-stone-900">{user.email}</div>
                      <div className="text-sm text-stone-500">
                        {user.first_name} {user.last_name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setShowTransferModal(false)}
                className="flex-1 py-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferClaim}
                disabled={transferring || !selectedRangeId || !selectedUserId}
                className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white font-black rounded-2xl transition-all disabled:opacity-50"
              >
                {transferring ? 'Transferring...' : 'Transfer Claim'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Process Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black text-stone-900">Process Payment</h2>
              <button
                onClick={() => { setShowPaymentModal(false); setPaymentLink(null); }}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-stone-500" />
              </button>
            </div>

            <p className="text-stone-600 mb-6">
              Generate a payment link to send to the customer, or apply a subscription directly after collecting payment by phone.
            </p>

            <div className="space-y-6">
              {/* Select Range */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Select Range</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="text"
                    value={rangeSearch}
                    onChange={(e) => setRangeSearch(e.target.value)}
                    placeholder="Search ranges..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-stone-200 rounded-xl focus:border-emerald-500 outline-none text-stone-900"
                  />
                </div>
                <div className="mt-2 max-h-40 overflow-y-auto border-2 border-stone-100 rounded-xl">
                  {filteredPaymentRanges.slice(0, 50).map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setPaymentRangeId(range.id)}
                      className={`w-full px-4 py-3 text-left hover:bg-stone-50 transition-colors ${paymentRangeId === range.id ? 'bg-emerald-50 border-l-4 border-emerald-500' : ''
                        }`}
                    >
                      <div className="font-medium text-stone-900">{range.name}</div>
                      <div className="text-sm text-stone-500">Current tier: {range.subscription_tier}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Plan */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Select Plan</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['silver', 'gold', 'platinum'] as const).map((plan) => (
                    <button
                      key={plan}
                      onClick={() => setPaymentPlan(plan)}
                      className={`p-4 rounded-xl border-2 transition-all ${paymentPlan === plan
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-stone-200 hover:border-stone-300'
                        }`}
                    >
                      <div className="font-black text-stone-900 capitalize">{plan}</div>
                      <div className="text-sm text-stone-500">
                        {plan === 'silver' ? '$29/mo' : plan === 'gold' ? '$59/mo' : '$99/mo'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Email */}
              <div>
                <label className="block text-sm font-bold text-stone-700 mb-2">Customer Email</label>
                <input
                  type="email"
                  value={paymentEmail}
                  onChange={(e) => setPaymentEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-emerald-500 outline-none text-stone-900"
                />
              </div>

              {/* Payment Link Result */}
              {paymentLink && (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                  <label className="block text-sm font-bold text-emerald-700 mb-2">Payment Link Generated!</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={paymentLink}
                      readOnly
                      className="flex-1 px-4 py-2 bg-white border border-emerald-300 rounded-lg text-sm text-stone-900"
                    />
                    <button
                      onClick={() => { navigator.clipboard.writeText(paymentLink); alert('Link copied!'); }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-sm text-emerald-600 mt-2">Send this link to the customer to complete payment.</p>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => { setShowPaymentModal(false); setPaymentLink(null); }}
                className="flex-1 py-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleGeneratePaymentLink}
                disabled={processingPayment || !paymentRangeId || !paymentEmail}
                className="flex-1 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl transition-all disabled:opacity-50"
              >
                {processingPayment ? 'Generating...' : 'Generate Payment Link'}
              </button>
              <button
                onClick={handleApplySubscription}
                disabled={processingPayment || !paymentRangeId}
                className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl transition-all disabled:opacity-50"
              >
                Apply Directly
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
