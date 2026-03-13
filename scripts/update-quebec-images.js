require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    try {
        console.log("Starting Supabase image update for Quebec...");

        const fileContent = fs.readFileSync('quebec_images_mapping.csv', 'utf8');
        const lines = fileContent.split('\n').map(l => l.trim()).filter(l => l);
        const headers = lines[0].split(',');
        const records = lines.slice(1).map(line => {
            const matches = line.match(/(?:\"([^\"]*)\"|([^,]+))/g) || [];
            return {
                name: matches[0].replace(/^"|"$/g, '').trim(),
                image_path: matches[1].replace(/^"|"$/g, '').trim()
            }
        });

        console.log(`Found ${records.length} image mappings.`);

        let successCount = 0;
        for (const record of records) {
            const { name, image_path } = record;

            const { data: range, error: fetchErr } = await supabase
                .from('ranges')
                .select('id, name, post_images')
                .ilike('name', name)
                .single();

            if (fetchErr || !range) {
                console.log(`Failed to find range: ${name}`);
                continue;
            }

            let currentImages = range.post_images || [];

            let newImages = [];
            if (currentImages.length === 0 || (currentImages.length === 1 && currentImages[0] === '/filler-image.jpg')) {
                newImages = [image_path];
            } else if (!currentImages.includes(image_path)) {
                newImages = [image_path, ...currentImages];
            } else {
                newImages = currentImages;
            }

            const { error: updateErr } = await supabase
                .from('ranges')
                .update({ post_images: newImages })
                .eq('id', range.id);

            if (updateErr) {
                console.error(`Error updating ${name}:`, updateErr.message);
            } else {
                console.log(`SUCCESS: Updated images for ${name}`);
                successCount++;
            }
        }

        console.log(`\nDone. Successfully updated ${successCount} ranges.`);

    } catch (e) {
        console.error("Script failed:", e);
    }
}

main();
