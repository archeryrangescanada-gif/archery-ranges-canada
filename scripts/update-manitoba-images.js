require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    try {
        const fileContent = fs.readFileSync('manitoba_images_mapping.csv', 'utf8');
        const lines = fileContent.split('\n').map(l => l.trim()).filter(l => l);
        const headers = lines[0].split(',');
        const records = lines.slice(1).map(line => {
            // simple parse for 'name,image_path'
            // handle simple comma split or quotes if necessary (mapping file was written by us without complex quotes)
            const parts = line.split(',');
            // If the name had a comma it would be quoted, but our names likely don't.
            // Let's do a fast regex for CSV just in case
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

            // Get the current range to safely update the post_images array
            const { data: range, error: fetchErr } = await supabase
                .from('ranges')
                .select('id, name, post_images')
                .ilike('name', name)
                .single();

            if (fetchErr || !range) {
                console.log(`Failed to find range: ${name}`);
                continue;
            }

            // We only want to set the hero image if there isn't one already or if it's the filler image
            let currentImages = range.post_images || [];

            // Check if it already has the filler image and replace it, or push new one
            let newImages = [];
            if (currentImages.length === 0 || (currentImages.length === 1 && currentImages[0] === '/filler-image.jpg')) {
                newImages = [image_path];
            } else if (!currentImages.includes(image_path)) {
                // Prepend so it becomes the main image
                newImages = [image_path, ...currentImages];
            } else {
                newImages = currentImages; // Already has it
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
