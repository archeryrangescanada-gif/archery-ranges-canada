'use client'
import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Eye, Pin, Star } from 'lucide-react'
import Link from 'next/link'
import {
  getAnnouncements,
  togglePinnedAnnouncement,
  toggleFeaturedAnnouncement,
  deleteAnnouncement
} from './actions'

interface Announcement {
  id: string
  title: string
  excerpt: string
  category: 'tournament' | 'event' | 'news' | 'promotion' | 'update'
  status: 'draft' | 'published' | 'archived'
  is_featured: boolean
  is_pinned: boolean
  province?: string
  publish_date: string
  expire_date?: string
  views_count: number
  clicks_count: number
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => {
    fetchAnnouncements()
  }, [statusFilter, categoryFilter])

  const fetchAnnouncements = async () => {
    setLoading(true)
    const { data, error } = await getAnnouncements({
      status: statusFilter,
      category: categoryFilter
    })

    if (data) {
      setAnnouncements(data as Announcement[])
    } else {
      console.error(error)
      // Fallback to empty list or handle error
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return

    // Optimistic update
    const previousAnnouncements = [...announcements]
    setAnnouncements(announcements.filter(a => a.id !== id))

    const { success, error } = await deleteAnnouncement(id)

    if (!success) {
      alert('Failed to delete announcement')
      setAnnouncements(previousAnnouncements)
      console.error(error)
    }
  }

  const toggleFeatured = async (id: string) => {
    const announcement = announcements.find(a => a.id === id)
    if (!announcement) return

    // Optimistic update
    setAnnouncements(announcements.map(a =>
      a.id === id ? { ...a, is_featured: !a.is_featured } : a
    ))

    const { success, error } = await toggleFeaturedAnnouncement(id, !announcement.is_featured)

    if (!success) {
      alert('Failed to update featured status')
      setAnnouncements(announcements.map(a =>
        a.id === id ? { ...a, is_featured: announcement.is_featured } : a
      ))
      console.error(error)
    }
  }

  const togglePinned = async (id: string) => {
    const announcement = announcements.find(a => a.id === id)
    if (!announcement) return

    // Optimistic update
    setAnnouncements(announcements.map(a =>
      a.id === id ? { ...a, is_pinned: !a.is_pinned } : a
    ))

    const { success, error } = await togglePinnedAnnouncement(id, !announcement.is_pinned)

    if (!success) {
      alert('Failed to update pinned status')
      setAnnouncements(announcements.map(a =>
        a.id === id ? { ...a, is_pinned: announcement.is_pinned } : a
      ))
      console.error(error)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      tournament: 'bg-purple-100 text-purple-800',
      event: 'bg-blue-100 text-blue-800',
      news: 'bg-cyan-100 text-cyan-800',
      promotion: 'bg-pink-100 text-pink-800',
      update: 'bg-green-100 text-green-800'
    }
    return colors[category as keyof typeof colors] || colors.news
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || colors.draft
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-2">Manage site announcements and updates</p>
        </div>
        <Link
          href="/admin/announcements/new"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Announcement
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Announcements</p>
          <p className="text-3xl font-bold text-gray-900">{announcements.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Published</p>
          <p className="text-3xl font-bold text-green-600">
            {announcements.filter(a => a.status === 'published').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Views</p>
          <p className="text-3xl font-bold text-blue-600">
            {announcements.reduce((sum, a) => sum + a.views_count, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Clicks</p>
          <p className="text-3xl font-bold text-purple-600">
            {announcements.reduce((sum, a) => sum + a.clicks_count, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Categories</option>
            <option value="tournament">Tournament</option>
            <option value="event">Event</option>
            <option value="news">News</option>
            <option value="promotion">Promotion</option>
            <option value="update">Update</option>
          </select>
        </div>
      </div>

      {/* Announcements Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Announcement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {announcements.map((announcement) => (
              <tr key={announcement.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        {announcement.is_pinned && (
                          <Pin className="w-4 h-4 text-yellow-500 mr-1" />
                        )}
                        {announcement.is_featured && (
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        )}
                        {announcement.title}
                      </div>
                      <div className="text-sm text-gray-500">{announcement.excerpt}</div>
                      {announcement.province && (
                        <div className="text-xs text-gray-400 mt-1">📍 {announcement.province}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(announcement.category)}`}>
                    {announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(announcement.status)}`}>
                    {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {announcement.views_count}
                  </div>
                  <div className="text-xs text-gray-400">
                    {announcement.clicks_count} clicks
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{new Date(announcement.publish_date).toLocaleDateString()}</div>
                  {announcement.expire_date && (
                    <div className="text-xs text-gray-400">
                      Expires: {new Date(announcement.expire_date).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/announcements/${announcement.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => toggleFeatured(announcement.id)}
                      className={announcement.is_featured ? 'text-yellow-600' : 'text-gray-400 hover:text-yellow-600'}
                      title="Toggle Featured"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => togglePinned(announcement.id)}
                      className={announcement.is_pinned ? 'text-yellow-600' : 'text-gray-400 hover:text-yellow-600'}
                      title="Toggle Pinned"
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="text-red-600 hover:text-red-900"
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
