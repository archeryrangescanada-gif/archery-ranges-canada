'use client'
import { useEffect, useState, useRef } from 'react'
import { Search, Filter, Plus, Edit, Trash2, Eye, Star, Upload, FileUp, BarChart3, UserCheck, UserX, Loader2, Lock } from 'lucide-react'
import Link from 'next/link'
import Papa from 'papaparse'
import { createClient } from '@/lib/supabase/client'
import { RangeWithRelations } from '@/types/database'

interface Listing {
  id: string
  name: string
  city: string
  province: string
  city_id?: string | null
  province_id?: string | null
  status: 'active' | 'pending' | 'inactive' | 'rejected'
  subscription_tier: 'free' | 'bronze' | 'silver' | 'gold'
  owner_id?: string | null
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

  // Quick Edit Modal Logic
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [ownerDetails, setOwnerDetails] = useState<any>(null)
  const [loadingOwner, setLoadingOwner] = useState(false)

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
          is_premium,
          subscription_tier,
          owner_id,
          created_at,
          city_id,
          province_id,
          cities(name),
          provinces(name)
        `)
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      const rangeData = data as any[]
      console.log('Admin Listings Raw Data:', rangeData[0]) // Debug first item

      const formattedData: Listing[] = rangeData.map(item => {
        // Handle explicit nulls or missing relations
        const cityObj = item.cities
        const provinceObj = item.provinces

        // Supabase can return arrays for relations sometimes
        const cityName = Array.isArray(cityObj)
          ? cityObj[0]?.name
          : cityObj?.name

        const provinceName = Array.isArray(provinceObj)
          ? provinceObj[0]?.name
          : provinceObj?.name

        // Map db enum to frontend enum
        const dbTierMap: Record<string, string> = {
          'free': 'free',
          'basic': 'bronze',
          'pro': 'silver',
          'premium': 'gold'
        }
        const mappedTier = dbTierMap[item.subscription_tier] || item.subscription_tier || 'free'

        return {
          id: item.id,
          name: item.name,
          city: cityName || 'Unknown',
          province: provinceName || 'Unknown',
          city_id: item.city_id,
          province_id: item.province_id,
          status: item.status || 'active',
          subscription_tier: mappedTier as any,
          owner_id: item.owner_id,
          is_premium: item.is_premium || false,
          is_featured: item.is_featured || false,
          claimed: !!item.owner_id, // If owner_id exists, it's claimed
          views_count: item.views_count ?? 0,
          created_at: item.created_at
        }
      })

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
        l.city.toLowerCase().includes(lowerQ)
      if (!matchesSearch) return false
    }

    // Status Filter
    if (statusFilter !== 'all' && l.status !== statusFilter) return false

    // Province Filter
    if (provinceFilter !== 'all' && l.province !== provinceFilter) return false

    return true
  })

  // Helper Helpers
  const stripBOM = (str: string) => str.replace(/^\uFEFF/, '')

  const cleanFloat = (val: any): number | null => {
    if (!val) return null
    if (typeof val === 'number') return val
    if (typeof val === 'string') {
      const s = val.trim().toLowerCase()
      if (s === 'n/a' || s === '') return null
      const casted = parseFloat(s)
      return isNaN(casted) ? null : casted
    }
    return null
  }

  const cleanInt = (val: any): number | null => {
    if (!val) return null
    const f = cleanFloat(val)
    return f !== null ? Math.round(f) : null
  }

  // Find value in row by fuzzy key match
  const getValue = (row: any, keys: string[]) => {
    const rowKeys = Object.keys(row)
    for (const target of keys) {
      // Direct match
      if (row[target]) return row[target]
      // Case insensitive match
      const foundKey = rowKeys.find(k => k.toLowerCase().trim() === target.toLowerCase())
      if (foundKey && row[foundKey] !== undefined) return row[foundKey]
    }
    return null
  }

  const parseCurrency = (value: any): number | null => {
    if (!value) return null
    if (typeof value === 'number') return value

    // Convert "Free" to 0
    if (typeof value === 'string' && value.toLowerCase().includes('free')) return 0

    // Extract first number from strings like "$50 (Adult)" or "$5/round"
    const match = value.toString().match(/(\d+(\.\d+)?)/)
    return match ? parseFloat(match[0]) : null
  }

  const parseBoolean = (value: any): boolean => {
    if (!value) return false
    if (typeof value === 'boolean') return value
    const s = value.toString().toLowerCase().trim()
    // Check for varying truthy formats
    return ['yes', 'true', '1', 'y', 'available'].some(t => s.includes(t))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImporting(true)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => stripBOM(h).toLowerCase().trim().replace(/^"|"$/g, ''),
      complete: async (results) => {
        try {
          // Debugging: Log Raw Keys of first row
          if (results.data.length > 0) {
            const firstRow = results.data[0] as object
            const keys = Object.keys(firstRow)
            // ALERT THE USER TO DEBUG
            const titleFound = getValue(firstRow, ['post_title', 'name', 'title', 'range_name', 'club', 'organization'])
            alert(`DEBUG: Scanning CSV Columns...\n\nFound Keys: ${keys.join(', ')}\n\nLooking for 'name'/'title'... Found: "${titleFound}"\n\nIf this says "undefined" or "Untitled Range", the column name is wrong!`)
          }

          // Transform and Clean Data Logic
          const transformedData = results.data.map((row: any) => {
            // Robust Key Lookup
            const postTitle = getValue(row, ['post_title', 'name', 'title', 'range_name', 'club', 'organization', 'business_name', 'company']) || 'Untitled Range'
            const city = getValue(row, ['post_city', 'city', 'town', 'location'])
            const province = getValue(row, ['post_region', 'province', 'region', 'prov', 'state'])
            const address = getValue(row, ['post_address', 'address', 'post_address_1', 'street'])

            // Skip totally empty garbage rows that might have slipped through
            if (postTitle === 'Untitled Range' && !city && !province) {
              return null
            }

            return {
              post_title: postTitle,
              post_city: city,
              post_region: province,
              post_address: address,

              post_zip: getValue(row, ['post_zip', 'zip', 'postal_code']),
              post_latitude: cleanFloat(getValue(row, ['post_latitude', 'latitude', 'lat'])),
              post_longitude: cleanFloat(getValue(row, ['post_longitude', 'longitude', 'long', 'lng'])),

              phone: getValue(row, ['phone', 'phone_number']),
              email: getValue(row, ['email']),
              website: getValue(row, ['website', 'url']),
              post_content: getValue(row, ['post_content', 'description', 'notes']),
              post_tags: getValue(row, ['post_tags', 'tags']),
              business_hours: getValue(row, ['business_hours', 'hours']),

              // Clean Boolean Fields
              has_pro_shop: parseBoolean(getValue(row, ['has_pro_shop', 'pro_shop'])),
              has_3d_course: parseBoolean(getValue(row, ['has_3d_course', '3d_course'])),
              has_field_course: parseBoolean(getValue(row, ['has_field_course', 'field_course'])),
              equipment_rental_available: parseBoolean(getValue(row, ['equipment_rental_available', 'rentals'])),
              lessons_available: parseBoolean(getValue(row, ['lessons_available', 'lessons'])),
              membership_required: parseBoolean(getValue(row, ['membership_required', 'membership'])),
              accessibility: parseBoolean(getValue(row, ['accessibility', 'accessible'])),
              parking_available: parseBoolean(getValue(row, ['parking_available', 'parking'])),

              // Clean Numeric Fields
              membership_price_adult: parseCurrency(getValue(row, ['membership_price_adult', 'membership_price'])),
              drop_in_price: parseCurrency(getValue(row, ['drop_in_price', 'drop_in'])),
              range_length_yards: cleanInt(getValue(row, ['range_length_yards', 'length_yards', 'distance'])),
              number_of_lanes: cleanInt(getValue(row, ['number_of_lanes', 'lanes'])),

              facility_type: getValue(row, ['facility_type', 'type']) || 'Indoor',
              bow_types_allowed: getValue(row, ['bow_types_allowed', 'bow_types']),
              lesson_price_range: getValue(row, ['lesson_price_range'])
            }
          }).filter(r => r !== null) // Filter out nulls (garbage rows)

          console.log('Processed Import Data (Row 1):', transformedData[0])

          const response = await fetch('/api/admin/listings/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ranges: transformedData }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.details || data.error || 'Import failed')
          }

          alert(`Import complete!\nSuccess: ${data.success}\nFailed: ${data.failed}\nErrors:\n${data.errors.slice(0, 10).join('\n')}${data.errors.length > 10 ? '\n...and more' : ''}`)
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
        l.id === id ? { ...l, status: newStatus as Listing['status'] } : l
      ))
    } catch (err: any) {
      alert(err.message)
    }
  }

  const togglePremium = async (id: string) => {
    const listing = listings.find(l => l.id === id)
    if (!listing) return

    const newVal = !listing.is_premium
    // Synchronize subscription_tier with premium status
    const newTier = newVal ? 'premium' : 'free'

    if (!confirm(`Are you sure you want to set "${listing.name}" to ${newVal ? 'PREMIUM' : 'FREE'}? This will update the subscription tier to ${newTier}.`)) return

    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_premium: newVal,
          subscription_tier: newTier
        })
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

      if (!provinceMap.has(l.province_id)) {
        provinceMap.set(l.province_id, {
          id: l.province_id,
          name: l.province,
          count: 0,
          cities: new Map()
        })
      }

      const prov = provinceMap.get(l.province_id)!
      prov.count++

      if (l.city_id && l.city) {
        if (!prov.cities.has(l.city_id)) {
          prov.cities.set(l.city_id, { id: l.city_id, name: l.city, count: 0 })
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

  // Quick Edit Modal Logic

  const openQuickEdit = async (listing: Listing) => {
    setSelectedListing(listing)
    setOwnerDetails(null)

    if (listing.owner_id) {
      setLoadingOwner(true)
      try {
        const res = await fetch(`/api/admin/users?id=${listing.owner_id}`)
        const data = await res.json()
        if (res.ok && data.user) {
          setOwnerDetails(data.user)
        }
      } catch (error) {
        console.error('Failed to load owner:', error)
      } finally {
        setLoadingOwner(false)
      }
    }
  }

  const handleTierChange = async (listingId: string, newTier: 'free' | 'bronze' | 'silver' | 'gold') => {
    if (!confirm(`Change tier to ${newTier.toUpperCase()}?`)) return

    // Logic to sync is_premium if tier is not free?
    // Or just update both.
    const isPremium = newTier !== 'free'

    try {
      const res = await fetch(`/api/admin/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_tier: newTier,
          is_premium: isPremium
        })
      })

      const responseData = await res.json()

      if (!res.ok) {
        throw new Error(responseData.error || 'Failed to update tier')
      }

      setListings(listings.map(l => l.id === listingId ? { ...l, subscription_tier: newTier, is_premium: isPremium } : l))

      if (selectedListing?.id === listingId) {
        setSelectedListing({ ...selectedListing, subscription_tier: newTier, is_premium: isPremium })
      }

    } catch (error: any) {
      alert(`API Error: ${error.message}`)
    }
  }

  return (
    <div>
      {/* Quick Edit Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-1">{selectedListing.name}</h2>
            <p className="text-gray-500 text-sm mb-6">{selectedListing.city}, {selectedListing.province}</p>

            {/* Claim Status Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-widest mb-3">Claim Status</h3>
              {selectedListing.claimed ? (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-full text-green-600">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Claimed Listing</p>
                    {loadingOwner ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Loading owner details...
                      </div>
                    ) : ownerDetails ? (
                      <div className="mt-1 text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Name:</span> {ownerDetails.full_name || 'N/A'}</p>
                        <p><span className="font-medium">Email:</span> {ownerDetails.email}</p>
                        <p><span className="font-medium">Role:</span> {ownerDetails.role}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-red-500 mt-1">Could not load owner details.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-200 rounded-full text-gray-500">
                    <UserX className="w-5 h-5" />
                  </div>
                  <p className="font-medium text-gray-600">Unclaimed Listing</p>
                </div>
              )}
            </div>

            {/* Tier Edit Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-widest mb-3">Subscription Tier</h3>
              <div className="grid grid-cols-2 gap-3">
                {['free', 'bronze', 'silver', 'gold'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => handleTierChange(selectedListing.id, tier as any)}
                    className={`px-4 py-3 rounded-lg border-2 text-sm font-bold capitalize transition-all ${selectedListing.subscription_tier === tier
                      ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                      }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Link
                href={`/admin/listings/${selectedListing.id}/edit`}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2"
              >
                <Edit className="w-4 h-4" /> Full Edit Page
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Listings Management</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage all archery range listings</p>
        </div>
        <div className="flex flex-wrap gap-2">
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
            className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-purple-700 flex items-center shadow-sm text-sm"
          >
            <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            AI Auto-Import
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 flex items-center disabled:opacity-50 text-sm"
          >
            {importing ? (
              <span className="flex items-center">Processing...</span>
            ) : (
              <>
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Import CSV
              </>
            )}
          </button>
          <button
            onClick={() => setShowBulkDelete(true)}
            className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-red-700 flex items-center text-sm"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Delete Options
          </button>
          <Link
            href="/admin/listings/new"
            className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-green-700 flex items-center text-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Add Listing
          </Link>
        </div>
      </div>

      {/* ... Existing Filters and Table ... */}
      < div className="bg-white rounded-lg shadow p-6 mb-6" >
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
      </div >

      <div className="bg-white rounded-lg shadow overflow-x-auto">
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
                      <div
                        className="cursor-pointer hover:opacity-75"
                        onClick={() => openQuickEdit(listing)}
                      >
                        <div className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                          {listing.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${listing.claimed ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          {listing.claimed ? 'Claimed' : 'Unclaimed'}
                          <span className="text-gray-300">|</span>
                          <span className="capitalize">{listing.subscription_tier}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{listing.city || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{listing.province || 'N/A'}</div>
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
                      {listing.views_count ?? 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/listings/${listing.id}/analytics`}
                        className="text-green-600 hover:text-green-900"
                        title="View Analytics"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Link>
                      {listing.claimed ? (
                        <div
                          className="text-gray-400 cursor-not-allowed"
                          title="Cannot edit a claimed listing"
                        >
                          <Lock className="w-4 h-4" />
                        </div>
                      ) : (
                        <Link
                          href={`/admin/listings/${listing.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Listing"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      )}
                      <button
                        onClick={() => toggleFeatured(listing.id)}
                        className={listing.is_featured ? 'text-yellow-600' : 'text-gray-400 hover:text-yellow-600'}
                        title={listing.is_featured ? 'Remove Featured' : 'Mark as Featured'}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Listing"
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
      {
        showBulkDelete && (
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
        )
      }

      {/* AI Import Modal */}
      {
        showAIModal && (
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
        )
      }
    </div >
  )
}