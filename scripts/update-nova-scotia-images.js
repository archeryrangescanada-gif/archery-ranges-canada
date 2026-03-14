require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    console.log("Updating Nova Scotia range images...\n");

    // Read mapping CSV
    const mappings = [];
    const content = fs.readFileSync('nova_scotia_images_mapping.csv', 'utf8');
    const lines = content.split('\n').map(l => l.trim()).filter(l => l);

    for (let i = 1; i < lines.length; i++) {
        const matches = lines[i].match(/(?:"([^"]*)"|([^,]+))/g) || [];
        if (matches.length >= 2) {
            mappings.push({
                name: matches[0].replace(/^"|"$/g, '').trim(),
                image_path: matches[1].replace(/^"|"$/g, '').trim()
            });
        }
    }

    console.log(`Found ${mappings.length} image mappings.\n`);

    let updated = 0;
    for (const { name, image_path } of mappings) {
        const { data: range, error: fetchErr } = await supabase
            .from('ranges')
            .select('id, name, post_images')
            .ilike('name', name)
            .single();

        if (fetchErr || !range) {
            console.log(`NOT FOUND: ${name}`);
            continue;
        }

        const { error: updateErr } = await supabase
            .from('ranges')
            .update({ post_images: [image_path] })
            .eq('id', range.id);

        if (updateErr) {
            console.error(`ERROR: ${name}: ${updateErr.message}`);
        } else {
            console.log(`OK: ${name} -> ${image_path}`);
            updated++;
        }
    }

    // Verify all NS ranges have an image set
    const { data: province } = await supabase
        .from('provinces')
        .select('id')
        .eq('slug', 'nova-scotia')
        .single();

    const { data: allRanges } = await supabase
        .from('ranges')
        .select('name, post_images')
        .eq('province_id', province.id)
        .order('name');

    let fillerCount = 0;
    let imageCount = 0;
    let emptyCount = 0;

    for (const r of allRanges) {
        let images = r.post_images || [];
        if (typeof images === 'string') {
            try { images = JSON.parse(images); } catch { images = [images]; }
        }

        if (!images || images.length === 0) {
            emptyCount++;
            console.log(`EMPTY (needs filler): ${r.name}`);
        } else if (images[0] === '/filler-image.jpg') {
            fillerCount++;
        } else {
            imageCount++;
        }
    }

    console.log(`\nDone. Updated: ${updated}`);
    console.log(`Total NS ranges: ${allRanges.length}`);
    console.log(`With real image: ${imageCount}`);
    console.log(`With filler: ${fillerCount}`);
    console.log(`Empty (need fix): ${emptyCount}`);
}

main();
