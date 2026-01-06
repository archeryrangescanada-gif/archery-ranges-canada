'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseClient } from '@/lib/auth'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Range {
  id: string
  name: string
  slug: string
  address: string
  city_id: string
  phone_number: string | null
  website: string | null
  facility_type: string
  amenities: string[]
  price_range: string
  city?: {
    name: string
    slug: string
    province?: {
      name: string
      slug: string
    }
  }
}

export default function ComparePage() {
  const [ranges, setRanges] = useState<Range[]>([])
  const [selectedRanges, setSelectedRanges] = useState<Range[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRanges() {
      const { data } = await supabaseClient
        .from('ranges')
        .select('*, city:cities(name, slug, province:provinces(name, slug))')
        .order('name')

      if (data) {
        setRanges(data as any)
      }
      setLoading(false)
    }
    fetchRanges()
  }, [])

  const filteredRanges = ranges.filter(range =>
    range.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    range.city?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addToCompare = (range: Range) => {
    if (selectedRanges.length < 3 && !selectedRanges.find(r => r.id === range.id)) {
      setSelectedRanges([...selectedRanges, range])
    }
  }

  const removeFromCompare = (rangeId: string) => {
    setSelectedRanges(selectedRanges.filter(r => r.id !== rangeId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">Compare Ranges</span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Compare Archery Ranges</h1>
          <p className="text-xl text-gray-600">
            Select up to 3 ranges to compare side-by-side
          </p>
        </div>

        {selectedRanges.length > 0 && (
          <section className="mb-12 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Selected Ranges ({selectedRanges.length}/3)
              </h2>
              {selectedRanges.length > 1 && (
                <button
                  onClick={() => setSelectedRanges([])}
                  className="text-red-600 hover:text-red-700 font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selectedRanges.map((range) => (
                <div key={range.id} className="border-2 border-green-500 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-900">{range.name}</h3>
                    <button
                      onClick={() => removeFromCompare(range.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {range.city?.name}, {range.city?.province?.name}
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Type:</span> {range.facility_type?.replace('_', ' ')}</p>
                    <p><span className="font-semibold">Price:</span> {range.price_range}</p>
                    <p><span className="font-semibold">Address:</span> {range.address}</p>
                    {range.phone_number && (
                      <p><span className="font-semibold">Phone:</span> {range.phone_number}</p>
                    )}
                    {range.amenities && range.amenities.length > 0 && (
                      <div>
                        <span className="font-semibold">Amenities:</span>
                        <ul className="list-disc list-inside ml-2">
                          {range.amenities.map((amenity, idx) => (
                            <li key={idx} className="text-xs">{amenity}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {selectedRanges.length < 3 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
                  <p className="text-gray-400 text-center">
                    Add {selectedRanges.length === 0 ? 'ranges' : 'another range'} to compare
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        <section className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Ranges to Compare</h2>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by range name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading ranges...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRanges.map((range) => {
                const isSelected = selectedRanges.find(r => r.id === range.id)
                const canAdd = selectedRanges.length < 3

                return (
                  <div
                    key={range.id}
                    className={`border rounded-lg p-4 transition-all ${isSelected
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                      }`}
                  >
                    <h3 className="font-bold text-gray-900 mb-1">{range.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {range.city?.name}, {range.city?.province?.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-3 capitalize">
                      {range.facility_type?.replace('_', ' ')} • {range.price_range}
                    </p>

                    {isSelected ? (
                      <button
                        onClick={() => removeFromCompare(range.id)}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => addToCompare(range)}
                        disabled={!canAdd}
                        className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${canAdd
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                      >
                        {canAdd ? 'Add to Compare' : 'Max 3 Ranges'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {!loading && filteredRanges.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No ranges found matching your search.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}