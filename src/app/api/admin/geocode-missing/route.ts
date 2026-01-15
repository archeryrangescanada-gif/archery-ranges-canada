import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Free geocoding using Nominatim (OpenStreetMap)
async function geocodeAddress(address: string, city: string, province: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Construct full address
    const fullAddress = `${address}, ${city}, ${province}, Canada`
    const encodedAddress = encodeURIComponent(fullAddress)

    // Use Nominatim (free, no API key required)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&countrycodes=ca`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ArcheryRangesCanada/1.0' // Nominatim requires a user agent
      }
    })

    if (!response.ok) {
      console.error('Geocoding API error:', response.statusText)
      return null
    }

    const data = await response.json()

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      }
    }

    return null
  } catch (error) {
    console.error('Error geocoding address:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🗺️ Starting geocoding process...')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get all ranges without geocoding
    const { data: ranges, error: fetchError } = await supabase
      .from('ranges')
      .select(`
        id,
        name,
        address,
        cities(name),
        provinces(name)
      `)
      .or('latitude.is.null,longitude.is.null')

    if (fetchError) {
      console.error('Error fetching ranges:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!ranges || ranges.length === 0) {
      return NextResponse.json({
        message: 'No listings need geocoding',
        updated: 0
      })
    }

    console.log(`Found ${ranges.length} listings to geocode`)

    const results = []
    let successCount = 0
    let failCount = 0

    // Process each range (with delay to respect rate limits)
    for (const range of ranges) {
      const city = (range.cities as any)?.name || ''
      const province = (range.provinces as any)?.name || ''

      console.log(`Geocoding: ${range.name} - ${range.address}, ${city}, ${province}`)

      const coords = await geocodeAddress(range.address, city, province)

      if (coords) {
        // Update the database
        const { error: updateError } = await supabase
          .from('ranges')
          .update({
            latitude: coords.lat,
            longitude: coords.lng,
            updated_at: new Date().toISOString()
          })
          .eq('id', range.id)

        if (updateError) {
          console.error(`Failed to update ${range.name}:`, updateError)
          failCount++
          results.push({
            id: range.id,
            name: range.name,
            status: 'failed',
            error: updateError.message
          })
        } else {
          console.log(`✅ Updated ${range.name}: ${coords.lat}, ${coords.lng}`)
          successCount++
          results.push({
            id: range.id,
            name: range.name,
            status: 'success',
            latitude: coords.lat,
            longitude: coords.lng
          })
        }
      } else {
        console.error(`❌ Could not geocode ${range.name}`)
        failCount++
        results.push({
          id: range.id,
          name: range.name,
          status: 'failed',
          error: 'Could not find coordinates'
        })
      }

      // Delay between requests to respect rate limits (1 request per second)
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return NextResponse.json({
      message: `Geocoding complete: ${successCount} successful, ${failCount} failed`,
      total: ranges.length,
      successful: successCount,
      failed: failCount,
      results
    })

  } catch (error: any) {
    console.error('Geocoding error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to geocode listings' },
      { status: 500 }
    )
  }
}
