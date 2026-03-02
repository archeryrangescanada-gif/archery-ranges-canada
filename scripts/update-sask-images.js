import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase URL or Service Role Key in .env.local')
    process.exit(1)
}

// Use service role key to bypass RLS policies
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

function generateSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

async function updateSaskImages() {
    console.log('🏹 Saskatchewan Ranges Image Updater')
    console.log('──────────────────────────────────────')

    const publicFolder = path.join(process.cwd(), 'public', 'saskatchewan listing images')

    if (!fs.existsSync(publicFolder)) {
        console.error(`❌ Folder not found: ${publicFolder}`)
        return
    }

    const files = fs.readdirSync(publicFolder)
    const imageFiles = files.filter(f => f.endsWith('.jpg') || f.endsWith('.png'))

    console.log(`Found ${imageFiles.length} images in public directory.`)

    let successCount = 0
    let errorCount = 0

    for (const file of imageFiles) {
        const slug = file.replace('.jpg', '').replace('.png', '')
        const imagePath = `/saskatchewan listing images/${file}`

        console.log(`Updating ${slug}...`)

        const { data, error } = await supabase
            .from('ranges')
            .update({
                post_images: [imagePath] // Update the array with the single image path
            })
            .eq('slug', slug)

        if (error) {
            console.error(`❌ Error updating ${slug}:`, error.message)
            errorCount++
        } else {
            console.log(`✅ Successfully updated ${slug}`)
            successCount++
        }
    }

    console.log('──────────────────────────────────────')
    console.log(`📊 Results: ${successCount} updated, ${errorCount} failed`)
}

updateSaskImages().catch(console.error)
