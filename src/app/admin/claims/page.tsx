// src/app/admin/claims/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Eye, Clock, FileText } from 'lucide-react'

interface Claim {
  id: string
  listing_name: string
  claimant_name: string
  claimant_email: string
  claimant_phone: string
  position: string
  status: 'pending' | 'approved' | 'rejected'
  proof_document_url?: string
  business_license_url?: string
  verification_notes?: string
  created_at: string
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchClaims()
  }, [])

  const fetchClaims = async () => {
    // TODO: Fetch from Supabase
    setClaims([
      {
        id: '1',
        listing_name: 'Toronto Archery Range',
        claimant_name: 'John Smith',
        claimant_email: 'john@torontoarchery.com',
        claimant_phone: '416-555-1234',
        position: 'Owner',
        status: 'pending',
        proof_document_url: '/documents/proof1.pdf',
        business_license_url: '/documents/license1.pdf',
        verification_notes: 'I am the owner of this facility.',
        created_at: '2024-03-10T10:30:00Z'
      },
      {
        id: '2',
        listing_name: 'Vancouver Archery Club',
        claimant_name: 'Sarah Johnson',
        claimant_email: 'sarah@vancouverarchery.com',
        claimant_phone: '604-555-5678',
        position: 'Manager',
        status: 'pending',
        created_at: '2024-03-09T14:20:00Z'
      }
    ])
    setLoading(false)
  }

  const handleApproveClaim = async (claimId: string) => {
    if (!confirm('Are you sure you want to approve this claim?')) return

    // TODO: Update in Supabase
    // 1. Update claim status to 'approved'
    // 2. Update listing to mark as claimed
    // 3. Assign owner_id to the user
    // 4. Send approval email to claimant

    setClaims(claims.map(c =>
      c.id === claimId ? { ...c, status: 'approved' as const } : c
    ))

    alert('Claim approved successfully!')
  }

  const handleRejectClaim = async (claimId: string) => {
    setSelectedClaim(claims.find(c => c.id === claimId) || null)
    setShowModal(true)
  }

  const submitRejection = async () => {
    if (!selectedClaim || !rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    // TODO: Update in Supabase
    // 1. Update claim status to 'rejected'
    // 2. Save rejection reason
    // 3. Send rejection email to claimant

    setClaims(claims.map(c =>
      c.id === selectedClaim.id ? { ...c, status: 'rejected' as const } : c
    ))

    setShowModal(false)
    setRejectionReason('')
    setSelectedClaim(null)
    alert('Claim rejected')
  }

  const viewClaimDetails = (claim: Claim) => {
    setSelectedClaim(claim)
    setShowModal(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Approved
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Rejected
          </span>
        )
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Claims Management</h1>
        <p className="text-gray-600 mt-2">Review and approve business listing claims</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Claims</p>
              <p className="text-3xl font-bold text-yellow-600">
                {claims.filter(c => c.status === 'pending').length}
              </p>
            </div>
            <Clock className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-green-600">
                {claims.filter(c => c.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-3xl font-bold text-red-600">
                {claims.filter(c => c.status === 'rejected').length}
              </p>
            </div>
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Listing
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Claimant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {claims.map((claim) => (
              <tr key={claim.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {claim.listing_name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{claim.claimant_name}</div>
                  <div className="text-sm text-gray-500">{claim.claimant_email}</div>
                  <div className="text-sm text-gray-500">{claim.claimant_phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{claim.position}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(claim.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(claim.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {claim.status === 'pending' ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewClaimDetails(claim)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleApproveClaim(claim.id)}
                        className="text-green-600 hover:text-green-900 flex items-center"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectClaim(claim.id)}
                        className="text-red-600 hover:text-red-900 flex items-center"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => viewClaimDetails(claim)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Claim Details Modal */}
      {showModal && selectedClaim && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Claim Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Listing</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedClaim.listing_name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Claimant Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedClaim.claimant_name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedClaim.claimant_email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedClaim.claimant_phone || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedClaim.position}</p>
                </div>

                {selectedClaim.verification_notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Verification Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedClaim.verification_notes}</p>
                  </div>
                )}

                {selectedClaim.proof_document_url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Proof Document</label>
                    <a
                      href={selectedClaim.proof_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      View Document
                    </a>
                  </div>
                )}

                {selectedClaim.business_license_url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Business License</label>
                    <a
                      href={selectedClaim.business_license_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      View License
                    </a>
                  </div>
                )}

                {selectedClaim.status === 'pending' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 !text-black bg-white placeholder:text-gray-500"
                      style={{ color: 'black' }}
                      placeholder="Provide a reason for rejection..."
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setRejectionReason('')
                    setSelectedClaim(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedClaim.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleApproveClaim(selectedClaim.id)
                        setShowModal(false)
                        setSelectedClaim(null)
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve Claim
                    </button>
                    <button
                      onClick={submitRejection}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject Claim
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}