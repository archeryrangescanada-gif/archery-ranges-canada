import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/server'
import { notFound } from 'next/navigation'

interface Range {
  id: string
  name: string
  slug: string
  address: string
  phone_number: string | null
  website: string | null
  description: string | null
  is_featured: boolean
}

interface City {
  id: string
  name: string
  slug: string
  province_id: string
}

interface Province {
  id: string
  name: string
  slug: string
}

interface PageProps {
  params: {
    province: string
    city: string
  }
}

export default async function CityPage({ params }: PageProps) {
  const { province: provinceSlug, city: citySlug } = params

  const { data: province } = await supabase
    .from('provinces')
    .select('*')
    .eq('slug', provinceSlug)
    .single()

  if (!province) notFound()

  const { data: city } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', citySlug)
    .eq('province_id', province.id)
    .single()

  if (!city) notFound()

  const { data: allRanges } = await supabase
    .from('ranges')
    .select('*')
    .eq('city_id', city.id)
    .order('is_featured', { ascending: false })
    .order('name')

  const featuredRanges = allRanges?.filter(r => r.is_featured) || []
  const regularRanges = allRanges?.filter(r => !r.is_featured) || []

  const { data: nearbyCities } = await supabase
    .from('cities')
    .select('*')
    .eq('province_id', province.id)
    .neq('id', city.id)
    .order('name')
    .limit(6)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-700 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-2xl font-bold hover:text-green-100 transition-colors">
            🏹 Archery Ranges Canada
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">Home</Link>
            <span>/</span>
            <Link href={`/${provinceSlug}`} className="hover:text-green-600">{province.name}</Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">{city.name}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Archery Ranges in {city.name}, {province.name}
          </h1>
          <p className="text-xl text-gray-600">
            Discover the best archery ranges, clubs, and facilities in {city.name}
          </p>
        </div>

        {/* Featured Ranges */}
        {featuredRanges.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-yellow-500 mr-2">⭐</span>
              Featured Ranges
            </h2>
            <div className="space-y-6">
              {featuredRanges.map((range: Range) => (
                <div
                  key={range.id}
                  className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-400 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Link href={`/${provinceSlug}/${citySlug}/${range.slug}`}>
                      <h3 className="text-2xl font-bold text-gray-900 hover:text-green-600 transition-colors">
                        {range.name}
                      </h3>
                    </Link>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      FEATURED
                    </span>
                  </div>
                  
                  {range.description && (
                    <p className="text-gray-700 mb-4">{range.description}</p>
                  )}
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div className="flex items-start">
                      <span className="text-xl mr-2">📍</span>
                      <div>
                        <p className="font-semibold">Address</p>
                        <p className="text-gray-600">{range.address}</p>
                      </div>
                    </div>
                    {range.phone_number && (
                      <div className="flex items-start">
                        <span className="text-xl mr-2">📞</span>
                        <div>
                          <p className="font-semibold">Phone</p>
                          <a href={`tel:${range.phone_number}`} className="text-green-600 hover:underline">
                            {range.phone_number}
                          </a>
                        </div>
                      </div>
                    )}
                    {range.website && (
                      <div className="flex items-start">
                        <span className="text-xl mr-2">🌐</span>
                        <div>
                          <p className="font-semibold">Website</p>
                          
                            href={range.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/${provinceSlug}/${citySlug}/${range.slug}`}
                    className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    View Full Details →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Regular Ranges */}
        {regularRanges.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {featuredRanges.length > 0 ? 'More ' : ''}Archery Ranges in {city.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {regularRanges.map((range: Range) => (
                <div key={range.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-green-500 hover:shadow-lg transition-all">
                  <Link href={`/${provinceSlug}/${citySlug}/${range.slug}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-green-600 transition-colors">
                      {range.name}
                    </h3>
                  </Link>
                  
                  {range.description && (
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{range.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm mb-4">
                    <p className="flex items-center text-gray-700">
                      <span className="font-semibold mr-2">📍</span>
                      {range.address}
                    </p>
                    {range.phone_number && (
                      <p className="flex items-center">
                        <span className="font-semibold mr-2">📞</span>
                        <a href={`tel:${range.phone_number}`} className="text-green-600 hover:underline">
                          {range.phone_number}
                        </a>
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/${provinceSlug}/${citySlug}/${range.slug}`}
                    className="inline-block text-green-600 hover:text-green-700 font-semibold"
                  >
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* No Ranges Message */}
        {allRanges?.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <span className="text-6xl mb-4 block">🎯</span>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Ranges Listed Yet</h3>
            <p className="text-gray-600 mb-6">
              We haven't added any archery ranges for {city.name} yet.
            </p>
            <p className="text-sm text-gray-500">
              Are you a range owner? Contact us to get your facility listed!
            </p>
          </div>
        )}

        {/* FAQ Section */}
        <section className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions About Archery in {city.name}
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What types of archery ranges are in {city.name}?
              </h3>
              <p className="text-gray-700">
                {city.name} offers various archery facilities including indoor target ranges, 
                outdoor field courses, and 3D archery ranges suitable for all skill levels.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do I need my own equipment?
              </h3>
              <p className="text-gray-700">
                Many archery ranges in {city.name} offer equipment rentals for beginners. 
                Contact the specific range for details on rental availability and pricing.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Are archery lessons available in {city.name}?
              </h3>
              <p className="text-gray-700">
                Most archery ranges in {city.name} offer lessons for beginners and advanced archers. 
                Check with individual facilities for class schedules and pricing.
              </p>
            </div>
          </div>
        </section>

        {/* Nearby Cities */}
        {nearbyCities && nearbyCities.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Archery Ranges in Nearby Cities
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {nearbyCities.map((nearbyCity: City) => (
                <Link
                  key={nearbyCity.id}
                  href={`/${provinceSlug}/${nearbyCity.slug}`}
                  className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all text-center"
                >
                  <p className="text-gray-900 font-medium hover:text-green-600">
                    {nearbyCity.name}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2025 Archery Ranges Canada. All rights reserved.</p>
          <p className="text-sm text-gray-400">
            Find archery ranges in {city.name}, {province.name}
          </p>
        </div>
      </footer>
    </div>
  )
}

export async function generateStaticParams() {
  const { data: provinces } = await supabase
    .from('provinces')
    .select('id, slug')

  if (!provinces) return []

  const params: Array<{ province: string; city: string }> = []

  for (const province of provinces) {
    const { data: cities } = await supabase
      .from('cities')
      .select('slug')
      .eq('province_id', province.id)

    if (cities) {
      cities.forEach(city => {
        params.push({
          province: province.slug,
          city: city.slug,
        })
      })
    }
  }

  return params
}