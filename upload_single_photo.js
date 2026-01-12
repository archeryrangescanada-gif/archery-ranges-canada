require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function uploadPhoto() {
  const rangeName = 'Shooting Academy Canada Ltd.'
  const photoPath = '/listing images/Shooting Academy Canada Ltd.jpg'

  console.log(`📸 Uploading photo for: ${rangeName}\n`)

  // Find the range
  const { data: range, error: rangeError } = await supabase
    .from('ranges')
    .select('id, name, slug')
    .ilike('name', rangeName)
    .single()

  if (rangeError || !range) {
    console.error('❌ Range not found:', rangeError)
    return
  }

  console.log(`✅ Found range: ${range.name}`)
  console.log(`   ID: ${range.id}`)
  console.log(`   Slug: ${range.slug}\n`)

  // Insert photo into range_photos table
  const { data: photo, error: photoError } = await supabase
    .from('range_photos')
    .insert({
      range_id: range.id,
      photo_url: photoPath,
      is_primary: true,
      display_order: 1
    })
    .select()
    .single()

  if (photoError) {
    console.error('❌ Error uploading photo:', photoError)
    return
  }

  console.log('✅ Photo uploaded successfully!')
  console.log(`   Photo ID: ${photo.id}`)
  console.log(`   Photo URL: ${photo.photo_url}`)
  console.log(`   Is Primary: ${photo.is_primary}`)
}

uploadPhoto()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch(err => {
    console.error('❌ Script failed:', err)
    process.exit(1)
  })
