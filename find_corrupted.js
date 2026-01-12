
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findCorrupted() {
    const { data: ranges, error } = await supabase
        .from('ranges')
        .select('id, name, phone_number, email, website, post_tags');

    if (error) {
        console.error('Error fetching ranges:', error);
        return;
    }

    const corrupted = ranges.filter(r => {
        // Pattern 1: phone_number starts with "The " or is very long
        const phoneCorrupted = r.phone_number && (r.phone_number.startsWith('The ') || r.phone_number.length > 20);
        // Pattern 2: email contains commas (looks like tags)
        const emailCorrupted = r.email && r.email.includes(',');
        // Pattern 3: website looks like hours
        const websiteCorrupted = r.website && (r.website.includes('-') || r.website.includes('pm') || r.website.includes('am'));

        return phoneCorrupted || emailCorrupted || websiteCorrupted;
    });

    console.log(`Found ${corrupted.length} potentially corrupted ranges:`);
    console.log(JSON.stringify(corrupted, null, 2));
}

findCorrupted();
