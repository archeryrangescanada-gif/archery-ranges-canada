require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function main() {
    console.log('🔐 Resetting Admin Password...\n');

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Missing environment variables. Check .env.local');
        process.exit(1);
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    // The specific email to fix
    const targetEmail = 'archeryrangescanada@gmail.com';
    const newPassword = 'password123'; // Temporary password

    try {
        console.log(`🔍 Looking for user: ${targetEmail}`);

        // List all users to find the ID
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });

        if (listError) throw listError;

        const user = users.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase());

        if (!user) {
            console.error(`❌ User not found! Please ensure ${targetEmail} has signed up previously.`);
            // List some users to help debug
            console.log('Available users:', users.map(u => u.email).slice(0, 5));
            process.exit(1);
        }

        console.log(`✅ Found User ID: ${user.id}`);
        console.log(`📝 Providers: ${user.app_metadata.provider || user.app_metadata.providers?.join(',')}`);

        // Update the password
        console.log(`🔄 Setting password to: ${newPassword}`);

        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
            user.id,
            {
                password: newPassword,
                email_confirm: true, // Ensure email is confirmed
                user_metadata: { ...user.user_metadata, role: 'super_admin' } // Also set metadata
            }
        );

        if (updateError) throw updateError;
        console.log('✅ Password updated successfully!');

        // Update Profile Role
        console.log('🔄 Ensuring Super Admin role in database...');
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                email: targetEmail,
                role: 'super_admin',
                status: 'active',
                updated_at: new Date().toISOString()
            });

        if (profileError) {
            console.error('⚠️ Database profile error:', profileError.message);
        } else {
            console.log('✅ Database profile updated to Super Admin');
        }

        console.log('\n==========================================');
        console.log(`🎉 DONE! Log in with:`);
        console.log(`Email: ${targetEmail}`);
        console.log(`Password: ${newPassword}`);
        console.log('==========================================\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

main();
