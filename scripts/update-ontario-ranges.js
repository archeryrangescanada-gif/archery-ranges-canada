/**
 * Ontario Archery Ranges — Audit Update Script
 * 
 * Applies all changes from the March 2026 audit:
 *  - Deletes 6 closed/unverifiable listings
 *  - Corrects data on 5 existing listings
 *  - Adds 1 new listing (Canada Archery Online)
 *  - Sets filler image on any Ontario range with no post_images
 * 
 * Usage: node scripts/update-ontario-ranges.js
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── 1. DELETIONS ────────────────────────────────────────────────────
const RANGES_TO_DELETE = [
    'Archery 2 You',
    'The Royal Garrison',
    'Saugeen Shafts',
    'Chesley Community Archery Club',
    'Parkline Archery Club',
    'Lanark County Bowhunters Organization',
];

// ─── 2. DATA CORRECTIONS ─────────────────────────────────────────────
const DATA_CORRECTIONS = [
    {
        // #7: Archery Canada Centre of Excellence
        // Remove "- Cambridge 2022" from name, fix email/phone/website
        matchName: 'Archery Canada Centre of Excellence',
        altMatchNames: [
            'Archery Canada Centre of Excellence - Cambridge 2022',
            'Archery Canada Centre of Excellence- Cambridge 2022',
        ],
        updates: {
            name: 'Archery Canada Centre of Excellence',
            email: 'zmeil@archerycanada.ca',
            website: 'https://archerycanada.ca',
        },
        // Clear phone if it contains an email address
        fixPhone: true,
    },
    {
        // #8: Cambridge Archery Club
        matchName: 'Cambridge Archery Club',
        updates: {
            email: 'gregory.cinti@wcdsb.ca',
            website: null,
        },
        fixPhone: true,
    },
    {
        // #9: Delhi Archery Club — remove dead website
        matchName: 'Delhi Archery Club',
        updates: {
            website: null,
        },
    },
    {
        // #10: Maple Leaf Marksmen Inc. — fix website
        matchName: 'Maple Leaf Marksmen Inc.',
        altMatchNames: ['Maple Leaf Marksmen Inc'],
        updates: {
            website: 'https://www.mapleleafmarksmen.ca',
        },
    },
    {
        // #11: E.T. Seton Park Archery Range — add closure note
        matchName: 'E.T. Seton Park Archery Range',
        altMatchNames: ['ET Seton Park Archery Range', 'E.T Seton Park Archery Range'],
        appendDescription: 'TEMPORARILY CLOSED as of December 2024 due to Metrolinx Ontario Line construction. Targets relocated for safety.',
    },
];

// ─── 3. NEW LISTING ──────────────────────────────────────────────────
const NEW_LISTING = {
    name: 'Canada Archery Online',
    slug: 'canada-archery-online',
    address: '105 Vanderhoof Avenue, Unit 5',
    postal_code: 'M4G 2H7',
    latitude: 43.7066,
    longitude: -79.4233,
    phone_number: '416-318-4741',
    email: null,
    website: 'https://canadaarcheryonline.com',
    description: 'Canada Archery Online is a premier indoor archery pro shop and range in Toronto, Ontario. Located at 105 Vanderhoof Avenue, the facility features a 4-lane indoor shooting range alongside a full-service pro shop carrying top archery brands. Lane rental is $9.99 per lane per hour. As an official sponsor of Archery Canada and the Canadian National Team, Canada Archery Online is a trusted destination for competitive and recreational archers. Lessons are available for all skill levels. Visit their Toronto showroom to browse equipment, test bows, and experience professional-grade archery facilities.',
    business_hours: 'Contact for hours',
    range_length_yards: null,
    number_of_lanes: 4,
    facility_type: 'Indoor',
    has_pro_shop: true,
    has_3d_course: false,
    has_field_course: false,
    membership_required: false,
    membership_price_adult: null,
    drop_in_price: 9.99,
    equipment_rental_available: false,
    lessons_available: true,
    lesson_price_range: 'Contact for pricing',
    bow_types_allowed: 'All',
    parking_available: true,
    is_featured: false,
    post_images: ['/filler-image.jpg'],
};

// ─── Helpers ─────────────────────────────────────────────────────────
function generateSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
    console.log('🏹 Ontario Archery Ranges — Audit Update');
    console.log('═══════════════════════════════════════════\n');

    // ─── Get Ontario province ID ─────────────────────────────────────
    const { data: province } = await supabase
        .from('provinces')
        .select('id')
        .ilike('name', 'Ontario')
        .single();

    if (!province) {
        console.error('❌ Ontario province not found in database');
        process.exit(1);
    }
    const provinceId = province.id;
    console.log(`📌 Ontario province ID: ${provinceId}\n`);

    // ─── STEP 1: Delete 6 ranges ────────────────────────────────────
    console.log('── STEP 1: Deleting closed/unverifiable ranges ──');
    let deleteCount = 0;

    for (const name of RANGES_TO_DELETE) {
        const { data, error } = await supabase
            .from('ranges')
            .delete()
            .eq('province_id', provinceId)
            .ilike('name', name)
            .select('id, name');

        if (error) {
            console.log(`  ❌ Error deleting "${name}": ${error.message}`);
        } else if (data && data.length > 0) {
            console.log(`  🗑️  Deleted: ${data[0].name}`);
            deleteCount++;
        } else {
            console.log(`  ⚠️  Not found: "${name}" (may already be deleted)`);
        }
    }
    console.log(`  📊 Deleted ${deleteCount} of ${RANGES_TO_DELETE.length}\n`);

    // ─── STEP 2: Apply data corrections ─────────────────────────────
    console.log('── STEP 2: Applying data corrections ──');
    let correctionCount = 0;

    for (const correction of DATA_CORRECTIONS) {
        // Try primary name first, then alternatives
        const namesToTry = [correction.matchName, ...(correction.altMatchNames || [])];
        let found = false;

        for (const tryName of namesToTry) {
            const { data: existing } = await supabase
                .from('ranges')
                .select('id, name, phone_number, description')
                .eq('province_id', provinceId)
                .ilike('name', tryName)
                .single();

            if (!existing) continue;
            found = true;

            const updateData = { ...(correction.updates || {}) };

            // Fix phone field if it contains email-like data
            if (correction.fixPhone && existing.phone_number) {
                if (existing.phone_number.includes('@') || existing.phone_number.length > 20) {
                    updateData.phone_number = null;
                }
            }

            // Fix slug if name changed
            if (updateData.name) {
                updateData.slug = generateSlug(updateData.name);
            }

            // Append to description if needed
            if (correction.appendDescription) {
                const currentDesc = existing.description || '';
                if (!currentDesc.includes(correction.appendDescription)) {
                    updateData.description = currentDesc
                        ? `${currentDesc} ${correction.appendDescription}`
                        : correction.appendDescription;
                }
            }

            updateData.updated_at = new Date().toISOString();

            const { error } = await supabase
                .from('ranges')
                .update(updateData)
                .eq('id', existing.id);

            if (error) {
                console.log(`  ❌ Error updating "${existing.name}": ${error.message}`);
            } else {
                console.log(`  ✅ Updated: ${existing.name}`);
                correctionCount++;
            }
            break;
        }

        if (!found) {
            console.log(`  ⚠️  Not found: "${correction.matchName}"`);
        }
    }
    console.log(`  📊 Corrected ${correctionCount} of ${DATA_CORRECTIONS.length}\n`);

    // ─── STEP 3: Add new listing ────────────────────────────────────
    console.log('── STEP 3: Adding new listing ──');

    // Get or create Toronto city
    let cityId = null;
    const { data: existingCity } = await supabase
        .from('cities')
        .select('id')
        .ilike('name', 'Toronto')
        .single();

    if (existingCity) {
        cityId = existingCity.id;
    } else {
        const { data: newCity } = await supabase
            .from('cities')
            .insert({ name: 'Toronto' })
            .select('id')
            .single();
        if (newCity) cityId = newCity.id;
    }

    // Check if already exists
    const { data: existingRange } = await supabase
        .from('ranges')
        .select('id')
        .eq('province_id', provinceId)
        .ilike('name', NEW_LISTING.name)
        .single();

    if (existingRange) {
        console.log(`  ⚠️  "${NEW_LISTING.name}" already exists, skipping\n`);
    } else {
        const { error } = await supabase
            .from('ranges')
            .insert({
                ...NEW_LISTING,
                province_id: provinceId,
                city_id: cityId,
            });

        if (error) {
            console.log(`  ❌ Error adding "${NEW_LISTING.name}": ${error.message}`);
        } else {
            console.log(`  ✅ Added: ${NEW_LISTING.name} (Toronto)\n`);
        }
    }

    // ─── STEP 4: Fill missing images ────────────────────────────────
    console.log('── STEP 4: Checking for missing images ──');

    const { data: allOntario } = await supabase
        .from('ranges')
        .select('id, name, post_images')
        .eq('province_id', provinceId);

    let missingImageCount = 0;
    if (allOntario) {
        for (const range of allOntario) {
            const images = range.post_images;
            const hasImages = images && Array.isArray(images) && images.length > 0 && images[0];

            if (!hasImages) {
                const { error } = await supabase
                    .from('ranges')
                    .update({ post_images: ['/filler-image.jpg'] })
                    .eq('id', range.id);

                if (!error) {
                    console.log(`  📷 Set filler: ${range.name}`);
                    missingImageCount++;
                }
            }
        }
    }

    if (missingImageCount === 0) {
        console.log('  ✅ All Ontario ranges already have images');
    } else {
        console.log(`  📊 Set filler image on ${missingImageCount} range(s)`);
    }

    // ─── Summary ────────────────────────────────────────────────────
    console.log('\n═══════════════════════════════════════════');
    console.log('📊 FINAL SUMMARY');
    console.log(`   🗑️  Deleted: ${deleteCount}`);
    console.log(`   ✏️  Corrected: ${correctionCount}`);
    console.log(`   ➕ Added: ${existingRange ? 0 : 1}`);
    console.log(`   📷 Filler images: ${missingImageCount}`);
    console.log('═══════════════════════════════════════════');
}

main().then(() => process.exit(0)).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
