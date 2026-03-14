require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Ranges that got real images
const realImages = {
    'Mountaineers Archery Club': '/new_brunswick_listing_images/mountaineers_archery_club.jpg',
    'Moncton Gun Club': '/new_brunswick_listing_images/moncton_gun_club.jpg'
};

async function main() {
    const { data: p } = await supabase.from('provinces').select('id').eq('slug', 'new-brunswick').single();
    const { data: ranges } = await supabase.from('ranges').select('id, name, post_images').eq('province_id', p.id).order('name');

    let updated = 0;
    for (const r of ranges) {
        const realImg = realImages[r.name];
        const newImages = realImg ? [realImg] : ['/filler-image.jpg'];

        const { error } = await supabase.from('ranges')
            .update({ post_images: newImages })
            .eq('id', r.id);

        if (error) {
            console.log('ERROR: ' + r.name + ': ' + error.message);
        } else {
            console.log('OK: ' + r.name + ' -> ' + newImages[0]);
            updated++;
        }
    }

    console.log('\nUpdated: ' + updated + ' / ' + ranges.length);
}

main();
