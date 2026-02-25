import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch ranges owned by this user
        const { data: ranges, error: rangesError } = await supabase
            .from('ranges')
            .select(`
                id, 
                name, 
                slug,
                address, 
                subscription_tier,
                owner_id,
                view_count,
                inquiry_count,
                city:cities(name, slug),
                province:provinces(name, slug)
            `)
            .eq('owner_id', user.id)

        if (rangesError) {
            console.error('Error fetching ranges:', rangesError)
            return NextResponse.json({ error: rangesError.message }, { status: 500 })
        }

        return NextResponse.json({ ranges: ranges || [] })
    } catch (error: any) {
        console.error('Unexpected error in dashboard/ranges:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
