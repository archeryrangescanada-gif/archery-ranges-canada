const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmins() {
    console.log('--- USERS & PROFILES ---');

    // Get all profiles
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role, full_name');

    if (profileError) console.error(profileError);
    else {
        console.log(`Total Profiles: ${profiles.length}`);
        console.table(profiles);

        const admins = profiles.filter(p => p.role === 'admin');
        console.log(`Admins found: ${admins.length}`);
    }
}

checkAdmins();
