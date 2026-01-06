import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ ranges: [] })
    }

    // Get all ranges and filter client-side for better fuzzy matching
    const { data, error } = await supabase
      .from('ranges')
      .select(`
        id,
        name,
        address,
        facility_type,
        owner_id,
        cities!inner(name),
        provinces!inner(name)
      `)
      .limit(200)

    if (error) {
      console.error('[Search API] Error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Filter for unclaimed listings and fuzzy search
    const searchTerm = query.trim().toLowerCase().replace(/\s+/g, '')

    const filtered = data?.filter((r: any) => {
      if (r.owner_id) return false // Skip claimed ranges

      // Remove spaces from name and address for fuzzy matching
      const nameLower = (r.name || '').toLowerCase().replace(/\s+/g, '')
      const addressLower = (r.address || '').toLowerCase().replace(/\s+/g, '')
      const cityName = (r.cities?.name || '').toLowerCase().replace(/\s+/g, '')
      const provinceName = (r.provinces?.name || '').toLowerCase().replace(/\s+/g, '')

      return nameLower.includes(searchTerm) ||
             addressLower.includes(searchTerm) ||
             cityName.includes(searchTerm) ||
             provinceName.includes(searchTerm)
    }) || []

    console.log('[Search API] Query:', query, 'Returning', filtered.length, 'unclaimed ranges')
    if (filtered.length > 0) {
      console.log('[Search API] Sample result:', filtered[0]?.name)
    }

    return NextResponse.json({ ranges: filtered.slice(0, 20) })

  } catch (error: any) {
    console.error('[Search API] Exception:', error)
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    )
  }
}
