import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getCategoryBySlug } from '@/lib/categories'
import { Range } from '@/types/range'
import { RangeCard, RangeCardFeatured } from '@/components/listing/RangeCard'
import { Home, ChevronRight, Target } from 'lucide-react'

export const revalidate = 300

interface PageProps {
  params: { slug: string; province: string; city: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = getCategoryBySlug(params.slug)
  const supabase = await createClient()

  const { data: city } = await supabase
    .from('cities')
    .select('name, provinces!inner(name)')
    .eq('slug', params.city)
    .eq('provinces.slug', params.province)
    .single()

  if (!category || !city) return { title: 'Not Found' }

  const cityData = city as any
  return {
    title: `${category.name} in ${cityData.name}, ${cityData.provinces.name} | Archery Ranges Canada`,
    description: `Find archery ranges offering ${category.name.toLowerCase()} in ${cityData.name}, ${cityData.provinces.name}.`,
  }
}

async function getCategoryRangesInCity(categorySlug: string, provinceSlug: string, citySlug: string) {
  const category = getCategoryBySlug(categorySlug)
  if (!category) return null

  const supabase = await createClient()

  // Get city with province
  const { data: city } = await supabase
    .from('cities')
    .select('id, name, slug, provinces!inner(id, name, slug)')
    .eq('slug', citySlug)
    .eq('provinces.slug', provinceSlug)
    .single()

  if (!city) return null

  const cityData = city as any

  let query = supabase
    .from('ranges')
    .select('*')
    .eq('city_id', cityData.id)
    .order('subscription_tier', { ascending: false })
    .order('name', { ascending: true })

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

  const { data: rawRanges } = await query

  if (!rawRanges) return { category, city: cityData, province: cityData.provinces, ranges: [] }

  // Normalize data (same pattern as [province]/[city]/page.tsx)
  const normalizeToArray = (input: any): string[] => {
    if (!input) return []
    if (Array.isArray(input)) return input
    if (typeof input === 'string') {
      const trimmed = input.trim()
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try { return JSON.parse(trimmed) } catch { return [] }
      }
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const inner = trimmed.slice(1, -1)
        if (!inner) return []
        return inner.split(',').map(item => {
          const t = item.trim()
          return t.startsWith('"') && t.endsWith('"') ? t.slice(1, -1) : t
        }).filter(Boolean)
      }
      return [trimmed]
    }
    return []
  }

  const ranges: Range[] = (rawRanges as any[]).map(item => ({
    ...item,
    post_images: normalizeToArray(item.post_images),
    post_tags: normalizeToArray(item.post_tags),
    bow_types_allowed: normalizeToArray(item.bow_types_allowed),
    business_hours: typeof item.business_hours === 'string'
      ? (() => { try { return JSON.parse(item.business_hours) } catch { return item.business_hours } })()
      : item.business_hours,
  }))

  return { category, city: cityData, province: cityData.provinces, ranges }
}

export default async function CategoryCityPage({ params }: PageProps) {
  const result = await getCategoryRangesInCity(params.slug, params.province, params.city)
  if (!result) notFound()

  const { category, city, province, ranges } = result

  const featuredRanges = ranges.filter(r => r.subscription_tier === 'gold' || r.subscription_tier === 'silver')
  const regularRanges = ranges.filter(r => r.subscription_tier !== 'gold' && r.subscription_tier !== 'silver')

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
            <Link href={`/category/${params.slug}/${params.province}`} className="hover:text-emerald-600">{province.name}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-stone-800 font-medium">{city.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {category.name} in {city.name}
          </h1>
          <p className="text-xl text-yellow-100 max-w-3xl">
            {ranges.length} archery {ranges.length === 1 ? 'range' : 'ranges'} offering {category.name.toLowerCase()} in {city.name}, {province.name}.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        {ranges.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
            <Target className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-stone-800 mb-2">No Ranges Found</h2>
            <p className="text-stone-600 mb-6">
              No ranges offering {category.name.toLowerCase()} were found in {city.name}.
            </p>
            <Link href={`/category/${params.slug}/${params.province}`} className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition-colors">
              Try Another City
            </Link>
          </div>
        ) : (
          <>
            {featuredRanges.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">Featured</span>
                </div>
                <div className="space-y-6">
                  {featuredRanges.map((range) => (
                    <RangeCardFeatured key={range.id} range={range} provinceSlug={params.province} citySlug={params.city} />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(featuredRanges.length > 0 ? regularRanges : ranges).map((range) => (
                <RangeCard key={range.id} range={range} provinceSlug={params.province} citySlug={params.city} />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
