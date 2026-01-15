// Script to check which listings are missing geocoding data
// Run with: npx tsx scripts/check-missing-maps.ts

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkMissingMaps() {
  console.log('🔍 Checking for listings without geocoding data...\n')

  // Get all ranges with missing lat/long
  const { data: ranges, error } = await supabase
    .from('ranges')
    .select(`
      id,
      name,
      address,
      latitude,
      longitude,
      owner_id,
      cities(name),
      provinces(name)
    `)
    .or('latitude.is.null,longitude.is.null')
    .order('provinces(name)', { ascending: true })

  if (error) {
    console.error('❌ Error fetching ranges:', error)
    return
  }

  if (!ranges || ranges.length === 0) {
    console.log('✅ Great! All listings have geocoding data.')
    return
  }

  console.log(`📊 Found ${ranges.length} listings without maps:\n`)
  console.log('─'.repeat(100))

  // Group by province
  const byProvince: Record<string, any[]> = {}
  ranges.forEach((range: any) => {
    const province = range.provinces?.name || 'Unknown'
    if (!byProvince[province]) {
      byProvince[province] = []
    }
    byProvince[province].push(range)
  })

  // Display grouped results
  Object.entries(byProvince).forEach(([province, provinceRanges]) => {
    console.log(`\n📍 ${province.toUpperCase()} (${provinceRanges.length} listings)`)
    console.log('─'.repeat(100))

    provinceRanges.forEach((range: any) => {
      const claimed = range.owner_id ? '👤 Claimed' : '🔓 Unclaimed'
      const city = range.cities?.name || 'Unknown'
      console.log(`  ${claimed} | ${range.name}`)
      console.log(`           📍 ${range.address}`)
      console.log(`           🏙️  ${city}, ${province}`)
      console.log(`           🆔 ID: ${range.id}`)
      console.log(`           🗺️  Lat: ${range.latitude || 'MISSING'}, Long: ${range.longitude || 'MISSING'}`)
      console.log('')
    })
  })

  // Summary stats
  console.log('\n' + '═'.repeat(100))
  console.log('📊 SUMMARY')
  console.log('═'.repeat(100))

  const unclaimed = ranges.filter((r: any) => !r.owner_id).length
  const claimed = ranges.filter((r: any) => r.owner_id).length

  console.log(`Total listings without maps: ${ranges.length}`)
  console.log(`  └─ 🔓 Unclaimed: ${unclaimed}`)
  console.log(`  └─ 👤 Claimed: ${claimed}`)

  // Get total count for percentage
  const { count: totalCount } = await supabase
    .from('ranges')
    .select('*', { count: 'exact', head: true })

  if (totalCount) {
    const percentage = ((ranges.length / totalCount) * 100).toFixed(1)
    console.log(`\nPercentage missing geocoding: ${percentage}% (${ranges.length}/${totalCount})`)
  }

  console.log('\n💡 To fix these, you can:')
  console.log('   1. Use Google Maps Geocoding API to batch geocode addresses')
  console.log('   2. Manually add lat/long for each listing in the admin panel')
  console.log('   3. Run a geocoding script to automatically fill in missing data\n')
}

checkMissingMaps().catch(console.error)
