import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
    try {
        const supabase = getSupabaseAdmin()

        // Query pg_type to get enum values
        const query = `
      SELECT t.typname, e.enumlabel
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = 'subscription_tier';
    `

        // Wait, Supabase client doesn't support raw queries directly via JS client like this easily.
        // Instead we can try to fetch a single known range and its schema.

        // Alternative: Try fetching postgres meta via rpc if it exists, or just query information_schema columns
        const { data: cols, error: colError } = await supabase
            .from('ranges')
            .select('subscription_tier')
            .limit(1)

        return NextResponse.json({
            error: 'Cannot easily run raw query via standard js client without RPC, but we know the error says: invalid input value for enum subscription_tier: "silver"',
            note: 'This implies the database is expecting a different casing, maybe capitalized like "Silver"? Or maybe the enum name is different.',
            code_types: 'free | bronze | silver | gold',
        })

    } catch (err: any) {
        return NextResponse.json({ error: err.message })
    }
}
