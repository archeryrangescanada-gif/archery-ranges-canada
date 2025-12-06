'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createServerSupabaseClient } from '@/lib/server'

interface Province {
  id: string
  name: string
  slug: string
}

export default function Home() {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProvinces() {
      const { data, error } = await supabase
        .from('provinces')
        .select('*')
        .order('name')
      
      if (data) setProvinces(data)
      setLoading(false)
    }
    fetchProvinces()
  }, [])

  const filteredProvinces = provinces.filter(province =>
    province.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-green-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            🏹 Find Archery Ranges in Canada
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-green-50">
            Discover indoor and outdoor archery facilities across all provinces
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by province, city, or range name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 text-lg text-gray-800 rounded-full shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-300"
              />
              <button className="absolute right-2 top-2 bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-full font-semibold transition-colors">
                Search
              </button>
            </div>
            <p className="text-green-100 text-sm mt-3">
              {provinces.length} provinces • 100+ cities • Find your perfect range
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* How It Works */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Finding your perfect archery range is easy
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Choose Your Location</h3>
              <p className="text-gray-600">Select your province and city</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Browse Ranges</h3>
              <p className="text-gray-600">See all facilities in your area</p>
            </div>
            
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏹</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Start Shooting!</h3>
              <p className="text-gray-600">Visit and enjoy archery</p>
            </div>
          </div>
        </section>

        {/* Provinces Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Browse by Province
            </h2>
            <p className="text-gray-600 text-lg">
              Select your province to find nearby archery ranges
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading provinces...</p>
            </div>
          ) : filteredProvinces.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No provinces found matching "{searchQuery}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {filteredProvinces.map((province) => (
                <Link
                  key={province.id}
                  href={`/${province.slug}`}
                  className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-green-500 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                      {province.name}
                    </h3>
                    <span className="text-2xl">🍁</span>
                  </div>
                  <p className="text-green-600 font-medium group-hover:underline">
                    View ranges →
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="mt-20 bg-gray-50 rounded-2xl p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Why Choose Us?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h4 className="text-xl font-semibold mb-2">Verified Listings</h4>
              <p className="text-gray-600">All ranges verified and up-to-date</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h4 className="text-xl font-semibold mb-2">Mobile Friendly</h4>
              <p className="text-gray-600">Search on any device, anywhere</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🆓</div>
              <h4 className="text-xl font-semibold mb-2">Always Free</h4>
              <p className="text-gray-600">Free to search and browse</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">🏹 Archery Ranges Canada</h3>
              <p className="text-gray-400">
                Your complete directory of archery ranges across Canada
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Range Owners</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/claim" className="hover:text-white">Claim Your Listing</Link></li>
                <li><Link href="/premium" className="hover:text-white">Premium Features</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 Archery Ranges Canada. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}