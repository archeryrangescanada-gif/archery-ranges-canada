require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function findListingsWithoutPhotos() {
  console.log('🔍 Searching for listings without photos (accurate check)...\n')

  // Fetch all ranges
  const { data: ranges, error } = await supabase
    .from('ranges')
    .select('id, name, slug')
    .order('name')

  if (error) {
    console.error('❌ Error fetching ranges:', error)
    process.exit(1)
  }

  console.log(`📊 Total listings in database: ${ranges.length}\n`)

  // Check each range for photos
  const rangesWithoutPhotos = []
  const rangesWithPhotos = []

  for (const range of ranges) {
    const { data: photos, error: photoError } = await supabase
      .from('range_photos')
      .select('id, photo_url, is_primary')
      .eq('range_id', range.id)

    // Check for null, empty array, or error
    const hasPhotos = !photoError && photos && photos.length > 0

    if (hasPhotos) {
      rangesWithPhotos.push({ ...range, photoCount: photos.length })
    } else {
      rangesWithoutPhotos.push({ ...range, reason: photos === null ? 'null' : 'empty' })
    }
  }

  console.log(`📷 Listings WITH photos: ${rangesWithPhotos.length}`)
  console.log(`❌ Listings WITHOUT photos: ${rangesWithoutPhotos.length}\n`)

  if (rangesWithoutPhotos.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Listings missing photos:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    for (const range of rangesWithoutPhotos) {
      console.log(`  • ${range.name}`)
      console.log(`    ID: ${range.id}`)
      console.log(`    Slug: ${range.slug}`)
      console.log(`    URL: /${range.slug}`)
      console.log(`    Reason: ${range.reason}\n`)
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    const percentage = Math.round(rangesWithoutPhotos.length / ranges.length * 100)
    console.log(`\n📊 Summary: ${rangesWithoutPhotos.length} of ${ranges.length} listings need photos (${percentage}%)`)
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
