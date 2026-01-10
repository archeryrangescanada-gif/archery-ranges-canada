import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 1. Rate Limiting
    const ip = getClientIp()
    const { success, remaining, reset } = await rateLimit(ip, 30, 60000) // 30 req/min

    if (!success) {
        return NextResponse.json(
            { error: 'Too many requests' },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': '30',
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': reset.toString()
                }
            }
        )
    }

    const supabase = await createClient()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ ranges: [] })
    }

    if (query.length > 100) {
        return NextResponse.json({ error: 'Query too long' }, { status: 400 })
    }

    const searchTerm = `%${query.trim()}%`

    // Perform server-side filtering
    // Note: Cross-table OR is limited without RPC, so we select a batch and filter.
    const { data, error } = await supabase
      .from('ranges')
      .select(`
        id,
        name,
        address,
        slug,
        facility_type,
        owner_id,
        city:cities!inner(name),
        province:provinces!inner(name)
      `)
      .or(`name.ilike.${searchTerm},address.ilike.${searchTerm}`)
      .limit(50)

    if (error) {
      logger.error('[Search API] Error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Secondary client-side filter for strict relation matching (City/Province)
    const cleanTerm = query.trim().toLowerCase().replace(/\s+/g, '')

    const filtered = (data || []).filter((r: any) => {
      if (r.owner_id) return false // Skip claimed ranges

      const nameLower = (r.name || '').toLowerCase().replace(/\s+/g, '')
      const addressLower = (r.address || '').toLowerCase().replace(/\s+/g, '')
      const cityName = (r.city?.name || '').toLowerCase().replace(/\s+/g, '')
      const provinceName = (r.province?.name || '').toLowerCase().replace(/\s+/g, '')

      return nameLower.includes(cleanTerm) ||
             addressLower.includes(cleanTerm) ||
             cityName.includes(cleanTerm) ||
             provinceName.includes(cleanTerm)
    })

    return NextResponse.json({ ranges: filtered.slice(0, 20) }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString()
      }
    })

  } catch (error: any) {
    logger.error('[Search API] Exception:', error)
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    )
  }
}
