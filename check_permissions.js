require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    console.log('🔍 Checking Admin Permissions...\n');

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Missing environment variables. Check .env.local');
        console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing');
        console.log('Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
        process.exit(1);
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. List all users from Auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error('Auth Error:', authError.message);
    } else {
        console.log(`found ${users.length} Auth Users:`);
        users.forEach(u => console.log(` - ${u.email} (ID: ${u.id})`));
    }
    console.log('\n-----------------------------------\n');

    // 2. List all profiles
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*');

    if (profileError) {
        console.error('Profiles Error:', profileError.message);
    } else {
        console.log(`found ${profiles.length} Profiles:`);
        profiles.forEach(p => console.log(` - Role: ${p.role}, Email: ${p.email || 'N/A'}, ID: ${p.id}`));
    }

    // Check for mismatch
    if (users && profiles) {
        console.log('\n-----------------------------------\n');
        console.log('Analysis:');
        users.forEach(u => {
            const p = profiles.find(prof => prof.id === u.id);
            if (!p) {
                console.log(`❌ User ${u.email} has NO PROFILE entry.`);
            } else if (!['super_admin', 'admin', 'admin_employee'].includes(p.role)) {
                console.log(`⚠️ User ${u.email} has role '${p.role}' (Access Denied)`);
            } else {
                console.log(`✅ User ${u.email} has role '${p.role}' (Access Granted)`);
            }
        });
    }

}

main();
