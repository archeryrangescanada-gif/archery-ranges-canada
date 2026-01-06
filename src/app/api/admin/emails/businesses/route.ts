import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Get all businesses with email addresses for admin email sending
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all claimed ranges with owner information
    const { data: claims, error } = await supabase
      .from('range_claims')
      .select(`
        id,
        range_id,
        status,
        archery_ranges (
          id,
          name,
          city,
          province
        ),
        profiles (
          id,
          email,
          full_name
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transform data for email recipients
    const businesses = claims?.map((claim: any) => ({
      id: claim.id,
      rangeId: claim.range_id,
      rangeName: claim.archery_ranges?.name || 'Unknown Range',
      city: claim.archery_ranges?.city,
      province: claim.archery_ranges?.province,
      email: claim.profiles?.email,
      businessName: claim.profiles?.full_name || claim.archery_ranges?.name || 'Business',
      ownerId: claim.profiles?.id,
    })) || []

    return NextResponse.json({
      success: true,
      businesses,
      total: businesses.length,
    })
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
