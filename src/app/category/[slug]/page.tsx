import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getCategoryBySlug, CATEGORIES } from '@/lib/categories'
import { Home, ChevronRight, MapPin } from 'lucide-react'

export const revalidate = 300

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = getCategoryBySlug(params.slug)
  if (!category) return { title: 'Category Not Found' }
  return {
    title: `${category.name} - Archery Ranges Canada`,
    description: category.description,
  }
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }))
}

async function getCategoryRangesByProvince(slug: string) {
  const category = getCategoryBySlug(slug)
  if (!category) return null

  const supabase = await createClient()

  let query = supabase
    .from('ranges')
    .select(`
      id,
      cities!inner (
        id, name, slug,
        provinces!inner (
          id, name, slug
        )
      )
    `)

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

  if (!ranges) return { category, provinces: [] }

  // Group by province
  const provinceMap = new Map<string, { name: string; slug: string; count: number }>()
  for (const range of ranges as any[]) {
    const province = range.cities?.provinces
    if (!province) continue
    const existing = provinceMap.get(province.slug)
    if (existing) {
      existing.count++
    } else {
      provinceMap.set(province.slug, {
        name: province.name,
        slug: province.slug,
        count: 1,
      })
    }
  }

  const provinces = Array.from(provinceMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  return { category, provinces }
}

export default async function CategoryPage({ params }: PageProps) {
  const result = await getCategoryRangesByProvince(params.slug)
  if (!result) notFound()

  const { category, provinces } = result

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-stone-500">
            <Link href="/" className="hover:text-emerald-600 flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/category" className="hover:text-emerald-600">Categories</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-stone-800 font-medium">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-yellow-500 via-yellow-600 to-amber-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {category.name}
          </h1>
          <p className="text-xl text-yellow-100 max-w-3xl mb-6">
            {category.description}
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 inline-block">
            <p className="text-3xl font-bold">{provinces.reduce((sum, p) => sum + p.count, 0)}</p>
            <p className="text-sm text-yellow-200">Ranges Found</p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-stone-800 mb-6">
          Select a Province
        </h2>

        {provinces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {provinces.map((province) => (
              <Link
                key={province.slug}
                href={`/category/${params.slug}/${province.slug}`}
                className="group bg-white rounded-xl border border-stone-200 p-6 hover:shadow-lg hover:border-yellow-400 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-stone-800 group-hover:text-yellow-700 transition-colors">
                    {province.name}
                  </h3>
                  <span className="bg-yellow-100 text-yellow-800 text-sm font-bold px-2.5 py-1 rounded-full">
                    {province.count}
                  </span>
                </div>
                <p className="text-yellow-600 font-medium text-sm group-hover:underline">
                  View cities &rarr;
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
            <MapPin className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-stone-800 mb-2">No Ranges Found</h2>
            <p className="text-stone-600 mb-6">
              We haven&apos;t found any ranges offering {category.name.toLowerCase()} yet.
            </p>
            <Link href="/category" className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition-colors">
              Browse Other Categories
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
