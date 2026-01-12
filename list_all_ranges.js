require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function listAllRanges() {
  console.log('📋 Fetching all ranges from database...\n')

  const { data: ranges, error } = await supabase
    .from('ranges')
    .select('id, name, owner_id, city_id, province_id')
    .order('name')

  if (error) {
    console.error('❌ Error fetching ranges:', error)
    process.exit(1)
  }

  console.log(`📊 Total ranges: ${ranges.length}\n`)

  // Count claimed vs unclaimed
  const claimed = ranges.filter(r => r.owner_id !== null).length
  const unclaimed = ranges.filter(r => r.owner_id === null).length

  console.log(`✅ Unclaimed: ${unclaimed}`)
  console.log(`🔒 Claimed: ${claimed}\n`)

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('First 20 unclaimed ranges:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const unclaimedRanges = ranges.filter(r => r.owner_id === null).slice(0, 20)

  unclaimedRanges.forEach((range, index) => {
    console.log(`${index + 1}. ${range.name}`)
    console.log(`   ID: ${range.id}`)
    console.log(`   City ID: ${range.city_id || 'null'}`)
    console.log(`   Province ID: ${range.province_id || 'null'}`)
    console.log('')
  })

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n💡 Tip: Search for any name above in the claim form')
}

listAllRanges()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Script failed:', err)
    process.exit(1)
  })
