// src/app/admin/listings/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { Search, Filter, Plus, Edit, Trash2, Eye, Star } from 'lucide-react'
import Link from 'next/link'

interface Listing {
  id: string
  name: string
  city: string
  province: string
  status: 'active' | 'pending' | 'inactive' | 'rejected'
  is_premium: boolean
  is_featured: boolean
  views_count: number
  claimed: boolean
  created_at: string
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [provinceFilter, setProvinceFilter] = useState<string>('all')

  useEffect(() => {
    fetchListings()
  }, [statusFilter, provinceFilter, searchQuery])

  const fetchListings = async () => {
    // TODO: Fetch from Supabase with filters
    // Placeholder data
    setListings([
      {
        id: '1',
        name: 'Toronto Archery Range',
        city: 'Toronto',
        province: 'Ontario',
        status: 'active',
        is_premium: true,
        is_featured: true,
        views_count: 1234,
        claimed: true,
        created_at: '2024-01-15'
      },
      {
        id: '2',
        name: 'Vancouver Archery Club',
        city: 'Vancouver',
        province: 'British Columbia',
        status: 'active',
        is_premium: false,
        is_featured: false,
        views_count: 856,
        claimed: false,
        created_at: '2024-02-20'
      },
      {
        id: '3',
        name: 'Calgary Indoor Range',
        city: 'Calgary',
        province: 'Alberta',
        status: 'pending',
        is_premium: false,
        is_featured: false,
        views_count: 0,
        claimed: false,
        created_at: '2024-03-10'
      }
    ])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    // TODO: Delete from Supabase
    setListings(listings.filter(l => l.id !== id))
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    // TODO: Update in Supabase
    setListings(listings.map(l => 
      l.id === id ? { ...l, status: newStatus as any } : l
    ))
  }

  const togglePremium = async (id: string) => {
    // TODO: Update in Supabase
    setListings(listings.map(l => 
      l.id === id ? { ...l, is_premium: !l.is_premium } : l
    ))
  }

  const toggleFeatured = async (id: string) => {
    // TODO: Update in Supabase
    setListings(listings.map(l => 
      l.id === id ? { ...l, is_featured: !l.is_featured } : l
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Listings Management</h1>
          <p className="text-gray-600 mt-2">Manage all archery range listings</p>
        </div>
        <Link
          href="/admin/listings/new"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Listing
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Province Filter */}
          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Provinces</option>
            <option value="Ontario">Ontario</option>
            <option value="British Columbia">British Columbia</option>
            <option value="Alberta">Alberta</option>
            <option value="Quebec">Quebec</option>
            {/* Add all provinces */}
          </select>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Listing
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {listings.map((listing) => (
              <tr key={listing.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {listing.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {listing.claimed ? '✓ Claimed' : 'Unclaimed'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{listing.city}</div>
                  <div className="text-sm text-gray-500">{listing.province}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={listing.status}
                    onChange={(e) => handleStatusChange(listing.id, e.target.value)}
                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(listing.status)}`}
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => togglePremium(listing.id)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        listing.is_premium 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {listing.is_premium ? '⭐ Premium' : 'Free'}
                    </button>
                    {listing.is_featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                        Featured
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {listing.views_count}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/listings/${listing.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => toggleFeatured(listing.id)}
                      className={listing.is_featured ? 'text-yellow-600' : 'text-gray-400 hover:text-yellow-600'}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(listing.id)}
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