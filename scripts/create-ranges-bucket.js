require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createBucket() {
  console.log('Creating ranges storage bucket...\n')

  const { data: bucket, error: bucketError } = await supabase.storage
    .createBucket('ranges', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    })

  if (bucketError) {
    if (bucketError.message.includes('already exists')) {
      console.log('Bucket already exists')
    } else {
      console.error('Error creating bucket:', bucketError)
      return
    }
  } else {
    console.log('Bucket created successfully')
  }

  console.log('\nBucket info:')
  const { data: buckets } = await supabase.storage.listBuckets()
  const rangesBucket = buckets?.find(b => b.name === 'ranges')
  console.log(rangesBucket)
}

createBucket()
  .then(() => {
    console.log('\nDone!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Script failed:', err)
    process.exit(1)
  })
