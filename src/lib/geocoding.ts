/**
 * Shared geocoding utilities
 * Uses the free Nominatim (OpenStreetMap) API — no API key required.
 */

const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'archeryrangescanada.ca/1.0 (contact@archeryrangescanada.ca)'

export interface GeoCoords {
  lat: number
  lng: number
}

/**
 * Geocode a full address string to lat/lng.
 * Returns null if the address cannot be resolved.
 *
 * @param address   Street address (e.g. "4636 Elk Lake Drive")
 * @param city      City name
 * @param province  Province/territory name
 */
export async function geocodeAddress(
  address: string | null,
  city: string | null,
  province: string | null
): Promise<GeoCoords | null> {
  // Build progressively looser queries
  const queries: string[] = []

  if (address && city && province) {
    queries.push(`${address}, ${city}, ${province}, Canada`)
  }
  if (city && province) {
    queries.push(`${city}, ${province}, Canada`)
  }

  for (const q of queries) {
    try {
      const url = new URL(NOMINATIM)
      url.searchParams.set('q', q)
      url.searchParams.set('format', 'json')
      url.searchParams.set('limit', '1')
      url.searchParams.set('countrycodes', 'ca')

      const res = await fetch(url.toString(), {
        headers: { 'User-Agent': USER_AGENT }
      })

      if (!res.ok) continue

      const data: any[] = await res.json()
      if (data.length > 0) {
        return {
          lat: Math.round(parseFloat(data[0].lat) * 1_000_000) / 1_000_000,
          lng: Math.round(parseFloat(data[0].lon) * 1_000_000) / 1_000_000
        }
      }
    } catch {
      // Silently try next query
    }
  }

  return null
}
