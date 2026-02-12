import { NextResponse } from 'next/server'
import { claimsAPI } from '@/lib/supabase-helpers'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { claimId, adminId } = body

        if (!claimId || !adminId) {
            console.error('Missing params:', { claimId, adminId })
            return NextResponse.json({ error: `Missing claimId or adminId. Got claimId=${claimId}, adminId=${adminId}` }, { status: 400 })
        }

        const result = await claimsAPI.approve(claimId, adminId)

        if (result.error) {
            console.error('claimsAPI.approve error:', result.error)
            return NextResponse.json({ error: result.error.message || JSON.stringify(result.error) }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error('Error approving claim:', err)
        return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 })
    }
}
