/**
 * Insert the 25 listings from the CSV that don't exist in the DB yet.
 * Processes one at a time with full logging.
 * Does NOT insert description (post_content) or images.
 */

const fs = require('fs')
const path = require('path')
const Papa = require('papaparse')
const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// The 25 not-found names from the update run
const TO_INSERT = new Set([
  'Yellowhead Arrow Launchers Association (YALA)',
  'Lakeland Archers',
  'Vermillion Archers',
  'Rising Tide Custom Bows',
  'Archery Canada Centre of Excellence - Cambridge 2022',
  'Chesley Community Archery Club',
  'Durham Archers',
  'Ontario Centre for Classical Sport',
  'Archery 2 You',
  'Parkline Archery Club',
  'Woods North Archery',
  'Lanark County Bowhunters Organization',
  'Saugeen Shafts',
  'Antler River Archery',
  'Archery Source Canada',
  'Dunnville Hunters & Anglers',
  'Evolve Archery Canada',
  'Hamilton Angling & Hunting Association',
  'Hart House Archery Club (University of Toronto)',
  'Huronia Handgun Club (Huronia Family Archery)',
  'Lambton-Kent Archers',
  'The Bow Shop',
  'University of Waterloo Archery Club',
  'West Nipissing Archers (Sturgeon Falls Rod and Gun Club)',
  'Central Queen\'s Archery Club',
])

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
function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function main() {
  const csvPath = path.join(__dirname, '../canada_archery_ranges_listings.csv')
  const raw = fs.readFileSync(csvPath, 'utf-8')
  const { data: rows } = Papa.parse(raw, { header: true, skipEmptyLines: true })

  // Pre-fetch provinces
  const { data: provinces } = await supabase.from('provinces').select('id, name')
  const provinceMap = new Map(provinces.map(p => [p.name.toLowerCase(), p.id]))

  // Pre-fetch cities
  const { data: cities } = await supabase.from('cities').select('id, name, province_id')
  const cityMap = new Map(cities.map(c => [`${c.name.toLowerCase()}|${c.province_id}`, c.id]))

  const toProcess = rows.filter(r => TO_INSERT.has(toStr(r.post_title)))
  console.log(`\n📋 Found ${toProcess.length} rows to insert\n`)

  let inserted = 0, failed = 0

  for (let i = 0; i < toProcess.length; i++) {
    const row = toProcess[i]
    const name = toStr(row.post_title)
    console.log(`  [${i + 1}/${toProcess.length}] Inserting: "${name}"`)

    // Resolve province
    const provinceName = toStr(row.post_region)
    const provinceId = provinceName ? (provinceMap.get(provinceName.toLowerCase()) || null) : null

    // Resolve or create city
    const cityName = toStr(row.post_city)
    let cityId = null
    if (cityName && provinceId) {
      const key = `${cityName.toLowerCase()}|${provinceId}`
      if (cityMap.has(key)) {
        cityId = cityMap.get(key)
      } else {
        // Create the city
        const { data: newCity, error: cityErr } = await supabase
          .from('cities')
          .insert({
            name: cityName,
            slug: slugify(cityName),
            province_id: provinceId,
          })
          .select('id')
          .single()
        if (cityErr) {
          console.log(`    ⚠️  Could not create city "${cityName}": ${cityErr.message}`)
        } else {
          cityId = newCity.id
          cityMap.set(key, cityId)
          console.log(`    ✅ Created city: ${cityName}`)
        }
      }
    }

    const { error: insertError } = await supabase
      .from('ranges')
      .insert({
        name,
        slug: slugify(name),
        address: toStr(row.post_address),
        postal_code: toStr(row.post_zip),
        latitude: toNum(row.post_latitude),
        longitude: toNum(row.post_longitude),
        city_id: cityId,
        province_id: provinceId,
        phone_number: toStr(row.phone),
        email: toStr(row.email),
        website: toStr(row.website),
        post_tags: toStr(row.post_tags),
        business_hours: toStr(row.business_hours),
        range_length_yards: toNum(row.range_length_yards),
        number_of_lanes: toNum(row.number_of_lanes),
        facility_type: normalizeFacilityType(row.facility_type),
        has_pro_shop: toBool(row.has_pro_shop),
        has_3d_course: toBool(row.has_3d_course),
        has_field_course: toBool(row.has_field_course),
        equipment_rental_available: toBool(row.equipment_rental_available),
        lessons_available: toBool(row.lessons_available),
        accessibility: toBool(row.accessibility),
        parking_available: toBool(row.parking_available),
        membership_required: toBool(row.membership_required),
        membership_price_adult: toNum(row.membership_price_adult),
        drop_in_price: toNum(row.drop_in_price),
        lesson_price_range: toStr(row.lesson_price_range),
        bow_types_allowed: toStr(row.bow_types_allowed),
        subscription_tier: 'free',
        status: 'active',
      })

    if (insertError) {
      console.log(`    ❌ FAILED: ${insertError.message}`)
      failed++
    } else {
      console.log(`    ✅ Inserted`)
      inserted++
    }
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Inserted: ${inserted}
❌ Failed:   ${failed}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
