import { NextResponse } from 'next/server'
import { claimsAPI } from '@/lib/supabase-helpers'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status') || undefined

        const { data, error } = await claimsAPI.getAll(status)

        if (error) throw error

        return NextResponse.json({ claims: data })
    } catch (err: any) {
        console.error('Error fetching claims:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
