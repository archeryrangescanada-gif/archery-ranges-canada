require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function addImagesToListings() {
    console.log('🚀 Starting image upload process...\n');

    // Get all image files from the listing images directory
    const imagesDir = path.join(__dirname, 'public', 'listing images');

    if (!fs.existsSync(imagesDir)) {
        console.error('❌ Images directory not found:', imagesDir);
        return;
    }

    const imageFiles = fs.readdirSync(imagesDir)
        .filter(file => /\.(jpg|jpeg|png|webp|gif)$/i.test(file));

    console.log(`📁 Found ${imageFiles.length} images in directory\n`);

    // Fetch all ranges from the database
    const { data: ranges, error: fetchError } = await supabase
        .from('ranges')
        .select('id, name, post_images');

    if (fetchError) {
        console.error('❌ Error fetching ranges:', fetchError);
        return;
    }

    console.log(`📊 Found ${ranges.length} ranges in database\n`);

    let successCount = 0;
    let skippedCount = 0;
    let notFoundCount = 0;

    // Process each range
    for (const range of ranges) {
        // Check if range already has images
        if (range.post_images && range.post_images.length > 0) {
            console.log(`⏭️  Skipping "${range.name}" - already has ${range.post_images.length} image(s)`);
            skippedCount++;
            continue;
        }

        // Find matching image file (case-insensitive, handle special characters)
        const matchingImage = imageFiles.find(file => {
            const fileNameWithoutExt = file.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
            const normalizedFileName = fileNameWithoutExt.toLowerCase().trim();
            const normalizedRangeName = range.name.toLowerCase().trim();

            return normalizedFileName === normalizedRangeName;
        });

        if (matchingImage) {
            // Construct the public URL path
            const imageUrl = `/listing images/${matchingImage}`;

            // Update the range with the image URL
            const { error: updateError } = await supabase
                .from('ranges')
                .update({ post_images: [imageUrl] })
                .eq('id', range.id);

            if (updateError) {
                console.error(`❌ Error updating "${range.name}":`, updateError.message);
            } else {
                console.log(`✅ Added image to "${range.name}": ${matchingImage}`);
                successCount++;
            }
        } else {
            console.log(`⚠️  No matching image found for "${range.name}"`);
            notFoundCount++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 Summary:');
    console.log(`✅ Successfully added: ${successCount}`);
    console.log(`⏭️  Skipped (already has images): ${skippedCount}`);
    console.log(`⚠️  No matching image: ${notFoundCount}`);
    console.log('='.repeat(60));
}

// Run the script
addImagesToListings()
    .then(() => {
        console.log('\n✨ Done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Fatal error:', error);
        process.exit(1);
    });
