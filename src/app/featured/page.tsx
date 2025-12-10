'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { supabaseClient } from '@/lib/auth'

interface Province {
  id: string
  name: string
  slug: string
}

interface City {
  id: string
  name: string
  slug: string
  province?: Province
}

interface Range {
  id: string
  name: string
  slug: string
  city_id: string
  range_type: string
  amenities: string[]
  price_range: string
  is_premium?: boolean
  photos?: string[]
  description?: string
  phone?: string
  website?: string
  latitude?: number
  longitude?: number
  city?: City
}

export default function FeaturedPage() {
  const [ranges, setRanges] = useState<Range[]>([])
  const [loading, setLoading] = useState(true)

  const fallbackImages = [
    'https://images.unsplash.com/photo-1574607774561-e645c79a2478?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=800&h=400&fit=crop'
  ]

  useEffect(() => {
    async function fetchFeaturedRanges() {
      const { data, error } = await supabaseClient
        .from('ranges')
        .select('*, city:cities(*, province:provinces(*))')
        .eq('is_premium', true)
        .order('name')

      if (data) {
        setRanges(data as any)
      }
      setLoading(false)
    }
    fetchFeaturedRanges()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-700 to-emerald-800 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <img
              src="/logo.png?v=2"
              alt="Archery Ranges Canada"
              className="h-28 w-auto object-contain"
            />
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="hover:text-green-100 transition-colors font-medium">
              Home
            </Link>
            <Link href="/blog" className="hover:text-green-100 transition-colors font-medium">
              Blog
            </Link>
            <Link href="/compare" className="hover:text-green-100 transition-colors font-medium">
              Compare
            </Link>
            <Link href="/pricing" className="hover:text-green-100 transition-colors font-medium">
              Pricing
            </Link>
            <div className="border-l border-green-600 pl-6 flex items-center space-x-3">
              <Link href="/auth/login" className="hover:text-green-100 transition-colors font-medium">
                Sign In
              </Link>
              <Link href="/auth/signup" className="bg-white text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors">
                Sign Up
              </Link>
            </div>
          </nav>
          <button className="md:hidden text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative text-white bg-gradient-to-br from-green-600 via-green-700 to-green-800">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              ⭐ Premium Featured
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Featured Archery Ranges
          </h1>
          <p className="text-xl text-green-50 mb-6">
            Discover premium archery facilities across Canada
          </p>
          <Link
            href="/"
            className="inline-block text-green-200 hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading featured ranges...</p>
          </div>
        ) : ranges.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Featured Ranges Yet</h2>
            <p className="text-gray-600 mb-8">Check back soon for premium featured listings!</p>
            <Link
              href="/"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold transition-colors"
            >
              Browse All Ranges
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                All Featured Ranges ({ranges.length})
              </h2>
              <p className="text-gray-600 text-lg">
                Premium archery facilities with verified information
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {ranges.map((range, index) => (
                <Link
                  key={range.id}
                  href={'/' + range.city?.province?.slug + '/' + range.city?.slug + '/' + range.slug}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-green-500"
                >
                  <div className="relative h-48 bg-gradient-to-br from-green-400 to-green-600 overflow-hidden">
                    <img
                      src={range.photos && range.photos.length > 0
                        ? range.photos[0]
                        : fallbackImages[index % fallbackImages.length]
                      }
                      alt={range.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = fallbackImages[index % fallbackImages.length]
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        ⭐ PREMIUM
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                        {range.range_type || 'Indoor/Outdoor'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                      {range.name}
                    </h3>
                    <p className="text-gray-600 flex items-center mb-4">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {range.city?.name}, {range.city?.province?.name}
                    </p>

                    {range.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {range.description}
                      </p>
                    )}

                    {range.amenities && range.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {range.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                        {range.amenities.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            +{range.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm">
                        View Details
                      </button>
                      {range.phone && (
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                          📞
                        </button>
                      )}
                      {range.website && (
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                          🌐
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* CTA Section */}
        <section className="mt-20 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Want Your Range Featured Here?
          </h2>
          <p className="text-xl text-green-50 mb-8 max-w-2xl mx-auto">
            Get premium visibility and attract more archers to your facility
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-white text-green-700 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors shadow-lg"
          >
            View Premium Plans
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <img
                src="/logo.png?v=2"
                alt="Archery Ranges Canada"
                className="h-20 w-auto object-contain mb-4"
              />
              <p className="text-gray-400">
                Your complete directory of archery ranges across Canada
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/compare" className="hover:text-white">Compare Ranges</Link></li>
                <li><Link href="/about" className="hover:text-white">About</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Range Owners</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/claim" className="hover:text-white">Claim Your Listing</Link></li>
                <li><Link href="/premium" className="hover:text-white">Premium Features</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/blog" className="hover:text-white">Archery Tips</Link></li>
                <li><Link href="/blog" className="hover:text-white">Beginner Guides</Link></li>
                <li><Link href="/blog" className="hover:text-white">Equipment Reviews</Link></li>
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