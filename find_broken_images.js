require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function findBrokenImages() {
    console.log('🔍 Searching for ranges with broken image formatting...\n')

    const { data: ranges, error } = await supabase
        .from('ranges')
        .select('id, name, post_images')

    if (error) {
        console.error('❌ Error fetching ranges:', error)
        process.exit(1)
    }

    const brokenRanges = ranges.filter(r =>
        r.post_images &&
        typeof r.post_images === 'string' &&
        r.post_images.startsWith('{')
    )

    console.log(`📊 Total ranges: ${ranges.length}`)
    console.log(`❌ Ranges with broken formatting: ${brokenRanges.length}\n`)

    brokenRanges.forEach((range, index) => {
        console.log(`${index + 1}. ${range.name}`)
        console.log(`   Value: ${range.post_images}\n`)
    })
}

findBrokenImages()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Script failed:', err)
        process.exit(1)
    })
