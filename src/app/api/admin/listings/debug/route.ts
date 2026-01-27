import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug') || 'a-i-m-archers-in-muskoka'

    // Query the range by slug
    const { data, error } = await supabase
      .from('ranges')
      .select(`
        id,
        name,
        slug,
        city_id,
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
      expectedUrl: data?.cities
        ? `/${(data.cities as any).provinces?.slug}/${(data.cities as any).slug}/${data.slug}`
        : 'Missing city/province data'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
