require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkEasthill() {
    const { data, error } = await supabase
        .from('ranges')
        .select('id, name, slug, subscription_tier, is_premium, is_featured')
        .eq('slug', 'easthill-outdoors')
        .single()

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Status for Easthill Outdoors:', data)
    }
}

checkEasthill()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Script failed:', err)
        process.exit(1)
    })
