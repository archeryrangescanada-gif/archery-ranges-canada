import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { claimsAPI } from '@/lib/supabase-helpers'

export async function POST(req: Request) {
    try {
        const { claimId, adminId, notes } = await req.json()

        if (!claimId || !adminId) {
            return NextResponse.json({ error: 'Missing claimId or adminId' }, { status: 400 })
        }

        const { error } = await claimsAPI.markAsContacted(claimId, adminId, notes)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error('Error marking claim as contacted:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
