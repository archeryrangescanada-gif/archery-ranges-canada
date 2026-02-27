import { Metadata } from 'next'
import Link from 'next/link'
import { createClient, createStaticClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Home, ChevronRight, MapPin, Target, ArrowRight } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ClaimListingBanner } from '@/components/listing/ClaimListingBanner'

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
    description: 'Ontario is home to Canada\'s largest archery community with facilities ranging from Olympic-level training centers in Toronto to scenic outdoor courses in Muskoka. The province boasts a strong network of clubs affiliated with the Ontario Association of Archers (OAA), hosting regular tournaments, indoor winter leagues, and youth development programs year-round.',
    popularCities: ['Toronto', 'Ottawa', 'Hamilton', 'Mississauga', 'London', 'Windsor', 'Barrie', 'Kingston'],
    topActivities: ['3D target shooting', 'Olympic recurve training', 'Bowhunting courses', 'Youth development programs', 'Indoor winter leagues']
  },
  'british-columbia': {
    description: 'British Columbia offers stunning outdoor archery experiences with ranges set against mountain backdrops, plus world-class indoor facilities in Vancouver and Victoria. BC\'s diverse terrain makes it ideal for field archery and 3D courses, while the mild coastal climate allows for year-round outdoor shooting. The province is home to many clubs affiliated with the BC Archery Association, offering programs for all skill levels from beginner to competitive.',
    popularCities: ['Vancouver', 'Victoria', 'Kelowna', 'Surrey', 'Burnaby', 'Nanaimo', 'Kamloops'],
    topActivities: ['Mountain field archery', 'Traditional bow shooting', '3D forest courses', 'Olympic-style target archery', 'Beginner introduction courses']
  },
  'alberta': {
    description: 'Alberta\'s archery scene combines prairie hunting traditions with modern indoor ranges, particularly strong in Calgary and Edmonton. The province is well known for its bowhunting culture, with many ranges offering specialized courses for elk, deer, and big game preparation. Alberta is home to numerous clubs under the Alberta Federation of Shooting Sports (AFSS), providing opportunities for target archery, 3D shooting, and competitive tournaments throughout the year.',
    popularCities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'Medicine Hat', 'Sherwood Park', 'Cochrane'],
    topActivities: ['Bowhunting preparation courses', 'Compound bow training', '3D target shoots', 'Field archery', 'Youth and family programs']
  },
  'quebec': {
    description: 'Quebec has a vibrant archery culture with bilingual instruction available at most facilities, from Montreal\'s urban ranges to rural Laurentian courses. The province is served by the F\u00e9d\u00e9ration de tir \u00e0 l\'arc du Qu\u00e9bec (FTAQ), which organizes provincial championships, regional tournaments, and youth programs. Quebec\'s four-season climate supports both indoor winter leagues and beautiful outdoor summer shooting.',
    popularCities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Sherbrooke', 'Trois-Rivi\u00e8res'],
    topActivities: ['Traditional archery', 'Youth programs', 'Winter indoor leagues', 'Outdoor field courses', 'Provincial tournament circuits']
  },
  'saskatchewan': {
    description: 'Saskatchewan\'s wide-open prairies provide a unique backdrop for archery, with a strong emphasis on bowhunting and outdoor field shooting. The province\'s archery clubs offer welcoming communities for beginners and experienced archers alike, with regular 3D shoots and tournaments throughout the warmer months and indoor ranges keeping archers active through the winter.',
    popularCities: ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw'],
    topActivities: ['Bowhunting preparation', '3D outdoor shoots', 'Indoor winter leagues', 'Compound and recurve training']
  },
  'manitoba': {
    description: 'Manitoba offers a growing archery community centered around Winnipeg and Brandon, with clubs providing year-round shooting opportunities. The province\'s archers enjoy access to both indoor facilities for winter practice and scenic outdoor ranges during the summer months. Manitoba\'s archery organizations host regular tournaments and promote youth participation in the sport.',
    popularCities: ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson'],
    topActivities: ['Indoor target archery', '3D shooting events', 'Bowhunting courses', 'Youth introduction programs']
  },
  'nova-scotia': {
    description: 'Nova Scotia\'s archery community thrives in a beautiful maritime setting, with ranges offering both indoor and outdoor experiences. The province\'s clubs cater to all levels, from casual recreational shooting to competitive tournament archery. Nova Scotia\'s mild maritime climate allows for an extended outdoor shooting season compared to other eastern provinces.',
    popularCities: ['Halifax', 'Dartmouth', 'Sydney', 'Truro'],
    topActivities: ['Recreational target archery', '3D forest courses', 'Traditional bow shooting', 'Beginner lessons']
  },
  'new-brunswick': {
    description: 'New Brunswick offers a close-knit archery community with clubs spread across the province, from the Saint John River Valley to the Acadian coast. Archers enjoy a mix of indoor ranges for year-round practice and outdoor courses set in the province\'s scenic woodlands.',
    popularCities: ['Fredericton', 'Saint John', 'Moncton', 'Bathurst'],
    topActivities: ['Indoor target practice', 'Woodland 3D courses', 'Bowhunting preparation', 'Family archery programs']
  },
  'newfoundland-and-labrador': {
    description: 'Newfoundland and Labrador\'s rugged landscape provides a dramatic setting for outdoor archery. The province\'s archery clubs offer dedicated facilities for both target and field archery, with a strong tradition of bowhunting given the province\'s rich wildlife heritage.',
    popularCities: ['St. John\'s', 'Corner Brook', 'Mount Pearl', 'Conception Bay South'],
    topActivities: ['Field archery', 'Bowhunting courses', 'Indoor target practice', 'Traditional archery']
  },
  'prince-edward-island': {
    description: 'Prince Edward Island may be Canada\'s smallest province, but its archery community is passionate and welcoming. PEI\'s ranges offer a friendly atmosphere for archers of all skill levels, with opportunities for both indoor and outdoor shooting on the island.',
    popularCities: ['Charlottetown', 'Summerside'],
    topActivities: ['Recreational archery', 'Indoor target shooting', 'Youth programs', 'Beginner lessons']
  },
  'default': {
    description: 'Discover archery facilities across this province, from indoor target ranges to outdoor field courses. Canada\'s archery community is welcoming to all skill levels, whether you\'re a complete beginner or an experienced competitive archer.',
    popularCities: [],
    topActivities: ['Indoor target practice', 'Beginner lessons', '3D archery', 'Bowhunting preparation']
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
    title: `Archery Ranges in ${province.name}, Canada (${new Date().getFullYear()}) | ${totalRanges}+ Ranges & Clubs`,
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

  // Sort cities alphabetically
  const sortedCities = [...cities].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const citiesWithRanges = sortedCities.filter(city => rangeCounts[city.id] > 0)
  // Removed citiesWithoutRanges to prevent indexing empty pages
  // Removed citiesWithoutRanges to prevent indexing empty pages

  // Group cities by first letter for Ontario (or if there are many cities)
  const cityGroups: Record<string, City[]> = {}
  if (provinceSlug === 'ontario' || citiesWithRanges.length > 20) {
    citiesWithRanges.forEach(city => {
      const firstLetter = city.name.charAt(0).toUpperCase()
      if (!cityGroups[firstLetter]) cityGroups[firstLetter] = []
      cityGroups[firstLetter].push(city)
    })
  }

  const sortedLetters = Object.keys(cityGroups).sort()

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

      {/* Claim CTA Banner */}
      <div className="container mx-auto px-4 py-4">
        <ClaimListingBanner />
      </div>

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

            {sortedLetters.length > 0 ? (
              <div className="space-y-12">
                {sortedLetters.map(letter => (
                  <div key={letter} className="relative">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-stone-800 text-white w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold shadow-sm">
                        {letter}
                      </div>
                      <div className="h-px flex-1 bg-stone-200"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {cityGroups[letter].map((city: City) => (
                        <Link
                          key={city.id}
                          href={`/${provinceSlug}/${city.slug}`}
                          className="group flex justify-between items-center p-4 bg-white rounded-xl border border-stone-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-200"
                        >
                          <span className="font-semibold text-stone-700 group-hover:text-emerald-700 truncate pr-2">
                            {city.name}
                          </span>
                          <span className="shrink-0 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                            {rangeCounts[city.id]}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
            )}
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
            <div className="space-y-3">
              <p className="text-stone-700 leading-relaxed">{info.description}</p>
              <p className="text-stone-700 leading-relaxed">
                {province.name} offers {totalRanges} archery {totalRanges === 1 ? 'facility' : 'facilities'} across{' '}
                {citiesWithRanges.length} {citiesWithRanges.length === 1 ? 'city' : 'cities'}.
                Whether you&apos;re looking for indoor target practice, outdoor 3D courses, or professional coaching,
                you&apos;ll find options to match your skill level and interests.
              </p>

              {info.topActivities.length > 0 && (
                <p className="text-stone-700 leading-relaxed">
                  Popular archery activities in {province.name} include {info.topActivities.join(', ')}.
                </p>
              )}

              {info.popularCities.length > 0 && (
                <p className="text-stone-700 leading-relaxed">
                  Top cities for archery in {province.name} include {info.popularCities.join(', ')}.
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

    return provinces?.map((province) => ({
      province: province.slug,
    })) || []
  } catch (error) {
    console.error('Build error fetching provinces:', error)
    return []
  }
}