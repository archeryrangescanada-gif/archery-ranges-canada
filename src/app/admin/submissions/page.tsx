'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { supabaseClient } from '@/lib/auth'
import Link from 'next/link'

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      console.log('[Submissions] Fetching submissions...')
      const { data, error } = await supabaseClient
        .from('range_submissions')
        .select('*')
        .order('submitted_at', { ascending: false })

      if (error) {
        console.error('[Submissions] Error fetching:', error.message, error.details, error.hint)
        return
      }

      console.log('[Submissions] Fetched data:', data)
      setSubmissions(data || [])
    } catch (err) {
      console.error('[Submissions] Unexpected error:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    await supabaseClient
      .from('range_submissions')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', id)
    
    fetchSubmissions()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Range Submissions</h1>
          <Link href="/admin/dashboard" className="text-green-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <p>Loading...</p>
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
                    <td className="px-6 py-4">{sub.range_name || 'N/A'}</td>
                    <td className="px-6 py-4">{sub.address || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
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
                        className="border rounded px-2 py-1 text-sm"
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
    </div>
  )
}