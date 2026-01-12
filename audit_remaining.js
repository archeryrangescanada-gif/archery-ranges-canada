
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

async function auditRemaining() {
    const { data: ranges, error } = await supabase
        .from('ranges')
        .select('id, name, phone_number, email, website, post_tags');

    if (error) {
        console.error('Error fetching ranges:', error);
        return;
    }

    const issues = ranges.filter(r => {
        const websiteNoProto = r.website && !r.website.startsWith('http') && r.website !== 'N/A';
        const emailPlaceholder = r.email && (r.email.toLowerCase().includes('website') || r.email.toLowerCase().includes('mailbox') || r.email.includes('[email protected]'));
        const multiEmail = r.email && r.email.includes(',');
        const tagSentences = r.post_tags && r.post_tags.some(t => t.length > 50 || t.includes('.') || t.includes('**'));
        const longPhone = r.phone_number && r.phone_number.length > 25;

        return websiteNoProto || emailPlaceholder || multiEmail || tagSentences || longPhone;
    });

    console.log(`Found ${issues.length} ranges with minor issues:`);

    const categorized = {
        missing_https: issues.filter(r => r.website && !r.website.startsWith('http') && r.website !== 'N/A'),
        placeholders: issues.filter(r => r.email && (r.email.toLowerCase().includes('website') || r.email.toLowerCase().includes('mailbox'))),
        multi_email: issues.filter(r => r.email && r.email.includes(',')),
        tag_corruption: issues.filter(r => r.post_tags && r.post_tags.some(t => t.length > 50 || t.includes('.') || t.includes('**'))),
        long_phone: issues.filter(r => r.phone_number && r.phone_number.length > 25)
    };

    console.log(JSON.stringify(categorized, null, 2));
}

auditRemaining();
