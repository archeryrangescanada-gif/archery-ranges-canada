/**
 * Update all listings from canada_archery_ranges_listings.csv
 * - Skips the 9 claimed/DO NOT TOUCH listings
 * - Does NOT update description (post_content) or images (post_images)
 * - Updates each listing one at a time with full logging
 */

const fs = require('fs')
const path = require('path')
const Papa = require('papaparse')
const { createClient } = require('@supabase/supabase-js')

// Load env
require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ─── DO NOT TOUCH (claimed listings) ──────────────────────────────────────────
const DO_NOT_TOUCH = new Set([
  'Springbrook Archers',
  'Capital Region Archery Club',
  'Aylmer Golden Feather A.C.',
  'The Barn Archers',
  'Ottawa Archers',
  'Forest City Archers',
  'Cowichan Bowmen',
  'Port Colborne & District Conservation Club',
  'Victoria Bowmen',
])

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toBool(val) {
  if (val === null || val === undefined || val === '') return false
  return val.toString().toLowerCase() === 'yes' || val === true || val === '1'
}

function toNum(val) {
  if (val === null || val === undefined || val === '') return null
  const n = parseFloat(val)
  return isNaN(n) ? null : n
}

function toStr(val) {
  if (val === null || val === undefined || val === '') return null
  const s = val.toString().trim()
  return s === '' ? null : s
}

function normalizeFacilityType(val) {
  if (!val) return null
  const v = val.toString().toLowerCase()
  if (v === 'indoor') return 'Indoor'
  if (v === 'outdoor') return 'Outdoor'
  if (v === 'both') return 'Both'
  return null
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const csvPath = path.join(__dirname, '../canada_archery_ranges_listings.csv')
  const raw = fs.readFileSync(csvPath, 'utf-8')

  const { data: rows, errors } = Papa.parse(raw, {
    header: true,
    skipEmptyLines: true,
  })

  if (errors.length) {
    console.error('CSV parse errors:', errors)
  }

  console.log(`\n📋 CSV loaded: ${rows.length} rows`)

  // Pre-fetch all provinces and cities once
  const { data: provinces } = await supabase.from('provinces').select('id, name')
  const { data: cities } = await supabase.from('cities').select('id, name, province_id')

  const provinceMap = new Map(provinces.map(p => [p.name.toLowerCase(), p.id]))
  // city map keyed by "cityname|provinceid" for disambiguation
  const cityMap = new Map(cities.map(c => [`${c.name.toLowerCase()}|${c.province_id}`, c.id]))

  let updated = 0, skipped = 0, notFound = 0, failed = 0

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const name = toStr(row.post_title)

    if (!name) {
      console.log(`  [${i + 1}/${rows.length}] ⚠️  Skipping row with no name`)
      skipped++
      continue
    }

    if (DO_NOT_TOUCH.has(name)) {
      console.log(`  [${i + 1}/${rows.length}] 🔒 SKIP (claimed): ${name}`)
      skipped++
      continue
    }

    // Find the range in the DB by name (case-insensitive)
    const { data: matches, error: findError } = await supabase
      .from('ranges')
      .select('id, name')
      .ilike('name', name)
      .limit(5)

    if (findError) {
      console.log(`  [${i + 1}/${rows.length}] ❌ DB error looking up "${name}": ${findError.message}`)
      failed++
      continue
    }

    if (!matches || matches.length === 0) {
      console.log(`  [${i + 1}/${rows.length}] ❓ Not found in DB: "${name}"`)
      notFound++
      continue
    }

    // If multiple matches, pick the first (name is usually unique enough)
    const rangeId = matches[0].id

    // Resolve city_id and province_id
    const provinceName = toStr(row.post_region)
    const cityName = toStr(row.post_city)
    const provinceId = provinceName ? (provinceMap.get(provinceName.toLowerCase()) || null) : null
    const cityId = (cityName && provinceId)
      ? (cityMap.get(`${cityName.toLowerCase()}|${provinceId}`) || null)
      : null

    // Build update payload — NO description, NO images
    const updates = {
      // Address
      address: toStr(row.post_address),
      postal_code: toStr(row.post_zip),
      latitude: toNum(row.post_latitude),
      longitude: toNum(row.post_longitude),

      // Location FK
      ...(cityId ? { city_id: cityId } : {}),
      ...(provinceId ? { province_id: provinceId } : {}),

      // Contact
      phone_number: toStr(row.phone),
      email: toStr(row.email),
      website: toStr(row.website),

      // Meta
      post_tags: toStr(row.post_tags),
      business_hours: toStr(row.business_hours),

      // Range specs
      range_length_yards: toNum(row.range_length_yards),
      number_of_lanes: toNum(row.number_of_lanes),
      facility_type: normalizeFacilityType(row.facility_type),

      // Features
      has_pro_shop: toBool(row.has_pro_shop),
      has_3d_course: toBool(row.has_3d_course),
      has_field_course: toBool(row.has_field_course),
      equipment_rental_available: toBool(row.equipment_rental_available),
      lessons_available: toBool(row.lessons_available),
      accessibility: toBool(row.accessibility),
      parking_available: toBool(row.parking_available),

      // Membership & pricing
      membership_required: toBool(row.membership_required),
      membership_price_adult: toNum(row.membership_price_adult),
      drop_in_price: toNum(row.drop_in_price),
      lesson_price_range: toStr(row.lesson_price_range),
      bow_types_allowed: toStr(row.bow_types_allowed),

      updated_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabase
      .from('ranges')
      .update(updates)
      .eq('id', rangeId)

    if (updateError) {
      console.log(`  [${i + 1}/${rows.length}] ❌ FAILED: "${name}" — ${updateError.message}`)
      failed++
    } else {
      console.log(`  [${i + 1}/${rows.length}] ✅ Updated: "${name}"`)
      updated++
    }
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Updated:   ${updated}
🔒 Skipped:   ${skipped}  (claimed or no name)
❓ Not found: ${notFound}
❌ Failed:    ${failed}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
