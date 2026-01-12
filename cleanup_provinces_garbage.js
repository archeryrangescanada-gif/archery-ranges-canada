require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// Valid Canadian provinces
const VALID_PROVINCES = [
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Northwest Territories',
  'Nova Scotia',
  'Nunavut',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Yukon'
]

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function cleanupGarbageProvinces() {
  console.log('🧹 Starting cleanup of garbage provinces...\n')

  // 1. Fetch all provinces
  const { data: allProvinces, error: fetchError } = await supabase
    .from('provinces')
    .select('*')
    .order('name')

  if (fetchError) {
    console.error('❌ Error fetching provinces:', fetchError)
    return
  }

  console.log(`📊 Found ${allProvinces.length} total provinces in database\n`)

  // 2. Identify garbage provinces
  const garbageProvinces = allProvinces.filter(province => {
    const isValid = VALID_PROVINCES.some(
      valid => valid.toLowerCase() === province.name.toLowerCase()
    )
    return !isValid
  })

  const validProvinces = allProvinces.filter(province => {
    const isValid = VALID_PROVINCES.some(
      valid => valid.toLowerCase() === province.name.toLowerCase()
    )
    return isValid
  })

  console.log(`✅ Valid provinces (${validProvinces.length}):`)
  validProvinces.forEach(p => console.log(`   - ${p.name}`))

  console.log(`\n🗑️  Garbage provinces to delete (${garbageProvinces.length}):`)
  garbageProvinces.forEach(p => console.log(`   - "${p.name}"`))

  if (garbageProvinces.length === 0) {
    console.log('\n✅ No garbage provinces found! Database is clean.')
    return
  }

  // 3. Delete garbage provinces
  console.log(`\n🔥 Deleting ${garbageProvinces.length} garbage provinces...`)

  for (const province of garbageProvinces) {
    const { error: deleteError } = await supabase
      .from('provinces')
      .delete()
      .eq('id', province.id)

    if (deleteError) {
      console.error(`   ❌ Failed to delete "${province.name}":`, deleteError.message)
    } else {
      console.log(`   ✅ Deleted: "${province.name}"`)
    }
  }

  console.log('\n✅ Cleanup complete!')
  console.log(`   Deleted: ${garbageProvinces.length} garbage provinces`)
  console.log(`   Remaining: ${validProvinces.length} valid provinces`)
}

cleanupGarbageProvinces()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Script failed:', err)
    process.exit(1)
  })
