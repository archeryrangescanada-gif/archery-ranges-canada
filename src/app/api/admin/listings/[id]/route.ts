import { getSupabaseClient } from '@/lib/supabase/safe-client'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    let body;
    try {
        body = await request.json()
    } catch(e) {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // ✅ WHITELIST allowed fields
    const allowedFields = [
      'name',
      'slug',
      'city_id',
      'province_id',
      'address',
      'postal_code',
      'latitude',
      'longitude',
      'phone_number',
      'email',
      'website',
      'description',
      'tags',
      'business_hours',
      'range_length_yards',
      'number_of_lanes',
      'facility_type',
      'has_pro_shop',
      'has_3d_course',
      'has_field_course',
      'equipment_rental_available',
      'lessons_available',
      'accessibility',
      'parking_available',
      'membership_required',
      'membership_price_adult',
      'drop_in_price',
      'lesson_price_range',
      'bow_types_allowed',
      'is_featured', // Admin can toggle featured status
      'status', // Admin can change status
      'post_images', // Allow updating images
      'post_zip' // Allow this too if it's used in frontend logic despite postal_code existing
    ]

    // ✅ FILTER to only allowed fields
    const updates: Record<string, any> = {}
    for (const key of Object.keys(body)) {
      if (allowedFields.includes(key)) {
        updates[key] = body[key]
      }
    }

    // ✅ VALIDATE field types
    if (updates.latitude && typeof updates.latitude !== 'number') {
      return NextResponse.json(
        { error: 'latitude must be a number' },
        { status: 400 }
      )
    }

    if (updates.longitude && typeof updates.longitude !== 'number') {
      return NextResponse.json(
        { error: 'longitude must be a number' },
        { status: 400 }
      )
    }

    if (updates.facility_type && !['Indoor', 'Outdoor', 'Both'].includes(updates.facility_type)) {
      return NextResponse.json(
        { error: 'facility_type must be Indoor, Outdoor, or Both' },
        { status: 400 }
      )
    }

    // Add timestamp
    updates.updated_at = new Date().toISOString()

    // Service Role Client for Admin Operations
    const adminSupabase = getSupabaseClient()

    const { data, error } = await adminSupabase
      .from('ranges')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`❌ Error updating listing ${id}:`, error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (error: any) {
    console.error('❌ Update API Error:', error)
    if (error.message === 'Failed to create Supabase client') {
        return NextResponse.json({ error: 'Configuration error: Missing admin keys' }, { status: 500 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    // Service Role Client for Admin Operations
    const adminSupabase = getSupabaseClient()

    // Use Service Role to ensure delete works even if RLS is strict
    const { error } = await adminSupabase
      .from('ranges')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`❌ Error deleting listing ${id}:`, error)
      return NextResponse.json(
        { error: error.message || 'Failed to delete listing' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('❌ Delete API Error:', error)
    if (error.message === 'Failed to create Supabase client') {
        return NextResponse.json({ error: 'Configuration error: Missing admin keys' }, { status: 500 });
    }
    return NextResponse.json(
      {
        error: error.message || 'Failed to delete listing',
        details: error.toString()
      },
      { status: 500 }
    )
  }
}
