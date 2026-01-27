require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

function normalizeToArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        if (value.startsWith('{') && value.endsWith('}')) {
            const inner = value.slice(1, -1);
            if (!inner) return [];
            return inner.split(',').map(item => {
                const trimmed = item.trim();
                if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
                    return trimmed.slice(1, -1);
                }
                return trimmed;
            }).filter(Boolean);
        }
        if (value.startsWith('[')) {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : [value];
            } catch {
                return [value];
            }
        }
        return [value];
    }
    return [];
}

async function debugAbbotsfordRanges() {
    console.log('🔍 Fetching ranges in Abbotsford...\n')

    const { data: city, error: cityError } = await supabase
        .from('cities')
        .select('id, name')
        .eq('slug', 'abbotsford')
        .single()

    if (cityError || !city) {
        console.error('❌ Error finding Abbotsford:', cityError)
        process.exit(1)
    }

    const { data: ranges, error } = await supabase
        .from('ranges')
        .select('*')
        .eq('city_id', city.id)

    if (error) {
        console.error('❌ Error fetching ranges:', error)
        process.exit(1)
    }

    console.log(`📊 Found ${ranges.length} ranges:\n`)

    ranges.forEach((range, index) => {
        const post_images = normalizeToArray(range.post_images);

        console.log(`${index + 1}. ${range.name}`)
        console.log(`   Raw post_images:`, range.post_images)
        console.log(`   Normalized post_images:`, post_images)
        console.log(`   Primary Image URL:`, post_images[0] || 'NONE')
        console.log(`   Facility Type (Raw):`, range.facility_type)
        console.log(`   Facility Type (Clean):`, range.facility_type === 'N/A' ? 'null' : range.facility_type)
        console.log('---')
    })
}

debugAbbotsfordRanges()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Script failed:', err)
        process.exit(1)
    })
