import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

// Get all businesses with email addresses for admin email sending
export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient()

    // Get all claimed ranges with owner information
    const { data: claims, error: claimsError } = await supabase
      .from('range_claims')
      .select(`
        id,
        range_id,
        status,
        archery_ranges (
          id,
          name,
          city,
          province,
          email
        ),
        profiles (
          id,
          email,
          full_name
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (claimsError) throw claimsError

    // Get all listings with email addresses (not claimed yet)
    const { data: listings, error: listingsError } = await supabase
      .from('archery_ranges')
      .select('id, name, city, province, email, phone_number')
      .not('email', 'is', null)
      .neq('email', '')
      .order('name')

    if (listingsError) throw listingsError

    // Get IDs of already claimed ranges
    const claimedRangeIds = new Set(claims?.map((c: any) => c.range_id) || [])

    // Transform claimed ranges data
    const claimedBusinesses = claims?.map((claim: any) => ({
      id: `claim-${claim.id}`,
      rangeId: claim.range_id,
      rangeName: claim.archery_ranges?.name || 'Unknown Range',
      city: claim.archery_ranges?.city,
      province: claim.archery_ranges?.province,
      email: claim.profiles?.email || claim.archery_ranges?.email,
      businessName: claim.profiles?.full_name || claim.archery_ranges?.name || 'Business',
      ownerId: claim.profiles?.id,
      source: 'claimed',
    })) || []

    // Transform listings data (exclude already claimed ranges)
    const listingBusinesses = listings
      ?.filter((listing: any) => !claimedRangeIds.has(listing.id))
      .map((listing: any) => ({
        id: `listing-${listing.id}`,
        rangeId: listing.id,
        rangeName: listing.name || 'Unknown Range',
        city: listing.city,
        province: listing.province,
        email: listing.email,
        businessName: listing.name || 'Business',
        ownerId: null,
        source: 'listing',
      })) || []

    // Combine both sources and remove duplicates by email
    const allBusinesses = [...claimedBusinesses, ...listingBusinesses]
    const uniqueBusinesses = allBusinesses.filter((business, index, self) =>
      business.email && index === self.findIndex((b) => b.email === business.email)
    )

    return NextResponse.json({
      success: true,
      businesses: uniqueBusinesses,
      total: uniqueBusinesses.length,
      breakdown: {
        claimed: claimedBusinesses.length,
        listings: listingBusinesses.length,
        duplicatesRemoved: allBusinesses.length - uniqueBusinesses.length,
      },
    })
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
