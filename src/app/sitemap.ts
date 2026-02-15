import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient()
    const baseUrl = 'https://archeryrangescanada.ca'

    // Get all provinces
    const { data: provinces } = await supabase
        .from('provinces')
        .select('slug, updated_at')

    // Get all cities that have at least one range
    const { data: cities } = await supabase
        .from('cities')
        .select(`
      slug,
      updated_at,
      provinces!inner (
        slug
      ),
      ranges!inner (
        id
      )
    `)

    // Get all active ranges
    const { data: ranges } = await supabase
        .from('ranges')
        .select(`
      slug,
      updated_at,
      cities!inner (
        slug,
        provinces!inner (
          slug
        )
      )
    `)

    const routes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
    ]

    // Add province routes
    provinces?.forEach((province) => {
        routes.push({
            url: `${baseUrl}/${province.slug}`,
            lastModified: new Date(province.updated_at || new Date()),
            changeFrequency: 'weekly',
            priority: 0.9,
        })
    })

    // Add city routes
    cities?.forEach((city: any) => {
        if (city.ranges && city.ranges.length > 0) {
            routes.push({
                url: `${baseUrl}/${city.provinces.slug}/${city.slug}`,
                lastModified: new Date(city.updated_at || new Date()),
                changeFrequency: 'weekly',
                priority: 0.8,
            })
        }
    })

    // Add range routes
    ranges?.forEach((range: any) => {
        routes.push({
            url: `${baseUrl}/${range.cities.provinces.slug}/${range.cities.slug}/${range.slug}`,
            lastModified: new Date(range.updated_at || new Date()),
            changeFrequency: 'weekly',
            priority: 0.7,
        })
    })

    return routes
}
