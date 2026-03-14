require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    // Get NB province
    const { data: province } = await supabase.from('provinces').select('id').eq('slug', 'new-brunswick').single();
    if (!province) { console.log('Province not found'); return; }

    // Get or create Quispamsis city
    let { data: city } = await supabase.from('cities').select('id').eq('name', 'Quispamsis').eq('province_id', province.id).single();
    if (!city) {
        const { data: newCity } = await supabase.from('cities').insert({
            name: 'Quispamsis',
            slug: 'quispamsis',
            province_id: province.id
        }).select('id').single();
        city = newCity;
    }

    const description = "River Valley Archery Club operates from Lakefield Elementary School in Quispamsis, offering indoor shooting Wednesday evenings from 7 to 9 PM during winter months. Summer sessions include Wednesday evenings and Saturday mornings at our outdoor 3D range featuring a full complement of targets from squirrel to buffalo. Membership is required, and we welcome all bow types including recurve, compound, and longbow. Located in the Kennebecasis Valley just minutes from Saint John, our club serves Quispamsis, Rothesay, Hampton, and the broader Kings County area. Join the Saint John region's most versatile archery club with both indoor and outdoor year-round facilities.";

    // Use a unique slug to avoid collision with Saskatchewan entry
    const slug = 'river-valley-archery-club-nb';

    const { data, error } = await supabase.from('ranges').insert({
        name: 'River Valley Archery Club',
        slug: slug,
        address: 'Lakefield Elementary School',
        city_id: city.id,
        province_id: province.id,
        latitude: 45.43,
        longitude: -65.95,
        website: 'http://www.saintjohnsports.com/listing/river-valley-archery/',
        description: description,
        amenities: ['archery', 'club', '3D'],
        business_hours: 'Wed 7pm-9pm (winter)',
        post_images: ['/filler-image.jpg'],
        facility_type: 'Both',
        has_pro_shop: false,
        has_3d_course: true,
        has_field_course: false,
        membership_required: true,
        equipment_rental_available: false,
        lessons_available: false,
        bow_types_allowed: 'All',
        parking_available: true,
        is_featured: false
    }).select('id, name, slug');

    if (error) {
        console.error('ERROR:', error.message);
    } else {
        console.log('Created:', data[0].name, '->', data[0].slug);
    }

    // Verify total NB ranges
    const { data: all } = await supabase.from('ranges').select('name').eq('province_id', province.id).order('name');
    console.log('\nTotal NB ranges:', all.length);
    for (const r of all) console.log(' -', r.name);
}

main();
