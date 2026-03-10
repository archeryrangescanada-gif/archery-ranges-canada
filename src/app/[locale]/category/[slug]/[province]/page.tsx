import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getCategoryBySlug } from '@/lib/categories'
import { Home, ChevronRight, Target } from 'lucide-react'

export const revalidate = 300

interface PageProps {
  params: { slug: string; province: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = getCategoryBySlug(params.slug)
  const supabase = await createClient()
  const { data: province } = await supabase
    .from('provinces')
    .select('name')
    .eq('slug', params.province)
    .single()

  if (!category || !province) return { title: 'Not Found' }

  return {
    title: `${category.name} in ${province.name} | Archery Ranges Canada`,
    description: `Find archery ranges offering ${category.name.toLowerCase()} in ${province.name}, Canada.`,
  }
}

async function getCategoryRangesInProvince(categorySlug: string, provinceSlug: string) {
  const category = getCategoryBySlug(categorySlug)
  if (!category) return null

  const supabase = await createClient()

  const { data: province } = await supabase
    .from('provinces')
    .select('id, name, slug')
    .eq('slug', provinceSlug)
    .single()

  if (!province) return null

  let query = supabase
    .from('ranges')
    .select(`
      id, name,
      cities!inner (
        id, name, slug, province_id,
        provinces!inner (id, name, slug)
      )
    `)
    .eq('cities.province_id', province.id)

  // Apply category filter
  if (category.queryType === 'boolean_field' && category.booleanFields) {
    query = query.eq(category.booleanFields[0], true)
  } else if (category.queryType === 'combined' && category.booleanFields) {
    const orFilters = category.booleanFields.map(f => `${f}.eq.true`).join(',')
    query = query.or(orFilters)
  } else if (category.queryType === 'post_tags') {
    const filters: string[] = []
    if (category.tagPatterns) {
      category.tagPatterns.forEach(tag => {
        filters.push(`post_tags.ilike.%${tag}%`)
      })
    }
    if (category.textPatterns) {
      category.textPatterns.forEach(pattern => {
        filters.push(`description.ilike.%${pattern}%`)
        filters.push(`post_content.ilike.%${pattern}%`)
      })
    }
    if (filters.length > 0) {
      query = query.or(filters.join(','))
    }
  }

  const { data: ranges } = await query

  if (!ranges) return { category, province, cities: [] }

  // Group by city
  const cityMap = new Map<string, { name: string; slug: string; count: number }>()
  for (const range of ranges as any[]) {
    const city = range.cities
    if (!city) continue
    const existing = cityMap.get(city.slug)
    if (existing) {
      existing.count++
    } else {
      cityMap.set(city.slug, {
        name: city.name,
        slug: city.slug,
        count: 1,
      })
    }
  }

  const cities = Array.from(cityMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  return { category, province, cities }
}

export default async function CategoryProvincePage({ params }: PageProps) {
  const result = await getCategoryRangesInProvince(params.slug, params.province)
  if (!result) notFound()

  const { category, province, cities } = result

  // Group cities by first letter for alphabetical sections
  const cityGroups = new Map<string, typeof cities>()
  for (const city of cities) {
    const letter = city.name.charAt(0).toUpperCase()
    const group = cityGroups.get(letter) || []
    group.push(city)
    cityGroups.set(letter, group)
  }
  const sortedLetters = Array.from(cityGroups.keys()).sort()

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-stone-500 flex-wrap">
            <Link href="/" className="hover:text-emerald-600 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/category" className="hover:text-emerald-600">Categories</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/category/${params.slug}`} className="hover:text-emerald-600">{category.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-stone-800 font-medium">{province.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {category.name} in {province.name}
          </h1>
          <p className="text-xl text-yellow-100 max-w-3xl mb-6">
            {cities.reduce((sum, c) => sum + c.count, 0)} archery {cities.reduce((sum, c) => sum + c.count, 0) === 1 ? 'range' : 'ranges'} offering {category.name.toLowerCase()} across {cities.length} {cities.length === 1 ? 'city' : 'cities'} in {province.name}.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        {cities.length > 0 ? (
          <div className="space-y-8">
            {sortedLetters.map((letter) => {
              const letterCities = cityGroups.get(letter) || []
              return (
                <div key={letter}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-stone-800 text-white flex items-center justify-center font-bold text-sm">
                      {letter}
                    </div>
                    <div className="h-px flex-1 bg-stone-200" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {letterCities.map((city) => (
                      <Link
                        key={city.slug}
                        href={`/category/${params.slug}/${params.province}/${city.slug}`}
                        className="group bg-white rounded-lg border border-stone-200 px-4 py-3 hover:border-yellow-400 hover:shadow-sm transition-all flex items-center justify-between"
                      >
                        <span className="font-medium text-stone-700 group-hover:text-yellow-700 transition-colors">
                          {city.name}
                        </span>
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">
                          {city.count}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
            <Target className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-stone-800 mb-2">No Ranges Found</h2>
            <p className="text-stone-600 mb-6">
              No ranges offering {category.name.toLowerCase()} were found in {province.name}.
            </p>
            <Link href={`/category/${params.slug}`} className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition-colors">
              Try Another Province
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
