require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Quebec ranges that did NOT get scraped photos — need filler image
const rangesNeedingFiller = [
    'Club Archeguin de St-Etienne',
    'Club de Tir Beausejour',
    "Club de Tir a l'Arc de Roberval",
    "Club de Tir a l'Arc de St-Simon",
    'Club des Archers de Chicoutimi',
    'Club des Archers de St-Felicien',
    'Club les Archers de Sept-Iles',
    'Club Les Archers de St-Hubert',
    "Club de Tir Nord'Arc",
    'La Fine Pointe de Brossard',
    "La Fleche de L'Archer",
    'Les Archers de Jonquiere',
    'Les Archers de LaSalle',
    'Les Archers du Sud-Ouest de Montreal',
    'Les Archers Laval',
    'Les Cameleons de Gatineau',
    'Les Fleches Maska St-Hyacinthe',
    "Les Francs Archers de L'Assomption",
    'Tir a l\'Arc Drummondville',
    'Les Archers de la Vallee',
    'Club de Tir Josee',
    "Les Archers de Val-d'Or",
    'Les Archers de Rouyn-Noranda',
];

async function main() {
    console.log(`Setting filler image on ${rangesNeedingFiller.length} Quebec ranges...\n`);

    let successCount = 0;
    let skipCount = 0;

    for (const name of rangesNeedingFiller) {
        const { data: range, error: fetchErr } = await supabase
            .from('ranges')
            .select('id, name, post_images')
            .ilike('name', name)
            .single();

        if (fetchErr || !range) {
            console.log(`NOT FOUND: ${name}`);
            continue;
        }

        // Skip if already has a real image (not filler)
        const images = range.post_images || [];
        if (images.length > 0 && images[0] !== '/filler-image.jpg') {
            console.log(`SKIP (has image): ${range.name}`);
            skipCount++;
            continue;
        }

        // Already has filler
        if (images.length === 1 && images[0] === '/filler-image.jpg') {
            console.log(`ALREADY SET: ${range.name}`);
            skipCount++;
            continue;
        }

        const { error: updateErr } = await supabase
            .from('ranges')
            .update({ post_images: ['/filler-image.jpg'] })
            .eq('id', range.id);

        if (updateErr) {
            console.error(`ERROR updating ${range.name}:`, updateErr.message);
        } else {
            console.log(`UPDATED: ${range.name}`);
            successCount++;
        }
    }

    console.log(`\nDone. Updated: ${successCount}, Skipped: ${skipCount}`);
}

main();
