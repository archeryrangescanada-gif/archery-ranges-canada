import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const province = searchParams.get('province')

    // If province is specified, get ranges from that province
    if (province) {
      const { data, error } = await supabase
        .from('ranges')
        .select(`
          id,
          name,
          slug,
          post_images,
          cities (
            name,
            slug,
            provinces (
              name,
              slug
            )
          )
        `)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Filter by province
      const filtered = data?.filter((r: any) =>
        r.cities?.provinces?.slug === province ||
        r.cities?.provinces?.name?.toLowerCase().includes(province.toLowerCase())
      ).slice(0, 5)

      return NextResponse.json({
        ranges: filtered,
        count: filtered?.length || 0,
      })
    }

    // Query a specific range by slug
    if (!slug) {
      return NextResponse.json({ error: 'Provide either slug or province parameter' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('ranges')
      .select(`
        id,
        name,
        slug,
        city_id,
        post_images,
        video_urls,
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
      .eq('slug', slug)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
    }

    return NextResponse.json({
      range: data,
      imageInfo: {
        post_images: data?.post_images,
        post_images_type: typeof data?.post_images,
        isArray: Array.isArray(data?.post_images),
      },
      expectedUrl: data?.cities
        ? `/${(data.cities as any).provinces?.slug}/${(data.cities as any).slug}/${data.slug}`
        : 'Missing city/province data'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
