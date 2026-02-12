import { NextResponse } from 'next/server'
import { claimsAPI } from '@/lib/supabase-helpers'

export async function POST(req: Request) {
    try {
        const { claimId, adminId, reason } = await req.json()

        if (!claimId || !adminId) {
            return NextResponse.json({ error: 'Missing claimId or adminId' }, { status: 400 })
        }

        if (!reason?.trim()) {
            return NextResponse.json({ error: 'Revocation reason is required' }, { status: 400 })
        }

        const { success, error } = await claimsAPI.revoke(claimId, adminId, reason)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error('Error revoking claim:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
