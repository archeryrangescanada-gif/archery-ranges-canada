import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Check for admin token cookie (legacy/demo auth)
        const cookieStore = await cookies()
        const adminToken = cookieStore.get('admin-token')?.value

        // Verify admin user via Supabase OR admin token
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // If valid admin token, allow through (skip all other checks)
        if (adminToken === 'valid-token') {
            // Admin token is valid, proceed
        } else if (user) {
            // Check if user has admin role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (!profile || !['admin', 'admin_employee', 'super_admin'].includes(profile.role)) {
                return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
            }
        } else {
            // No valid auth
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Use admin client to bypass RLS and get all ranges with emails
        const supabaseAdmin = getSupabaseAdmin()

        const { data: listings, error } = await supabaseAdmin
            .from('ranges')
            .select('name, email')
            .not('email', 'is', null)
            .not('email', 'eq', 'N/A')
            .order('name')

        if (error) {
            console.error('Error fetching listing emails:', error)
            return NextResponse.json({ error: 'Failed to fetch listing emails' }, { status: 500 })
        }

        // Filter out duplicates and invalid-looking emails
        const uniqueEmails = listings.reduce((acc: any[], current) => {
            const email = current.email?.trim().toLowerCase()
            if (email && !acc.find(item => item.email === email)) {
                acc.push({ name: current.name, email })
            }
            return acc
        }, [])

        return NextResponse.json({ listings: uniqueEmails })
    } catch (error: any) {
        console.error('Admin listing emails error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch listing emails' },
            { status: 500 }
        )
    }
}
