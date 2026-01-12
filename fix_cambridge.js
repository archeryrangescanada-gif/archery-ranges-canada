
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

async function fixRange() {
    const rangeId = '0c85c968-73b4-4298-b97c-0cd6c659f1db';

    const updates = {
        phone_number: '(519) 622-1290',
        email: 'gregory.cinti@wcdsb.ca',
        website: 'https://monsignordoyle.wcdsb.ca/',
        business_hours: 'Wed 6-7pm (Learning sessions), 7pm+ (Recreational shooting)',
        post_tags: ['archery', 'school club', 'Cambridge'],
        facility_type: 'indoor',
        range_length_yards: null, // It was set to 'Indoor'
        equipment_rental_available: true, // The CSV said 'Yes' for drop_in_price which often meant rentals in this messy data
        lessons_available: true,
        post_content: `The Cambridge Archery Club is a dedicated target archery facility serving the Waterloo Region. Focused on the precision of Olympic recurve and compound target shooting, the club provides a space for archers to hone their accuracy and form. Operating with both indoor and outdoor options (depending on the season), it ensures that members in Cambridge and Kitchener have consistent access to high-quality targets.

The club operates as a vibrant school-based community organization out of Monsignor Doyle Catholic Secondary School. It offers a structured and inclusive environment for students and community members to learn the sport, with mandatory "learning sessions" for beginners to ensure safety and proper technique. The club focuses on recreational shooting and skill development for recurve and Genesis compound bows.

Meeting weekly on Wednesday evenings, the club provides a low-barrier entry point into the sport of indoor archery. By providing equipment and instruction, it fosters a love for the sport among youth and new archers in Cambridge. It is an excellent resource for those looking for archery lessons and a friendly, educational atmosphere.`
    };

    const { data, error } = await supabase
        .from('ranges')
        .update(updates)
        .eq('id', rangeId)
        .select();

    if (error) {
        console.error('Error updating range:', error);
        return;
    }

    console.log('Successfully updated range:', JSON.stringify(data, null, 2));
}

fixRange();
