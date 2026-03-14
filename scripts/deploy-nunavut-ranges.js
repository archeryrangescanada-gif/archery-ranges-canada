require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

const seoDescription = "Iqaluit Recreation Department on Apex Road is Nunavut's primary contact for organized archery programming in Canada's newest and northernmost territory. Seasonal archery programs may be offered through the Arctic Winter Games Complex, providing residents and visitors a chance to experience the sport at latitude 63 degrees north. The department coordinates municipal recreation services for Iqaluit and surrounding Baffin Island communities. All bow types are welcome, and no membership is required for recreation programs. Serving Iqaluit, Apex, and the Qikiqtaaluk region, contact recreation@city.iqaluit.nu.ca or call 867-979-5611 for current archery schedules and program availability.";

async function main() {
    // Get or create Nunavut province
    let { data: province } = await supabase.from('provinces').select('id').eq('slug', 'nunavut').single();
    if (!province) {
        const { data: newProv } = await supabase.from('provinces').insert({
            name: 'Nunavut',
            slug: 'nunavut',
            abbreviation: 'NU'
        }).select('id').single();
        province = newProv;
        console.log('Created province: Nunavut');
    } else {
        console.log('Province exists: Nunavut (id=' + province.id + ')');
    }

    const slug = slugify('Iqaluit Recreation Department');

    // Check if exists
    const { data: existing } = await supabase.from('ranges').select('id').eq('slug', slug).single();
    if (existing) {
        console.log('SKIP (exists): Iqaluit Recreation Department');
        return;
    }

    // Get or create Iqaluit city
    let { data: city } = await supabase.from('cities').select('id').eq('name', 'Iqaluit').eq('province_id', province.id).single();
    if (!city) {
        const { data: newCity } = await supabase.from('cities').insert({
            name: 'Iqaluit',
            slug: 'iqaluit',
            province_id: province.id
        }).select('id').single();
        city = newCity;
        console.log('Created city: Iqaluit');
    }

    const { data, error } = await supabase.from('ranges').insert({
        name: 'Iqaluit Recreation Department',
        slug: slug,
        address: '1084 Apex Rd',
        city_id: city.id,
        province_id: province.id,
        postal_code: 'X0A 0H0',
        latitude: 63.75,
        longitude: -68.52,
        phone_number: '867-979-5611',
        email: 'recreation@city.iqaluit.nu.ca',
        website: 'https://iqaluit.ca/residents/recreation',
        description: seoDescription,
        amenities: ['archery', 'recreation', 'municipal'],
        post_images: ['/filler-image.jpg'],
        facility_type: null,
        has_pro_shop: false,
        has_3d_course: false,
        has_field_course: false,
        membership_required: false,
        equipment_rental_available: false,
        lessons_available: false,
        bow_types_allowed: 'All',
        parking_available: true,
        is_featured: false,
    }).select('id, name, slug');

    if (error) {
        console.error('ERROR:', error.message);
    } else {
        console.log('OK: ' + data[0].name + ' (' + data[0].slug + ')');
    }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
