'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/admin/submissions')
      const json = await res.json()

      if (!res.ok) {
        console.error('[Submissions] API error:', json.error)
        return
      }

      setSubmissions(json.submissions || [])
    } catch (err) {
      console.error('[Submissions] Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })

      if (!res.ok) {
        const json = await res.json()
        console.error('[Submissions] Update error:', json.error)
      }

      fetchSubmissions()
    } catch (err) {
      console.error('[Submissions] Update error:', err)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Range Submissions</h1>
        <Link href="/admin/dashboard" className="text-green-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : submissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No submissions found.</p>
            <p className="text-sm text-gray-400 mt-2">Check the browser console for any errors.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Range Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-6 py-4 text-gray-900">{sub.range_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-700">{sub.address || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        {sub.email && <div>{sub.email}</div>}
                        {sub.phone && <div>{sub.phone}</div>}
                        {sub.website && <div><a href={sub.website} target="_blank" className="text-blue-600">Website</a></div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={'px-2 py-1 rounded text-xs ' + (
                        sub.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        sub.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      )}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={sub.status}
                        onChange={(e) => updateStatus(sub.id, e.target.value)}
                        className="border rounded px-2 py-1 text-sm text-gray-800"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  )
}
