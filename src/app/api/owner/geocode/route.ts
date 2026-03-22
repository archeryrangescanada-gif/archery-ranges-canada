import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { geocodeAddress } from '@/lib/geocoding'

export const dynamic = 'force-dynamic'

/**
 * POST /api/owner/geocode
 * Geocodes a street address to lat/lng using Nominatim.
 * Requires an authenticated user session.
 */
export async function POST(request: NextRequest) {
  try {
    const authClient = await createServerClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { address, city, province } = await request.json()

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    const coords = await geocodeAddress(address, city || null, province || null)

    if (coords) {
      return NextResponse.json({ lat: coords.lat, lng: coords.lng })
    }

    return NextResponse.json(
      { error: 'Could not geocode address' },
      { status: 404 }
    )
  } catch (error: any) {
    console.error('Geocode API error:', error)
    return NextResponse.json(
      { error: error.message || 'Geocoding failed' },
      { status: 500 }
    )
  }
}
