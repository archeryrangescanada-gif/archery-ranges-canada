
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase
        .from('ranges')
        .select('email')
        .limit(1);

    if (error) {
        if (error.code === '42703') {
            console.log('❌ Column "email" does NOT exist in "ranges" table.');
        } else {
            console.error('Error checking schema:', error);
        }
    } else {
        console.log('✅ Column "email" EXISTS in "ranges" table.');

        // Check how many ranges have emails
        const { count, error: countError } = await supabase
            .from('ranges')
            .select('*', { count: 'exact', head: true })
            .not('email', 'is', null)
            .not('email', 'eq', 'N/A');

        if (countError) {
            console.error('Error counting emails:', countError);
        } else {
            console.log(`📊 Found ${count} ranges with valid emails.`);
        }
    }
}

checkSchema();
