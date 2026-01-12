require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createBucket() {
  console.log('📦 Creating verification-documents storage bucket...\n')

  // Create the bucket
  const { data: bucket, error: bucketError } = await supabase.storage
    .createBucket('verification-documents', {
      public: false,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'text/plain']
    })

  if (bucketError) {
    if (bucketError.message.includes('already exists')) {
      console.log('✅ Bucket already exists')
    } else {
      console.error('❌ Error creating bucket:', bucketError)
      return
    }
  } else {
    console.log('✅ Bucket created successfully')
  }

  console.log('\n📋 Bucket info:')
  const { data: buckets } = await supabase.storage.listBuckets()
  const verificationBucket = buckets?.find(b => b.name === 'verification-documents')
  console.log(verificationBucket)
}

createBucket()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch(err => {
    console.error('❌ Script failed:', err)
    process.exit(1)
  })
