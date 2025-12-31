require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function markRangesAsFeatured() {
    console.log('🚀 Starting featured ranges update...\n');

    // Get all ranges with images to select good candidates
    const { data: ranges, error: fetchError } = await supabase
        .from('ranges')
        .select('id, name, city, province, post_images, is_featured')
        .not('post_images', 'is', null)
        .order('name');

    if (fetchError) {
        console.error('❌ Error fetching ranges:', fetchError);
        return;
    }

    console.log(`📊 Found ${ranges.length} ranges with images\n`);

    // Select ranges to feature (e.g., first 20 with images)
    const rangesToFeature = ranges.slice(0, 30); // Feature 30 ranges

    let successCount = 0;
    let alreadyFeaturedCount = 0;

    for (const range of rangesToFeature) {
        if (range.is_featured) {
            console.log(`⏭️  "${range.name}" is already featured`);
            alreadyFeaturedCount++;
            continue;
        }

        const { error: updateError } = await supabase
            .from('ranges')
            .update({ is_featured: true })
            .eq('id', range.id);

        if (updateError) {
            console.error(`❌ Error updating "${range.name}":`, updateError.message);
        } else {
            console.log(`✅ Marked "${range.name}" as featured`);
            successCount++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 Summary:');
    console.log(`✅ Newly featured: ${successCount}`);
    console.log(`⏭️  Already featured: ${alreadyFeaturedCount}`);
    console.log(`📍 Total featured ranges: ${successCount + alreadyFeaturedCount}`);
    console.log('='.repeat(60));

    // Also verify image data
    console.log('\n🔍 Verifying image data in first 10 ranges...\n');
    const { data: verifyRanges } = await supabase
        .from('ranges')
        .select('id, name, post_images')
        .limit(10);

    verifyRanges?.forEach(r => {
        if (r.post_images && r.post_images.length > 0) {
            console.log(`✅ ${r.name}: has ${r.post_images.length} image(s) - ${r.post_images[0]}`);
        } else {
            console.log(`⚠️  ${r.name}: NO images`);
        }
    });
}

// Run the script
markRangesAsFeatured()
    .then(() => {
        console.log('\n✨ Done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Fatal error:', error);
        process.exit(1);
    });
