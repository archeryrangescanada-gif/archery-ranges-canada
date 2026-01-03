'use client'
import { useEffect, useState, useRef } from 'react'
import { Search, Filter, Plus, Edit, Trash2, Eye, Star, Upload, FileUp } from 'lucide-react'
import Link from 'next/link'
import Papa from 'papaparse'
import { createClient } from '@/lib/supabase/client'

interface Listing {
  id: string
  name: string
  city: { name: string } | null
  province: { name: string } | null
  city_id?: string
  province_id?: string
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
  const [importing, setImporting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [provinceFilter, setProvinceFilter] = useState<string>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // AI Import State
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiUrl, setAiUrl] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const handleAiExtract = async () => {
    if (!aiUrl) return alert('Please enter a URL')

    setAiLoading(true)
    try {
      const res = await fetch('/api/admin/listings/ai-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: aiUrl })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Extraction failed')

      console.log('Extracted Data:', data.data)
      const confirmed = confirm(`Found Range: ${data.data.name}\n\nCreate this listing now?`)

      if (confirmed) {
        // Auto-create via API
        const createRes = await fetch('/api/admin/listings/import', {
          method: 'POST',
          body: JSON.stringify({
            ranges: [{
              post_title: data.data.name,
              post_city: data.data.city,
              post_region: data.data.province,
              post_address: data.data.address,
              phone: data.data.phone_number,
              email: data.data.email,
              website: data.data.website,
              post_content: data.data.description,
              range_length_yards: data.data.range_length_yards,
              number_of_lanes: data.data.number_of_lanes,
              facility_type: data.data.facility_type,
              has_pro_shop: data.data.has_pro_shop,
              has_3d_course: data.data.has_3d_course,
              membership_price_adult: data.data.pricing?.membership,
              drop_in_price: data.data.pricing?.drop_in,
              business_hours: data.data.business_hours
            }]
          })
        })

        if (createRes.ok) {
          alert('Listing Created Successfully!')
          setShowAIModal(false)
          setAiUrl('')
          fetchListings()
        } else {
          alert('Failed to save listing.')
        }
      }

    } catch (err: any) {
      alert('AI Error: ' + err.message)
    } finally {
      setAiLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, []) // Fetch once on mount

  const fetchListings = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('ranges')
        .select(`
          id,
          name,
          is_featured,
          created_at,
          city_id,
          province_id,
          city:cities(name),
          province:provinces(name)
        `)
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      let formattedData = (data as any[]).map(item => ({
        ...item,
        city: item.city?.name || 'Unknown',
        province: item.province?.name || 'Unknown',
        // IDs are already at top level if selected, or we ensure they map correctly
        city_id: item.city_id,
        province_id: item.province_id,
        status: item.status || 'active',
        is_premium: item.is_premium || false,
        claimed: item.claimed || false,
        views_count: 0
      }))

      setListings(formattedData)
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  // Client-side filtering
  const filteredListings = listings.filter(l => {
    // Search
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase()
      const matchesSearch =
        l.name.toLowerCase().includes(lowerQ) ||
        (l.city as any).toLowerCase().includes(lowerQ)
      if (!matchesSearch) return false
    }

    // Status Filter
    if (statusFilter !== 'all' && l.status !== statusFilter) return false

    // Province Filter
    if (provinceFilter !== 'all' && (l.province as any) !== provinceFilter) return false

    return true
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const response = await fetch('/api/admin/listings/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ranges: results.data }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.details || data.error || 'Import failed')
          }

          alert(`Import complete!\nSuccess: ${data.success}\nFailed: ${data.failed}\nErrors:\n${data.errors.join('\n')}`)
          fetchListings() // Refresh list
        } catch (error: any) {
          console.error('Import error:', error)
          alert(`Import failed: ${error.message}`)
        } finally {
          setImporting(false)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }
      },
      error: (error) => {
        console.error('CSV Parse Error:', error)
        alert('Failed to parse CSV file')
        setImporting(false)
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    try {
      const response = await fetch(`/api/admin/listings/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete listing')
      }

      setListings(listings.filter(l => l.id !== id))
    } catch (error: any) {
      alert('Error deleting listing: ' + error.message)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) throw new Error('Failed to update status')

      setListings(listings.map(l =>
        l.id === id ? { ...l, status: newStatus as any } : l
      ))
    } catch (err: any) {
      alert(err.message)
    }
  }

  const togglePremium = async (id: string) => {
    const listing = listings.find(l => l.id === id)
    if (!listing) return

    const newVal = !listing.is_premium
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_premium: newVal })
      })

      if (!res.ok) throw new Error('Failed to update premium status')

      setListings(listings.map(l =>
        l.id === id ? { ...l, is_premium: newVal } : l
      ))
    } catch (err: any) {
      alert(err.message)
    }
  }

  const toggleFeatured = async (id: string) => {
    const listing = listings.find(l => l.id === id)
    if (!listing) return

    const newVal = !listing.is_featured
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: newVal })
      })

      if (!res.ok) throw new Error('Failed to update featured status')

      setListings(listings.map(l =>
        l.id === id ? { ...l, is_featured: newVal } : l
      ))
    } catch (err: any) {
      alert('Error updating: ' + err.message)
    }
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

  // Bulk Delete Modal Logic
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [expandedProvinces, setExpandedProvinces] = useState<Set<string>>(new Set())

  const toggleProvince = (id: string) => {
    const newSet = new Set(expandedProvinces)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedProvinces(newSet)
  }

  // Calculate stats for the modal
  const getStats = () => {
    const provinceMap = new Map<string, { id: string, name: string, count: number, cities: Map<string, { id: string, name: string, count: number }> }>()

    listings.forEach(l => {
      if (!l.province_id || !l.province) return
      const pName = typeof l.province === 'string' ? l.province : (l.province as any).name || (l.province as any)

      if (!provinceMap.has(l.province_id)) {
        provinceMap.set(l.province_id, {
          id: l.province_id,
          name: String(pName),
          count: 0,
          cities: new Map()
        })
      }

      const prov = provinceMap.get(l.province_id)!
      prov.count++

      if (l.city_id) {
        const cName = typeof l.city === 'string' ? l.city : (l.city as any).name || (l.city as any)
        if (!prov.cities.has(l.city_id)) {
          prov.cities.set(l.city_id, { id: l.city_id, name: String(cName), count: 0 })
        }
        prov.cities.get(l.city_id)!.count++
      }
    })

    return Array.from(provinceMap.values()).map(p => ({
      ...p,
      cities: Array.from(p.cities.values())
    }))
  }

  const handleBulkDelete = async (scope: 'all' | 'province' | 'city', id?: string, name?: string) => {
    const label = scope === 'all' ? 'EVERYTHING' : `${scope} "${name}"`
    const confirmMsg = `DANGER: You are about to DELETE ${label}.\n\nThis will remove all associated listings permanently.\n\nType "DELETE" to confirm.`

    const userInput = prompt(confirmMsg)
    if (userInput !== 'DELETE') {
      if (userInput !== null) alert('Deletion cancelled. You must type "DELETE" exactly.')
      return
    }

    try {
      const response = await fetch('/api/admin/listings/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope, id })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to delete')

      alert(`Successfully deleted ${data.count || 'listings'}.`)
      setShowBulkDelete(false)
      fetchListings()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading data from database...</div>
  }



  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Listings Management</h1>
          <p className="text-gray-600 mt-2">Manage all archery range listings</p>
        </div>
        <div className="flex gap-2">
          {/* FILE INPUT HIDDEN */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />

          <button
            onClick={() => setShowAIModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center shadow-sm"
          >
            <Star className="w-5 h-5 mr-2" />
            AI Auto-Import
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center disabled:opacity-50"
          >
            {importing ? (
              <span className="flex items-center">Processing...</span>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Import CSV
              </>
            )}
          </button>
          <button
            onClick={() => setShowBulkDelete(true)}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center mr-2"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Delete Options
          </button>
          <Link
            href="/admin/listings/new"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Listing
          </Link>
        </div>
      </div>

      {/* ... Existing Filters and Table ... */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
          >
            <option value="all">All Provinces</option>
            <option value="Ontario">Ontario</option>
            <option value="British Columbia">British Columbia</option>
            <option value="Alberta">Alberta</option>
            <option value="Quebec">Quebec</option>
            <option value="Manitoba">Manitoba</option>
            <option value="Saskatchewan">Saskatchewan</option>
            <option value="Nova Scotia">Nova Scotia</option>
            <option value="New Brunswick">New Brunswick</option>
          </select>
        </div>
      </div>

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
            {filteredListings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No listings found. Try importing a CSV or adjusting filters.
                </td>
              </tr>
            ) : (
              filteredListings.map((listing) => (
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
                    <div className="text-sm text-gray-900">{listing.city as any}</div>
                    <div className="text-sm text-gray-500">{listing.province as any}</div>
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
                        className={`px-2 py-1 rounded text-xs font-medium ${listing.is_premium
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bulk Delete Modal */}
      {showBulkDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            {/* ... existing modal content ... */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Trash2 className="text-red-600 w-6 h-6" />
                Bulk Delete Listings
              </h2>
              <button onClick={() => setShowBulkDelete(false)} className="text-gray-500 hover:text-gray-700">
                Close
              </button>
            </div>
            {/* ... */}
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-lg">
              <h3 className="font-bold text-red-800 mb-2">Danger Zone</h3>
              <p className="text-red-700 text-sm mb-4">Actions here are irreversible. Confirm carefully.</p>
              <button
                onClick={() => handleBulkDelete('all')}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                DELETE ALL LISTINGS ({listings.length})
              </button>
            </div>

            <h3 className="font-semibold text-gray-800 mb-4">Delete by Location</h3>
            <div className="space-y-4">
              {getStats().map(prov => (
                <div key={prov.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      {prov.cities.length > 0 && (
                        <button
                          onClick={() => toggleProvince(prov.id)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {expandedProvinces.has(prov.id) ? (
                            <div className="transform rotate-180">▼</div>
                          ) : (
                            <div>▶</div>
                          )}
                        </button>
                      )}
                      <span className="font-bold text-gray-900">{prov.name}</span>
                      <span className="text-sm text-gray-500">({prov.count} listings)</span>
                    </div>
                    <button
                      onClick={() => handleBulkDelete('province', prov.id, prov.name)}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                    >
                      Delete Entire Province
                    </button>
                  </div>

                  {prov.cities.length > 0 && expandedProvinces.has(prov.id) && (
                    <div className="ml-8 pl-4 border-l-2 border-gray-100 space-y-2 mt-2">
                      {prov.cities.map(city => (
                        <div key={city.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{city.name} ({city.count})</span>
                          <button
                            onClick={() => handleBulkDelete('city', city.id, city.name)}
                            className="text-xs text-red-600 hover:text-red-800 underline"
                          >
                            Delete City
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {getStats().length === 0 && <p className="text-gray-500 italic">No listings found to organize.</p>}
            </div>
          </div>
        </div>
      )}

      {/* AI Import Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Star className="text-purple-600" />
              AI Auto-Import
            </h2>
            <p className="text-gray-600 mb-6">Paste a business website URL or Google Maps link. Gemini will auto-extract the details.</p>

            <input
              type="url"
              placeholder="https://example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-purple-500 outline-none text-black placeholder:text-gray-500"
              style={{ color: 'black' }}
              value={aiUrl}
              onChange={(e) => setAiUrl(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAIModal(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancel</button>
              <button
                onClick={handleAiExtract}
                disabled={aiLoading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                {aiLoading ? 'Analyzing...' : 'Extract & Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}