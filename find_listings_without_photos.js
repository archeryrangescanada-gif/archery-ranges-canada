require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function findListingsWithoutPhotos() {
  console.log('🔍 Searching for listings without photos...\n')

  // Fetch all ranges
  const { data: ranges, error } = await supabase
    .from('ranges')
    .select('id, name, slug, city_id, province_id')
    .order('name')

  if (error) {
    console.error('❌ Error fetching ranges:', error)
    process.exit(1)
  }

  console.log(`📊 Total listings in database: ${ranges.length}\n`)

  // Check each range for photos
  const rangesWithoutPhotos = []

  for (const range of ranges) {
    const { data: photos, error: photoError } = await supabase
      .from('range_photos')
      .select('id')
      .eq('range_id', range.id)
      .limit(1)

    if (!photoError && (!photos || photos.length === 0)) {
      rangesWithoutPhotos.push(range)
    }
  }

  console.log(`📷 Listings WITHOUT photos: ${rangesWithoutPhotos.length}\n`)

  if (rangesWithoutPhotos.length > 0) {
    console.log('Missing photos for these listings:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    for (const range of rangesWithoutPhotos) {
      console.log(`  • ${range.name}`)
      console.log(`    ID: ${range.id}`)
      console.log(`    URL: /${range.slug}\n`)
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`\n📊 Summary: ${rangesWithoutPhotos.length} of ${ranges.length} listings need photos (${Math.round(rangesWithoutPhotos.length / ranges.length * 100)}%)`)
  } else {
    console.log('✅ All listings have photos!')
  }
}

findListingsWithoutPhotos()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Script failed:', err)
    process.exit(1)
  })
