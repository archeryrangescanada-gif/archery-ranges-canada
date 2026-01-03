require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    const targetEmail = 'jrpkennedy@gmail.com';
    console.log(`🚀 Promoting ${targetEmail} to Super Admin...\n`);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Missing environment variables.');
        process.exit(1);
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Find User
    const { data: { users }, error: findError } = await supabase.auth.admin.listUsers();
    if (findError) {
        console.error('❌ Error listing users:', findError.message);
        process.exit(1);
    }

    const user = users.find(u => u.email === targetEmail);
    if (!user) {
        console.error('❌ User not found in Auth!');
        process.exit(1);
    }

    console.log(`✅ Found Auth User: ${user.id}`);

    // 2. Update Auth Metadata
    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { user_metadata: { ...user.user_metadata, role: 'super_admin' } }
    );
    if (authUpdateError) console.error('⚠️ Warning: Failed to update auth metadata:', authUpdateError.message);
    else console.log('✅ Auth metadata updated.');

    // 3. Update Profile (The important one for our API)
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'super_admin' })
        .eq('id', user.id);

    if (profileError) {
        console.error('❌ Failed to update profile:', profileError.message);
    } else {
        console.log('✅ Database profile role updated to "super_admin"');
    }

    console.log('\n🎉 Permissions updated. Refresh the page!');
}

main();
