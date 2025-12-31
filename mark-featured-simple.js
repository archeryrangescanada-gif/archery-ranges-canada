require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
    console.log('🚀 Marking ranges as featured...\\n');

    // First, let's just get ranges that have images
    const { data: ranges, error } = await supabase
        .from('ranges')
        .select('id, name, post_images')
        .order('name')
        .limit(100);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${ranges.length} ranges total`);

    // Filter to only those with images
    const rangesWithImages = ranges.filter(r => r.post_images && r.post_images.length > 0);
    console.log(`${rangesWithImages.length} have images\\n`);

    // Mark first 30 as featured
    const toFeature = rangesWithImages.slice(0, 30);

    let count = 0;
    for (const range of toFeature) {
        const { error: updateError } = await supabase
            .from('ranges')
            .update({ is_featured: true })
            .eq('id', range.id);

        if (!updateError) {
            console.log(`✅ ${range.name}`);
            count++;
        } else {
            console.error(`❌ ${range.name}: ${updateError.message}`);
        }
    }

    console.log(`\\n✅ Marked ${count} ranges as featured`);
}

main()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Fatal:', err);
        process.exit(1);
    });
