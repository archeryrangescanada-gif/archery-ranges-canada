require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const IMAGE_UPDATES = [
    {
        slug: 'pei-archery-association',
        post_images: ['/prince edward island listing images/pei-archery-association.jpg'],
    },
    {
        slug: 'cass-creek-archery-club',
        post_images: ['/prince edward island listing images/cass-creek-archery-club.jpg'],
    },
    {
        slug: 'elemental-acres-horse-archery',
        post_images: ['/prince edward island listing images/elemental-acres-horse-archery.jpg'],
    },
];

async function main() {
    console.log('📷 Updating PEI range images in Supabase');
    console.log('─'.repeat(45));

    let updated = 0;
    for (const { slug, post_images } of IMAGE_UPDATES) {
        const { data, error } = await supabase
            .from('ranges')
            .update({ post_images })
            .eq('slug', slug)
            .select('id, name');

        if (error) {
            console.log(`  ❌ ${slug}: ${error.message}`);
        } else if (data && data.length > 0) {
            console.log(`  ✅ ${data[0].name}`);
            updated++;
        } else {
            console.log(`  ⚠️ Not found: ${slug}`);
        }
    }

    console.log('─'.repeat(45));
    console.log(`📊 Updated ${updated} of ${IMAGE_UPDATES.length}`);
}

main().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
