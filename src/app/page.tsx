'use client'


import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { supabaseClient } from '@/lib/auth'
import SearchFilters from '@/components/SearchFilters'
import ReportRangeModal from '@/components/ReportRangeModal'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { trackSearch, trackProvinceSelected } from '@/lib/analytics'
import { Province, City } from '@/types/database'

interface Range {
  id: string
  name: string
  slug: string
  facility_type?: string | null
  price_range?: string | null
  photos?: string[] | null
  description?: string | null
  is_premium?: boolean
  is_featured?: boolean
  latitude?: number | null
  longitude?: number | null
  city?: City | null
  amenities?: string[] | null
  distance?: number
  phone_number?: string | null
  website?: string | null
}

interface SearchResult {
  type: 'province' | 'city' | 'range'
  id: string
  name: string
  slug: string
  parentName?: string | null
  provinceSlug?: string | null
  citySlug?: string | null
}

interface FilterState {
  rangeType: string[]
  amenities: string[]
  priceRange: string[]
}

interface UserLocation {
  latitude: number
  longitude: number
  city?: string
  province?: string
}

export default function Home() {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [ranges, setRanges] = useState<Range[]>([])
  const [featuredRanges, setFeaturedRanges] = useState<Range[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    rangeType: [],
    amenities: [],
    priceRange: []
  })
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lon: number; name: string } | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Track search performed with debounce
  useEffect(() => {
    if (!searchQuery.trim()) return

    const timer = setTimeout(() => {
      trackSearch(searchQuery.trim())
    }, 1000) // Track after 1 second of inactivity

    return () => clearTimeout(timer)
  }, [searchQuery])

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return Math.round(distance * 10) / 10
  }

  const getUserLocation = () => {
    setLocationLoading(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // 1. Digital Reverse Geocoding (Town-level precision via Nominatim)
          let detectedCityName = 'Toronto'
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`, {
              headers: {
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'ArcheryRangesCanada/1.0'
              }
            })
            const geoData = await response.json()
            detectedCityName = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.municipality || 'Toronto'
          } catch (apiErr) {
            console.warn('Reverse geocode API failed, falling back to coordinate matching:', apiErr)
          }

          // 2. Match against our database cities
          // Try exact match first
          let matchedCity = cities.find(c => c.name.toLowerCase() === detectedCityName.toLowerCase())

          // 3. Fallback: Coordinate-based matching if no name match or API failed
          if (!matchedCity) {
            matchedCity = cities.reduce((nearest, city) => {
              if (!city.latitude || !city.longitude) return nearest
              const distance = calculateDistance(latitude, longitude, city.latitude, city.longitude)
              if (!nearest || distance < nearest.distance) {
                return { city, distance }
              }
              return nearest
            }, undefined as { city: City; distance: number } | undefined)?.city || undefined
          }

          setUserLocation({
            latitude,
            longitude,
            city: matchedCity?.name || detectedCityName,
            province: matchedCity?.province?.name
          })
        } catch (error) {
          console.error('Error in location detection:', error)
          setLocationError('Could not determine your city')
        }

        setLocationLoading(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        let errorMessage = 'Location access denied'

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please check your device settings.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.'
            break
          default:
            errorMessage = 'Could not get your location. Please try again or search manually.'
        }

        setLocationError(errorMessage)
        setLocationLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  }

  useEffect(() => {
    async function fetchData() {
      const { data: provincesData } = await supabaseClient
        .from('provinces')
        .select('*')
        .order('name')

      const { data: citiesData } = await supabaseClient
        .from('cities')
        .select('*, province:provinces(*)')
        .order('name')

      const { data: rangesData } = await supabaseClient
        .from('ranges')
        .select('id, name, slug, facility_type, price_range, photos, description, is_premium, is_featured, latitude, longitude, city:cities(*, province:provinces(*))')
        .order('name')

      if (provincesData) setProvinces(provincesData as Province[])
      if (citiesData) setCities(citiesData as City[])
      if (rangesData) {
        const normalized = (rangesData as any[]).map(item => ({
          ...item,
          photos: typeof item.photos === 'string'
            ? item.photos.split(',').map((s: string) => s.trim()).filter(Boolean)
            : Array.isArray(item.photos) ? item.photos : [],
          amenities: typeof item.amenities === 'string'
            ? item.amenities.split(',').map((s: string) => s.trim()).filter(Boolean)
            : Array.isArray(item.amenities) ? item.amenities : []
        }))
        setRanges(normalized as unknown as Range[])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (cities.length > 0) {
      getUserLocation()
    }
  }, [cities])

  useEffect(() => {
    // Filter and sort for the featured section
    const featuredCandidateList = ranges.filter(r => r.is_premium || r.is_featured);

    // Sort: Featured first, then Premium
    featuredCandidateList.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return 0;
    });

    setFeaturedRanges(featuredCandidateList.slice(0, 6));

    const referenceLocation = searchLocation || (userLocation ? {
      lat: userLocation.latitude,
      lon: userLocation.longitude,
      name: userLocation.city || 'Your Location'
    } : null)

    if (referenceLocation) {
      const rangesWithDistance = featuredCandidateList.map(range => ({
        ...range,
        distance: range.latitude && range.longitude
          ? calculateDistance(
            referenceLocation.lat,
            referenceLocation.lon,
            range.latitude,
            range.longitude
          )
          : Infinity
      }))

      const nearby = rangesWithDistance
        .filter(r => (r.distance || Infinity) <= 100) // 100km radius restriction
        .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
        .slice(0, 6)

      setFeaturedRanges(nearby)
    } else {
      setFeaturedRanges(featuredCandidateList.slice(0, 6))
    }
  }, [ranges, userLocation, searchLocation])

  useEffect(() => {
    if (!searchQuery.trim() && filters.rangeType.length === 0 && filters.amenities.length === 0 && filters.priceRange.length === 0) {
      setSearchResults([])
      setSearchLocation(null)
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const results: SearchResult[] = []

    const fuzzyMatch = (text: string, search: string): boolean => {
      const textLower = text.toLowerCase()
      if (textLower.includes(search)) return true
      const searchWords = search.split(' ')
      return searchWords.every(word => textLower.includes(word))
    }

    let filteredRanges = ranges

    if (filters.rangeType.length > 0) {
      filteredRanges = filteredRanges.filter(r => r.facility_type && filters.rangeType.includes(r.facility_type))
    }

    if (filters.amenities.length > 0) {
      filteredRanges = filteredRanges.filter(r =>
        filters.amenities.some(amenity => r.amenities?.includes(amenity))
      )
    }

    if (filters.priceRange.length > 0) {
      filteredRanges = filteredRanges.filter(r => r.price_range && filters.priceRange.includes(r.price_range))
    }

    if (!query || query === '') {
      provinces.forEach(province => {
        results.push({
          type: 'province',
          id: province.id,
          name: province.name,
          slug: province.slug,
        })
      })
    } else {
      provinces.forEach(province => {
        if (fuzzyMatch(province.name, query)) {
          results.push({
            type: 'province',
            id: province.id,
            name: province.name,
            slug: province.slug,
          })
        }
      })

      cities.forEach(city => {
        if (fuzzyMatch(city.name, query)) {
          results.push({
            type: 'city',
            id: city.id,
            name: city.name,
            slug: city.slug || '',
            parentName: city.province?.name,
            provinceSlug: city.province?.slug,
          })

          if (city.latitude && city.longitude) {
            setSearchLocation({
              lat: city.latitude,
              lon: city.longitude,
              name: city.name + ', ' + city.province?.name
            })
          }
        }
      })
    }

    filteredRanges.forEach(range => {
      if (!query || fuzzyMatch(range.name, query)) {
        results.push({
          type: 'range',
          id: range.id,
          name: range.name,
          slug: range.slug,
          parentName: range.city?.name ? `${range.city.name}, ${range.city.province?.name || ''}` : undefined,
          provinceSlug: range.city?.province?.slug,
          citySlug: range.city?.slug,
        })
      }
    })

    setSearchResults(results)

    if (results.length > 0 && (query || filters.rangeType.length > 0 || filters.amenities.length > 0 || filters.priceRange.length > 0)) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    }
  }, [searchQuery, filters, provinces, cities, ranges])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const hasActiveFilters = filters.rangeType.length > 0 || filters.amenities.length > 0 || filters.priceRange.length > 0

  const getLocationDisplayName = () => {
    if (searchLocation) return searchLocation.name
    if (userLocation) return userLocation.city || 'Your Area'
    return 'Featured'
  }

  const locationDisplayName = getLocationDisplayName()

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative text-white">
        <div className="absolute inset-0">
          <img
            src="/hero-bg.png?v=1"
            alt="Archery background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-60"></div>
        </div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Archery Near Me <span className="mx-6 align-middle">|</span> Canadian Archery Range Directory
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-green-50">
            Find local archery ranges and clubs across Canada. Search by province, city, or range name to discover facilities near you.
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by province, city, or range name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 pr-20 sm:pr-32 text-sm sm:text-lg text-gray-800 rounded-full shadow-2xl focus:outline-none focus:ring-4 focus:ring-green-300 placeholder:text-sm sm:placeholder:text-base"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white px-4 sm:px-8 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-semibold transition-colors whitespace-nowrap">
                Search
              </button>
            </div>

            <div className="flex items-center justify-center space-x-4 mt-4 flex-wrap gap-2">
              <p className="text-green-100 text-sm">
                {provinces.length} provinces • {cities.length} cities • {ranges.length} ranges
              </p>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={'text-sm px-4 py-2 rounded-full transition-colors ' + (hasActiveFilters || showFilters ? 'bg-white text-green-700 font-bold' : 'bg-white/20 text-white hover:bg-white/30')}
              >
                🔧 Filters {hasActiveFilters && '(' + (filters.rangeType.length + filters.amenities.length + filters.priceRange.length) + ')'}
              </button>

              {userLocation ? (
                <div className="text-sm px-4 py-2 rounded-full bg-green-500 text-white flex items-center gap-2">
                  📍 {userLocation.city || 'Location Detected'}
                </div>
              ) : locationLoading ? (
                <div className="text-sm px-4 py-2 rounded-full bg-white/20 text-white flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Detecting...
                </div>
              ) : (
                <button
                  onClick={getUserLocation}
                  className="text-sm px-4 py-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center gap-2"
                >
                  📍 Enable Location
                </button>
              )}
            </div>

            {locationError && (
              <div className="mt-2 text-yellow-200 text-sm">
                {locationError}
              </div>
            )}

            {(searchQuery.trim() !== '' || hasActiveFilters) && (
              <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 inline-block">
                <p className="text-white font-semibold">
                  {searchResults.length > 0
                    ? 'Found ' + searchResults.length + ' result' + (searchResults.length !== 1 ? 's' : '')
                    : 'No results found - try different keywords or filters'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        {showFilters && (
          <div className="mb-12 max-w-7xl mx-auto">
            <SearchFilters onFilterChange={handleFilterChange} />
          </div>
        )}

        {(searchQuery.trim() === '' && !hasActiveFilters && featuredRanges.length > 0) && (
          <section className="mb-20">
            <div className="text-center mb-12">
              <div className="inline-block">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  ⭐ Premium Featured
                </span>
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mt-4 mb-4">
                Featured Archery Clubs & Ranges Near {locationDisplayName}
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                {searchLocation || userLocation
                  ? 'Top-rated ranges in ' + locationDisplayName
                  : 'Top-rated ranges with premium listings'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {featuredRanges.map((range, index) => (
                <Link
                  key={range.id}
                  href={'/' + range.city?.province?.slug + '/' + range.city?.slug + '/' + range.slug}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-green-500"
                >
                  <div className="relative h-48 bg-gradient-to-br from-green-400 to-green-600 overflow-hidden">
                    <img
                      src={range.photos && range.photos.length > 0
                        ? range.photos[0]
                        : 'https://images.unsplash.com/photo-1574607774561-e645c79a2478?w=800&h=400&fit=crop'
                      }
                      alt={range.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        ⭐ PREMIUM
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <span className="bg-white/90 backdrop-blur-sm text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                        {range.facility_type || 'Indoor/Outdoor'}
                      </span>
                      {range.distance !== undefined && range.distance !== Infinity && (
                        <span className="bg-blue-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                          📍 {range.distance} km
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                      {range.name} – {range.city?.name || 'Local'}, Ontario
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
                        {range.description} This public archery range offers indoor facilities and equipment rentals.
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
                      {range.phone_number && (
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

            <div className="text-center mt-8">
              <Link
                href="/featured"
                className="inline-block bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
              >
                View All Featured Ranges →
              </Link>
            </div>
          </section>
        )}

        <section ref={resultsRef}>
          {(searchQuery.trim() !== '' || hasActiveFilters) && searchResults.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                {searchQuery ? 'Search Results' : 'Filtered Results'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((result) => (
                  <Link
                    key={result.type + '-' + result.id}
                    onClick={() => {
                      if (result.type === 'province') {
                        trackProvinceSelected(result.name)
                      }
                    }}
                    href={
                      result.type === 'province'
                        ? '/' + result.slug
                        : result.type === 'city'
                          ? '/' + result.provinceSlug + '/' + result.slug
                          : '/' + result.provinceSlug + '/' + result.citySlug + '/' + result.slug
                    }
                    className="group bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-green-500 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="text-xs font-semibold text-green-600 uppercase">
                          {result.type}
                        </span>
                        <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                          {result.name}
                        </h3>
                        {result.parentName && (
                          <p className="text-sm text-gray-600 mt-1">{result.parentName}</p>
                        )}
                      </div>
                      <span className="text-2xl">
                        {result.type === 'province' ? '🍁' : result.type === 'city' ? '🏙️' : '🎯'}
                      </span>
                    </div>
                    <p className="text-green-600 font-medium group-hover:underline">
                      View details →
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {(searchQuery.trim() === '' && !hasActiveFilters) && (
          <section className="mb-16">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/hero-banner.png?v=1"
                alt="Most Accurate Archery Directory in Canada"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                <div className="container mx-auto px-8">
                  <div className="max-w-2xl">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                      MOST ACCURATE ARCHERY DIRECTORY IN CANADA
                    </h2>
                    <p className="text-xl text-green-200 mb-6">
                      If we don't have an archery range in your area, please notify us so we can improve your experience
                    </p>
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-lg"
                    >
                      Notify Missing Ranges
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {(searchQuery.trim() === '' && !hasActiveFilters) && (
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Explore Archery Ranges by Province
              </h2>
              <p className="text-gray-600 text-lg">
                Select your province to find nearby archery ranges
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading provinces...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {provinces.map((province) => (
                  <Link
                    key={province.id}
                    href={'/' + province.slug}
                    onClick={() => trackProvinceSelected(province.name)}
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
        )}
      </main>

      <Footer />

      <ReportRangeModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />
    </div >
  )
}