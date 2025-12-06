// src/app/admin/ads/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Eye, Play, Pause, BarChart2 } from 'lucide-react'
import Link from 'next/link'

interface Ad {
  id: string
  title: string
  advertiser_name: string
  ad_type: 'image' | 'html' | 'video'
  status: 'draft' | 'active' | 'paused' | 'expired' | 'completed'
  start_date?: string
  end_date?: string
  impressions_count: number
  clicks_count: number
  impression_limit?: number
  click_limit?: number
  placements: string[]
  created_at: string
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchAds()
  }, [statusFilter])

  const fetchAds = async () => {
    // TODO: Fetch from Supabase
    setAds([
      {
        id: '1',
        title: 'Hoyt Archery - Spring Sale',
        advertiser_name: 'Hoyt Archery',
        ad_type: 'image',
        status: 'active',
        start_date: '2024-03-01',
        end_date: '2024-04-30',
        impressions_count: 15234,
        clicks_count: 432,
        impression_limit: 50000,
        placements: ['homepage_header', 'province_page_header'],
        created_at: '2024-02-28'
      },
      {
        id: '2',
        title: 'Mathews Bows - New V3X',
        advertiser_name: 'Mathews',
        ad_type: 'image',
        status: 'active',
        start_date: '2024-03-10',
        impressions_count: 8945,
        clicks_count: 234,
        placements: ['sidebar_top'],
        created_at: '2024-03-09'
      },
      {
        id: '3',
        title: 'PSE Archery Banner',
        advertiser_name: 'PSE Archery',
        ad_type: 'image',
        status: 'paused',
        impressions_count: 12450,
        clicks_count: 189,
        placements: ['listing_page_banner'],
        created_at: '2024-02-15'
      }
    ])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return
    // TODO: Delete from Supabase
    setAds(ads.filter(a => a.id !== id))
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    // TODO: Update in Supabase
    setAds(ads.map(a => 
      a.id === id ? { ...a, status: newStatus as any } : a
    ))
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  const calculateCTR = (impressions: number, clicks: number) => {
    if (impressions === 0) return '0.00'
    return ((clicks / impressions) * 100).toFixed(2)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ads Management</h1>
          <p className="text-gray-600 mt-2">Manage advertising campaigns and placements</p>
        </div>
        <Link
          href="/admin/ads/new"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Ad
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Ads</p>
          <p className="text-3xl font-bold text-gray-900">{ads.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Active Ads</p>
          <p className="text-3xl font-bold text-green-600">
            {ads.filter(a => a.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Impressions</p>
          <p className="text-3xl font-bold text-blue-600">
            {ads.reduce((sum, ad) => sum + ad.impressions_count, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Clicks</p>
          <p className="text-3xl font-bold text-purple-600">
            {ads.reduce((sum, ad) => sum + ad.clicks_count, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <Link
              href="/admin/ads/placements"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              Manage Placements
            </Link>
            <Link
              href="/admin/ads/analytics"
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <BarChart2 className="w-4 h-4 mr-1" />
              View Analytics
            </Link>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
            <option value="expired">Expired</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Ads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ad Campaign
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ads.map((ad) => (
              <tr key={ad.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                  <div className="text-sm text-gray-500">{ad.advertiser_name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Placements: {ad.placements.length}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(ad.status)}`}>
                    {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {ad.ad_type.toUpperCase()}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1 text-gray-400" />
                      {ad.impressions_count.toLocaleString()}
                      {ad.impression_limit && (
                        <span className="text-xs text-gray-500 ml-1">
                          / {ad.impression_limit.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500">
                        👆 {ad.clicks_count} clicks • CTR: {calculateCTR(ad.impressions_count, ad.clicks_count)}%
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    {ad.start_date ? new Date(ad.start_date).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="text-xs">
                    {ad.end_date ? `to ${new Date(ad.end_date).toLocaleDateString()}` : 'No end date'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/ads/${ad.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => toggleStatus(ad.id, ad.status)}
                      className={ad.status === 'active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                      title={ad.status === 'active' ? 'Pause' : 'Activate'}
                    >
                      {ad.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <Link
                      href={`/admin/ads/${ad.id}/analytics`}
                      className="text-purple-600 hover:text-purple-900"
                      title="Analytics"
                    >
                      <BarChart2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}