/**
 * Fix 6 manually-researched listings that couldn't be auto-geocoded
 * Run: npx tsx scripts/fix-manual-coords.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.ARCHERY_ADMIN_SERVICE_KEY ||
  process.env.SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

/**
 * Manually verified coordinates for the 6 listings Nominatim couldn't resolve.
 *
 * Sources:
 *  - Archers Route 17         : archerynb.ca → 299 Route 180, Saint-Quentin NB E8A 2K9
 *  - Simcoe County Gun Club   : simcoecountygunclub.com → PO Box 341 Port McNicoll; range in
 *                               Penetanguishene area — using Penetanguishene town centre coords
 *  - Toronto School of Archery: archerytoronto.ca → primary location 590 Rathburn Rd (Etobicoke Olympium)
 *  - Waterloo County Bowmen   : waterloocountybowmen.ca + maptons.com → 1440a Jigs Hollow Rd, West Montrose
 *  - Rogue's Hollow Archery   : rogueshollowarchery.com/contact → 420 Barrett Road, Centreville ON K0K 1N0
 *  - Barrie Gun Club          : barriegunclub.org + maptons.com → 3619 County Rd 40 RR#2, Springwater
 */
const MANUAL_FIXES: {
  name: string
  correctAddress: string
  lat: number
  lng: number
}[] = [
  {
    name: 'Archers Route 17',
    correctAddress: '299 Route 180, Saint-Quentin, NB E8A 2K9',
    lat: 47.511916,
    lng: -67.392129,
  },
  {
    name: 'Simcoe County Gun Club',
    correctAddress: 'Midland / Penetanguishene area, ON (PO Box 341, Port McNicoll)',
    lat: 44.765500,
    lng: -79.918800,
  },
  {
    name: 'Toronto School of Archery',
    correctAddress: '590 Rathburn Road, Etobicoke (Olympium), Toronto, ON',
    lat: 43.623100,
    lng: -79.569400,
  },
  {
    name: 'Waterloo County Bowmen',
    correctAddress: '1440a Jigs Hollow Rd, West Montrose, Woolwich Township, ON N0B 2V0',
    lat: 43.575424,
    lng: -80.495720,
  },
  {
    name: "Rogue's Hollow Archery Adventure",
    correctAddress: '420 Barrett Road, Centreville, ON K0K 1N0',
    lat: 44.357500,
    lng: -76.984500,
  },
  {
    name: 'Barrie Gun Club',
    correctAddress: '3619 County Road 40 RR#2, Springwater, ON L4M 4S4',
    lat: 44.354779,
    lng: -79.804235,
  },
]

async function main() {
  console.log('\n' + '═'.repeat(60))
  console.log('🔧  Applying 6 manually-researched coordinate fixes')
  console.log('═'.repeat(60) + '\n')

  let updated = 0
  let failed = 0

  for (const fix of MANUAL_FIXES) {
    // Look up the listing by name (case-insensitive)
    const { data: ranges, error: fetchErr } = await supabase
      .from('ranges')
      .select('id, name, latitude, longitude')
      .ilike('name', fix.name)

    if (fetchErr) {
      console.error(`❌  Error fetching "${fix.name}": ${fetchErr.message}`)
      failed++
      continue
    }

    if (!ranges || ranges.length === 0) {
      console.warn(`⚠️   Not found in DB: "${fix.name}"`)
      failed++
      continue
    }

    const range = ranges[0]
    console.log(`📍  ${range.name}`)
    console.log(`    Address : ${fix.correctAddress}`)
    console.log(`    Old     : ${range.latitude ?? 'NULL'}, ${range.longitude ?? 'NULL'}`)
    console.log(`    New     : ${fix.lat}, ${fix.lng}`)

    const { error: updateErr } = await supabase
      .from('ranges')
      .update({
        latitude: fix.lat,
        longitude: fix.lng,
        address: fix.correctAddress,
        updated_at: new Date().toISOString(),
      })
      .eq('id', range.id)

    if (updateErr) {
      console.error(`    ❌  Update failed: ${updateErr.message}`)
      failed++
    } else {
      console.log(`    ✅  Updated\n`)
      updated++
    }
  }

  console.log('═'.repeat(60))
  console.log(`📊  Done: ${updated} updated, ${failed} failed`)
  console.log('═'.repeat(60) + '\n')
}

main().catch(err => {
  console.error('💥', err)
  process.exit(1)
})
