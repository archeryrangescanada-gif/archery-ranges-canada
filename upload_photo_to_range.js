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
    .select('id, name, slug, images')
    .ilike('name', rangeName)
    .single()

  if (rangeError || !range) {
    console.error('❌ Range not found:', rangeError)
    return
  }

  console.log(`✅ Found range: ${range.name}`)
  console.log(`   ID: ${range.id}`)
  console.log(`   Current images: ${JSON.stringify(range.images)}\n`)

  // Update the post_images array (used by frontend)
  const updatedImages = [photoPath]

  const { data: updated, error: updateError } = await supabase
    .from('ranges')
    .update({
      post_images: updatedImages,
      updated_at: new Date().toISOString()
    })
    .eq('id', range.id)
    .select('id, name, post_images')
    .single()

  if (updateError) {
    console.error('❌ Error updating range:', updateError)
    return
  }

  console.log('✅ Photo uploaded successfully!')
  console.log(`   Updated post_images: ${JSON.stringify(updated.post_images)}`)
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
