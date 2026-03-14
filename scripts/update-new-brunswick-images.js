require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const updates = [
    ['Mountaineers Archery Club', '/new_brunswick_listing_images/mountaineers_archery_club.jpg'],
    ['Moncton Gun Club', '/new_brunswick_listing_images/moncton_gun_club.jpg']
];

async function main() {
    for (const [name, img] of updates) {
        const { data } = await supabase.from('ranges').select('id').ilike('name', name).single();
        if (!data) { console.log('NOT FOUND: ' + name); continue; }
        const { error } = await supabase.from('ranges').update({ post_images: [img] }).eq('id', data.id);
        console.log(error ? 'ERROR: ' + name : 'OK: ' + name + ' -> ' + img);
    }

    const { data: p } = await supabase.from('provinces').select('id').eq('slug', 'new-brunswick').single();
    const { data: all } = await supabase.from('ranges').select('name, post_images').eq('province_id', p.id);
    let real = 0, filler = 0;
    for (const r of all) {
        const imgs = Array.isArray(r.post_images) ? r.post_images : [r.post_images];
        if (imgs[0] === '/filler-image.jpg') filler++; else real++;
    }
    console.log('\nTotal: ' + all.length + ' | Real images: ' + real + ' | Filler: ' + filler);
}

main();
