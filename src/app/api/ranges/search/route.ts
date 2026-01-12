import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase/api'
import { SearchRangeResult } from '@/types/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('[Search API] Starting search request')

    const supabase = getSupabaseClient()
    console.log('[Search API] Supabase client created')

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    console.log('[Search API] Query parameter:', query)

    if (!query || query.trim().length === 0) {
      console.log('[Search API] Empty query, returning empty results')
      return NextResponse.json({ ranges: [] })
    }

    const searchTerm = query.trim().toLowerCase()
    console.log('[Search API] Searching for:', searchTerm)

    // Use SQL filtering with Supabase .or() and .ilike() for server-side search
    const { data, error } = await supabase
      .from('ranges')
      .select(`
        id,
        name,
        address,
        facility_type,
        owner_id,
        cities(name),
        provinces(name)
      `)
      .is('owner_id', null) // Only unclaimed ranges
      .ilike('name', `%${searchTerm}%`)
      .limit(20)

    if (error) {
      console.error('[Search API] Database error:', error)
      console.error('[Search API] Error details:', JSON.stringify(error))
      return NextResponse.json(
        { error: error.message || 'Database query failed' },
        { status: 500 }
      )
    }

    const results: SearchRangeResult[] = (data || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      address: r.address,
      facility_type: r.facility_type,
      owner_id: r.owner_id,
      cities: r.cities ? { name: r.cities.name } : null,
      provinces: r.provinces ? { name: r.provinces.name } : null
    }))

    console.log('[Search API] Query:', query, 'Returning', results.length, 'unclaimed ranges')
    if (results.length > 0) {
      console.log('[Search API] Sample result:', results[0]?.name)
    }

    return NextResponse.json({ ranges: results })

  } catch (error: any) {
    console.error('[Search API] Exception:', error)
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    )
  }
}
