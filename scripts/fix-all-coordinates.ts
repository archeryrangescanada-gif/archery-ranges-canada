import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

/**
 * Fix All Listing Coordinates
 * ===========================
 * Re-geocodes every listing in the `ranges` table using its stored address,
 * city, province and country via the free Nominatim API (no API key needed).
 *
 * Run with:
 *   npx tsx scripts/fix-all-coordinates.ts
 *
 * Add --apply flag to actually write the updates:
 *   npx tsx scripts/fix-all-coordinates.ts --apply
 */

import { createClient } from '@supabase/supabase-js'

// ─── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN = !process.argv.includes('--apply')
const DELAY_MS = 1100      // Nominatim requires ≥1 req/sec
const NOMINATIM  = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'archeryrangescanada.ca/coord-fix (contact@archeryrangescanada.ca)'

// ─── Supabase ─────────────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.ARCHERY_ADMIN_SERVICE_KEY ||
  process.env.SERVICE_ROLE_KEY ||
  process.env.ADMIN_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ─── Types ───────────────────────────────────────────────────────────────────

interface Range {
  id: string
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  city: string | null
  province: string | null
}

interface GeoResult {
  id: string
  name: string
  oldLat: number | null
  oldLng: number | null
  newLat: number | null
  newLng: number | null
  query: string
  status: 'updated' | 'no_change' | 'not_found' | 'skipped' | 'error'
  error?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function roundCoord(n: number) {
  return Math.round(n * 1_000_000) / 1_000_000  // 6 decimal places
}

async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = new URL(NOMINATIM)
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')
  url.searchParams.set('countrycodes', 'ca')

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': USER_AGENT }
  })

  if (!res.ok) {
    throw new Error(`Nominatim HTTP ${res.status}`)
  }

  const data: any[] = await res.json()
  if (!data.length) return null

  return {
    lat: roundCoord(parseFloat(data[0].lat)),
    lng: roundCoord(parseFloat(data[0].lon))
  }
}

/**
 * Build progressively looser geocoding queries.
 * Try the most specific first; fall back to city+province if the full address fails.
 */
function buildQueries(range: Range): string[] {
  const parts = [
    range.address,
    range.city,
    range.province,
    'Canada'
  ].filter(Boolean)

  const queries: string[] = []

  // Full: "123 Main St, Ottawa, Ontario, Canada"
  if (parts.length >= 3) queries.push(parts.join(', '))

  // Without address: "Ottawa, Ontario, Canada"
  if (range.city && range.province) {
    queries.push(`${range.city}, ${range.province}, Canada`)
  }

  return queries
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${'═'.repeat(70)}`)
  console.log(`🗺️   Fix All Listing Coordinates  ${DRY_RUN ? '(DRY RUN)' : '(LIVE – writing to DB)'}`)
  console.log(`${'═'.repeat(70)}\n`)

  if (DRY_RUN) {
    console.log('ℹ️   No changes will be written. Add --apply to save fixes.\n')
  }

  // ── Fetch all ranges ──────────────────────────────────────────────────────

  const { data: rawRanges, error } = await supabase
    .from('ranges')
    .select(`
      id,
      name,
      address,
      latitude,
      longitude,
      cities!inner(name),
      provinces!inner(name)
    `)
    .order('provinces(name)', { ascending: true })

  if (error) {
    console.error('❌  Failed to fetch ranges:', error.message)
    process.exit(1)
  }

  const ranges: Range[] = (rawRanges as any[]).map(r => ({
    id: r.id,
    name: r.name,
    address: r.address,
    latitude: r.latitude,
    longitude: r.longitude,
    city: r.cities?.name ?? null,
    province: r.provinces?.name ?? null,
  }))

  console.log(`📊  Total listings to process: ${ranges.length}\n`)

  // ── Process each range ────────────────────────────────────────────────────

  const results: GeoResult[] = []
  let updated = 0, noChange = 0, notFound = 0, skipped = 0, errors = 0

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i]
    const prefix = `[${String(i + 1).padStart(3, '0')}/${ranges.length}]`

    // Skip listings with no address AND no city (nothing to geocode)
    if (!range.address && !range.city) {
      console.log(`${prefix} ⏭️   SKIP  ${range.name} — no address data`)
      results.push({ id: range.id, name: range.name, oldLat: range.latitude, oldLng: range.longitude, newLat: null, newLng: null, query: '', status: 'skipped' })
      skipped++
      continue
    }

    const queries = buildQueries(range)
    let geo: { lat: number; lng: number } | null = null
    let usedQuery = ''

    for (const q of queries) {
      try {
        await sleep(DELAY_MS)
        geo = await geocode(q)
        if (geo) { usedQuery = q; break }
      } catch (err: any) {
        console.warn(`${prefix} ⚠️   Nominatim error for "${q}": ${err.message}`)
      }
    }

    if (!geo) {
      console.log(`${prefix} ❌  NOT FOUND  ${range.name}`)
      results.push({ id: range.id, name: range.name, oldLat: range.latitude, oldLng: range.longitude, newLat: null, newLng: null, query: queries[0], status: 'not_found' })
      notFound++
      continue
    }

    // Check if this is actually different from what's stored
    const latSame = range.latitude !== null && Math.abs(range.latitude - geo.lat) < 0.0001
    const lngSame = range.longitude !== null && Math.abs(range.longitude - geo.lng) < 0.0001

    if (latSame && lngSame) {
      console.log(`${prefix} ✅  OK        ${range.name}  (${geo.lat}, ${geo.lng})`)
      results.push({ id: range.id, name: range.name, oldLat: range.latitude, oldLng: range.longitude, newLat: geo.lat, newLng: geo.lng, query: usedQuery, status: 'no_change' })
      noChange++
      continue
    }

    // Log the change
    const oldPos = range.latitude !== null ? `${range.latitude}, ${range.longitude}` : 'NULL'
    console.log(`${prefix} 📍  FIX       ${range.name}`)
    console.log(`           Old: ${oldPos}`)
    console.log(`           New: ${geo.lat}, ${geo.lng}`)
    console.log(`           Via: "${usedQuery}"`)

    if (!DRY_RUN) {
      const { error: updateErr } = await supabase
        .from('ranges')
        .update({ latitude: geo.lat, longitude: geo.lng })
        .eq('id', range.id)

      if (updateErr) {
        console.error(`           ❌  DB update failed: ${updateErr.message}`)
        results.push({ id: range.id, name: range.name, oldLat: range.latitude, oldLng: range.longitude, newLat: geo.lat, newLng: geo.lng, query: usedQuery, status: 'error', error: updateErr.message })
        errors++
        continue
      }
    }

    results.push({ id: range.id, name: range.name, oldLat: range.latitude, oldLng: range.longitude, newLat: geo.lat, newLng: geo.lng, query: usedQuery, status: 'updated' })
    updated++
  }

  // ── Summary ───────────────────────────────────────────────────────────────

  console.log(`\n${'═'.repeat(70)}`)
  console.log('📊  SUMMARY')
  console.log(`${'═'.repeat(70)}`)
  console.log(`  ✅  Coordinates already correct : ${noChange}`)
  console.log(`  📍  Coordinates ${DRY_RUN ? 'WOULD BE fixed' : 'fixed'}         : ${updated}`)
  console.log(`  ❌  Not found via Nominatim     : ${notFound}`)
  console.log(`  ⏭️   Skipped (no address data)   : ${skipped}`)
  if (errors) console.log(`  🔴  DB update errors            : ${errors}`)
  console.log()

  if (notFound > 0) {
    console.log('⚠️   Listings not found (need manual review):')
    results.filter(r => r.status === 'not_found').forEach(r => {
      console.log(`     • ${r.name}  [query: "${r.query}"]`)
    })
    console.log()
  }

  if (DRY_RUN && updated > 0) {
    console.log(`💡  Run with --apply to write ${updated} coordinate fix(es) to Supabase.\n`)
  } else if (!DRY_RUN) {
    console.log(`🎉  Done! ${updated} listing(s) updated in Supabase.\n`)
  }
}

main().catch(err => {
  console.error('💥  Unexpected error:', err)
  process.exit(1)
})
