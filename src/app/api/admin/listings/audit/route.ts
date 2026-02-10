import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all ranges with their city/province relationships and image data
    const { data: ranges, error } = await supabase
      .from('ranges')
      .select(`
        id,
        name,
        slug,
        city_id,
        post_images,
        cities (
          id,
          name,
          slug,
          province_id,
          provinces (
            id,
            name,
            slug
          )
        )
      `)
      .order('name')

    if (error) {
      console.error('Error fetching ranges:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const issues: Array<{
      id: string
      name: string
      slug: string
      issue: string
      city_id: string | null
      cityName: string | null
      provinceName: string | null
      post_images: any
    }> = []

    const healthy: Array<{
      id: string
      name: string
      slug: string
      cityName: string
      provinceName: string
      post_images: any
    }> = []

    // Image path stats
    const imageStats = {
      noImages: 0,
      stringImages: 0,
      arrayImages: 0,
      uniquePaths: new Set<string>(),
    }

    for (const range of ranges || []) {
      const rangeIssues: string[] = []

      // Cast cities to handle Supabase's nested relationship type
      const city = range.cities as any

      // Check if city_id exists
      if (!range.city_id) {
        rangeIssues.push('Missing city_id')
      }

      // Check if cities relationship exists
      if (!city) {
        rangeIssues.push('No linked city record')
      } else {
        // Check if provinces relationship exists within city
        if (!city.provinces) {
          rangeIssues.push('City has no linked province')
        }
        if (!city.province_id) {
          rangeIssues.push('City missing province_id')
        }
      }

      // Track image stats
      if (!range.post_images) {
        imageStats.noImages++
      } else if (typeof range.post_images === 'string') {
        imageStats.stringImages++
        // Extract the folder path
        const match = range.post_images.match(/^\/([^/]+)\//)
        if (match) imageStats.uniquePaths.add(match[1])
      } else if (Array.isArray(range.post_images)) {
        imageStats.arrayImages++
        range.post_images.forEach((img: string) => {
          const match = img.match(/^\/([^/]+)\//)
          if (match) imageStats.uniquePaths.add(match[1])
        })
      }

      if (rangeIssues.length > 0) {
        issues.push({
          id: range.id,
          name: range.name,
          slug: range.slug,
          issue: rangeIssues.join('; '),
          city_id: range.city_id,
          cityName: city?.name || null,
          provinceName: city?.provinces?.name || null,
          post_images: range.post_images,
        })
      } else {
        healthy.push({
          id: range.id,
          name: range.name,
          slug: range.slug,
          cityName: city.name,
          provinceName: city.provinces.name,
          post_images: range.post_images,
        })
      }
    }

    return NextResponse.json({
      total: ranges?.length || 0,
      healthy: healthy.length,
      issues: issues.length,
      issuesList: issues,
      imageStats: {
        noImages: imageStats.noImages,
        stringImages: imageStats.stringImages,
        arrayImages: imageStats.arrayImages,
        uniqueImageFolders: Array.from(imageStats.uniquePaths),
      },
      summary: {
        missingCityId: issues.filter(i => i.issue.includes('Missing city_id')).length,
        noLinkedCity: issues.filter(i => i.issue.includes('No linked city record')).length,
        noLinkedProvince: issues.filter(i => i.issue.includes('no linked province')).length,
      }
    })
  } catch (error: any) {
    console.error('Audit error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
