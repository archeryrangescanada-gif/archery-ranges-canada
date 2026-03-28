import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const maxDuration = 60; // Allow more time for large uploads

export async function POST(request: NextRequest) {
    try {
        // Verify the user is authenticated
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 })
        }

        const fileExt = file.name.split('.').pop()
        const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`
        const arrayBuffer = await file.arrayBuffer()

        // Use admin client to bypass RLS on storage
        const adminSupabase = getSupabaseAdmin()
        const { error: uploadError } = await adminSupabase.storage
            .from('range-images')
            .upload(filePath, arrayBuffer, {
                contentType: file.type,
                upsert: true,
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return NextResponse.json({ error: uploadError.message }, { status: 500 })
        }

        const { data: { publicUrl } } = adminSupabase.storage
            .from('range-images')
            .getPublicUrl(filePath)

        return NextResponse.json({ url: publicUrl })
    } catch (error: any) {
        console.error('Avatar upload route error:', error)
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
    }
}
