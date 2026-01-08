import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Service Role Client for Admin Operations
const adminSupabase = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

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

    // Input Validation: Whitelist allowed fields
    const allowedFields = [
        'name',
        'city',
        'province',
        'address',
        'description',
        'phone',
        'email',
        'website',
        'latitude',
        'longitude',
        'post_zip',
        'post_images',
        'is_featured',
        'is_claimed',
        'facility_type',
        'range_length_yards',
        'number_of_lanes',
        'has_pro_shop',
        'has_3d_course',
        'has_field_course',
        'membership_required',
        'membership_price_adult',
        'drop_in_price',
        'equipment_rental_available',
        'lessons_available',
        'accessibility',
        'parking_available',
        'bow_types_allowed',
        'lesson_price_range',
        'business_hours'
    ];

    const updates: Record<string, any> = { updated_at: new Date().toISOString() }

    for (const key of Object.keys(body)) {
        if (allowedFields.includes(key)) {
            updates[key] = body[key]
        }
    }

    // Additional validation can go here (e.g. types)
    if (updates.name && typeof updates.name !== 'string') {
        return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }

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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check Auth (Optional for extra security, but layout handles most)
    // const supabase = await createClient()
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

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
    return NextResponse.json(
      {
        error: error.message || 'Failed to delete listing',
        details: error.toString()
      },
      { status: 500 }
    )
  }
}
