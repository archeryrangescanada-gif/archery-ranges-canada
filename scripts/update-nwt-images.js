require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    const realImages = {};
    if (fs.existsSync('nwt_images_mapping.csv')) {
        const lines = fs.readFileSync('nwt_images_mapping.csv', 'utf-8').split('\n').filter(l => l.trim());
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',');
            if (parts.length >= 2) {
                const name = parts[0].trim();
                const path = parts[1].trim();
                if (name && path) realImages[name] = path;
            }
        }
    }
    console.log('Real images found:', Object.keys(realImages).length);

    const { data: p } = await supabase.from('provinces').select('id').eq('slug', 'northwest-territories').single();
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
    let real = 0, filler = 0;
    for (const r of ranges) { if (realImages[r.name]) real++; else filler++; }
    console.log('Real images: ' + real + ' | Filler: ' + filler);
}

main();
