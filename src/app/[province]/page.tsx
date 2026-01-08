import { Metadata } from 'next'
import Link from 'next/link'
import { createClient, createStaticClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Home, ChevronRight, MapPin, Target, ArrowRight } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

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
  }
}

// Province-specific SEO data
const provinceInfo: Record<string, {
  description: string;
  popularCities: string[];
  topActivities: string[];
}> = {
  'ontario': {
    description: 'Ontario is home to Canada\'s largest archery community with facilities ranging from Olympic-level training centers in Toronto to scenic outdoor courses in Muskoka.',
    popularCities: ['Toronto', 'Ottawa', 'Hamilton', 'Mississauga', 'London'],
    topActivities: ['3D target shooting', 'Olympic recurve training', 'Bowhunting courses']
  },
  'british-columbia': {
    description: 'British Columbia offers stunning outdoor archery experiences with ranges set against mountain backdrops, plus world-class indoor facilities in Vancouver and Victoria.',
    popularCities: ['Vancouver', 'Victoria', 'Kelowna', 'Surrey', 'Burnaby'],
    topActivities: ['Mountain field archery', 'Traditional bow making', 'Wildlife archery courses']
  },
  'alberta': {
    description: 'Alberta\'s archery scene combines prairie hunting traditions with modern indoor ranges, particularly strong in Calgary and Edmonton.',
    popularCities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge'],
    topActivities: ['Elk hunting preparation', 'Compound bow training', '3D shoots']
  },
  'quebec': {
    description: 'Quebec has a vibrant archery culture with bilingual instruction available at most facilities, from Montreal\'s urban ranges to rural Laurentian courses.',
    popularCities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau'],
    topActivities: ['Traditional archery', 'Youth programs', 'Winter indoor leagues']
  },
  'default': {
    description: 'Discover archery facilities across this province, from indoor target ranges to outdoor field courses.',
    popularCities: [],
    topActivities: ['Indoor target practice', 'Beginner lessons', '3D archery']
  }
}

async function getProvinceData(provinceSlug: string) {
  const supabase = await createClient()

  const { data: province, error } = await supabase
    .from('provinces')
    .select('*')
    .eq('slug', provinceSlug)
    .single()

  if (error || !province) return null
  return province
}

async function getCitiesWithRangeCounts(provinceId: string) {
  const supabase = await createClient()

  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .eq('province_id', provinceId)
    .order('name')

  const cityIds = cities?.map(city => city.id) || []
  const { data: ranges } = await supabase
    .from('ranges')
    .select('city_id')
    .in('city_id', cityIds)

  const rangeCounts: Record<string, number> = {}
  ranges?.forEach(range => {
    rangeCounts[range.city_id] = (rangeCounts[range.city_id] || 0) + 1
  })

  return { cities: cities || [], rangeCounts, totalRanges: ranges?.length || 0 }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const province = await getProvinceData(params.province)

  if (!province) {
    return { title: 'Province Not Found | Archery Ranges Canada' }
  }

  const { totalRanges } = await getCitiesWithRangeCounts(province.id)

  return {
    title: `Archery Ranges in ${province.name}, Canada (2025) | ${totalRanges}+ Ranges & Clubs`,
    description: `Find ${totalRanges}+ archery ranges in ${province.name}. Browse by city to find indoor/outdoor ranges, lessons, and pro shops near you. Compare prices and amenities.`,
    openGraph: {
      title: `Archery Ranges in ${province.name}`,
      description: `Discover archery facilities across ${province.name}. Indoor & outdoor ranges with lessons.`,
      type: 'website',
    },
  }
}

export default async function ProvincePage({ params }: PageProps) {
  const supabase = await createClient()
  const { province: provinceSlug } = params

  const province = await getProvinceData(provinceSlug)

  if (!province) {
    notFound()
  }

  const { cities, rangeCounts, totalRanges } = await getCitiesWithRangeCounts(province.id)
  const info = provinceInfo[provinceSlug] || provinceInfo['default']

  // Sort cities by range count (most ranges first)
  const sortedCities = [...cities].sort((a, b) =>
    (rangeCounts[b.id] || 0) - (rangeCounts[a.id] || 0)
  )

  const citiesWithRanges = sortedCities.filter(city => rangeCounts[city.id] > 0)
  const citiesWithoutRanges = sortedCities.filter(city => !rangeCounts[city.id])

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Header */}
      <Header />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4">
          <ol className="flex items-center gap-1 py-4 text-sm">
            <li className="flex items-center">
              <Link href="/" className="flex items-center gap-1.5 text-stone-600 hover:text-emerald-600 transition-colors">
                <Home className="w-4 h-4" />
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 text-stone-400 mx-2" />
              <span className="text-stone-800 font-medium">{province.name}</span>
            </li>
          </ol>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-emerald-300" />
            <span className="text-emerald-200">Canada</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Archery Ranges in {province.name}
          </h1>

          <p className="text-xl text-emerald-100 max-w-3xl mb-6">
            {info.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
              <p className="text-3xl font-bold">{totalRanges}</p>
              <p className="text-sm text-emerald-200">Total Ranges</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
              <p className="text-3xl font-bold">{citiesWithRanges.length}</p>
              <p className="text-sm text-emerald-200">Cities</p>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        {/* Cities with Ranges */}
        {citiesWithRanges.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-stone-800 mb-6">
              Cities with Archery Ranges
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {citiesWithRanges.map((city: City) => (
                <Link
                  key={city.id}
                  href={`/${provinceSlug}/${city.slug}`}
                  className="group block p-6 bg-white rounded-xl shadow-sm border border-stone-200 hover:shadow-lg hover:border-emerald-300 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-stone-800 group-hover:text-emerald-600 transition-colors">
                      {city.name}
                    </h3>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                      {rangeCounts[city.id]} {rangeCounts[city.id] === 1 ? 'range' : 'ranges'}
                    </span>
                  </div>
                  <p className="text-stone-500 text-sm mb-3">
                    Find archery ranges, lessons & pro shops
                  </p>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-sm group-hover:gap-2 transition-all">
                    View ranges <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Cities without Ranges */}
        {citiesWithoutRanges.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-stone-700 mb-4">
              Other Cities in {province.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {citiesWithoutRanges.slice(0, 20).map((city: City) => (
                <Link
                  key={city.id}
                  href={`/${provinceSlug}/${city.slug}`}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-emerald-100 text-stone-600 hover:text-emerald-700 rounded-full text-sm transition-colors"
                >
                  {city.name}
                </Link>
              ))}
              {citiesWithoutRanges.length > 20 && (
                <span className="px-3 py-1.5 text-stone-400 text-sm">
                  +{citiesWithoutRanges.length - 20} more
                </span>
              )}
            </div>
          </section>
        )}

        {/* No Cities */}
        {cities.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-stone-200">
            <Target className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-stone-800 mb-2">Coming Soon</h2>
            <p className="text-stone-600 mb-6">
              We're adding archery ranges in {province.name}. Check back soon!
            </p>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors">
              Browse All Provinces
            </Link>
          </div>
        )}

        {/* SEO Content */}
        {totalRanges > 0 && (
          <section className="bg-white rounded-xl border border-stone-200 p-8">
            <h2 className="text-xl font-bold text-stone-800 mb-4">
              About Archery in {province.name}
            </h2>
            <div className="prose prose-stone max-w-none">
              <p>
                {province.name} offers {totalRanges} archery {totalRanges === 1 ? 'facility' : 'facilities'} across
                {citiesWithRanges.length} {citiesWithRanges.length === 1 ? 'city' : 'cities'}.
                Whether you're looking for indoor target practice, outdoor 3D courses, or professional coaching,
                you'll find options to match your skill level and interests.
              </p>

              {info.topActivities.length > 0 && (
                <p>
                  Popular archery activities in {province.name} include {info.topActivities.join(', ')}.
                </p>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export async function generateStaticParams() {
  try {
    const supabase = createStaticClient()
    const { data: provinces } = await supabase
      .from('provinces')
      .select('slug')

    return provinces?.map((province: any) => ({
      province: province.slug,
    })) || []
  } catch (error) {
    console.error('Build error fetching provinces:', error)
    return []
  }
}