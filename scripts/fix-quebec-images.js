require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    // Get Quebec province
    const { data: province } = await supabase
        .from('provinces')
        .select('id')
        .eq('slug', 'quebec')
        .single();

    if (!province) { console.log('Province not found'); return; }

    const { data: ranges, error } = await supabase
        .from('ranges')
        .select('id, name, post_images')
        .eq('province_id', province.id)
        .order('name');

    if (error) { console.error(error); return; }

    let fixedCount = 0;

    for (const range of ranges) {
        let images = range.post_images || [];

        // Handle string-encoded arrays
        if (typeof images === 'string') {
            try { images = JSON.parse(images); } catch { images = [images]; }
        }
        if (!Array.isArray(images)) images = [images];

        // Detect corrupted arrays: real image path followed by single-char junk
        if (images.length > 2 && images.some(img => typeof img === 'string' && img.length === 1)) {
            // Keep only entries that look like real image paths (start with /)
            const cleanImages = images.filter(img => typeof img === 'string' && img.startsWith('/') && img.length > 5);

            console.log(`FIX: ${range.name}`);
            console.log(`  Before: ${images.length} entries`);
            console.log(`  After:  ${JSON.stringify(cleanImages)}`);

            const { error: updateErr } = await supabase
                .from('ranges')
                .update({ post_images: cleanImages })
                .eq('id', range.id);

            if (updateErr) {
                console.error(`  ERROR: ${updateErr.message}`);
            } else {
                fixedCount++;
            }
        }
    }

    console.log(`\nFixed ${fixedCount} ranges.`);
}

main();
