require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupPolicies() {
  console.log('📋 Setting up storage policies for verification-documents bucket...\n')

  const policies = [
    {
      name: 'Users can upload their own verification documents',
      sql: `
        CREATE POLICY "Users can upload their own verification documents"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (
          bucket_id = 'verification-documents' AND
          (storage.foldername(name))[1] = auth.uid()::text
        );
      `
    },
    {
      name: 'Users can read their own verification documents',
      sql: `
        CREATE POLICY "Users can read their own verification documents"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (
          bucket_id = 'verification-documents' AND
          (storage.foldername(name))[1] = auth.uid()::text
        );
      `
    },
    {
      name: 'Admins can read all verification documents',
      sql: `
        CREATE POLICY "Admins can read all verification documents"
        ON storage.objects FOR SELECT
        TO service_role
        USING (bucket_id = 'verification-documents');
      `
    },
    {
      name: 'Admins can delete verification documents',
      sql: `
        CREATE POLICY "Admins can delete verification documents"
        ON storage.objects FOR DELETE
        TO service_role
        USING (bucket_id = 'verification-documents');
      `
    }
  ]

  for (const policy of policies) {
    console.log(`Creating policy: ${policy.name}`)

    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: policy.sql
    })

    if (error) {
      if (error.message?.includes('already exists')) {
        console.log(`  ⚠️  Policy already exists, skipping`)
      } else {
        console.error(`  ❌ Error:`, error.message)
      }
    } else {
      console.log(`  ✅ Created successfully`)
    }
  }

  console.log('\n✅ Storage policies setup complete!')
}

setupPolicies()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Script failed:', err)
    process.exit(1)
  })
