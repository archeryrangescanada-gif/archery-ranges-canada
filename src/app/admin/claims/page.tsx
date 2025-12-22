'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Eye, Clock, FileText, Camera, Phone, Facebook } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface VerificationRequest {
  id: string
  range_id: string
  user_id: string
  method: 'social' | 'photo' | 'call'
  proof_image_url?: string
  verification_code?: string
  status: 'pending' | 'approved' | 'denied'
  rejection_reason?: string
  created_at: string
  range?: {
    name: string
  }
  user?: {
    email: string
  }
}

export default function ClaimsPage() {
  const supabase = createClient()
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

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
      setRequests(data as any || [])
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

      alert('Claim approved successfully!')
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
          status: 'denied',
          rejection_reason: rejectionReason
        })
        .eq('id', selectedRequest.id)

      if (error) throw error

      alert('Claim denied.')
      fetchRequests()
      setShowModal(false)
      setRejectionReason('')
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'photo': return <Camera className="w-5 h-5 text-emerald-500" />
      case 'social': return <Facebook className="w-5 h-5 text-blue-500" />
      case 'call': return <Phone className="w-5 h-5 text-amber-500" />
      default: return null
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
          <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">Denied</p>
          <p className="text-4xl font-black text-red-600 mt-1">{requests.filter(r => r.status === 'denied').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-bold text-stone-600">Range Name</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-stone-600">Method</th>
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
                  <div className="flex items-center gap-2">
                    {getMethodIcon(request.method)}
                    <span className="capitalize text-stone-700">{request.method}</span>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight ${request.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      request.status === 'denied' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                    }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-6 text-sm text-stone-500">{new Date(request.created_at).toLocaleDateString()}</td>
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
                  <label className="block text-xs font-black text-stone-400 uppercase mb-1">Method</label>
                  <p className="text-xl font-bold text-stone-900 capitalize">{selectedRequest.method}</p>
                </div>
              </div>

              {selectedRequest.method === 'photo' && selectedRequest.proof_image_url && (
                <div>
                  <label className="block text-xs font-black text-stone-400 uppercase mb-2">Proof Image</label>
                  <div className="rounded-2xl border-4 border-stone-100 overflow-hidden bg-stone-50 aspect-video flex items-center justify-center">
                    <img
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/verification-proofs/${selectedRequest.proof_image_url}`}
                      className="max-h-full object-contain"
                      alt="Proof"
                    />
                  </div>
                </div>
              )}

              {selectedRequest.method === 'social' && (
                <div className="p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl">
                  <label className="block text-xs font-black text-blue-400 uppercase mb-1">Verification Code Sent</label>
                  <p className="text-3xl font-mono font-black text-blue-900">{selectedRequest.verification_code || 'N/A'}</p>
                </div>
              )}

              {selectedRequest.method === 'call' && (
                <div className="p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl">
                  <p className="text-lg font-bold text-amber-900">User is waiting for a phone call to verify ownership.</p>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="pt-6 border-t border-stone-100">
                  <label className="block text-sm font-bold text-stone-700 mb-3">Rejection Reason (only for Denial)</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-4 border-2 border-stone-100 rounded-2xl focus:border-emerald-500 focus:ring-0 outline-none transition-all"
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