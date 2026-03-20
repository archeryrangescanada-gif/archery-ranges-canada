import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { geocodeAddress } from '@/lib/geocoding'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authClient = await createServerClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    const body = await request.json()

    // Updates object - typically used for is_featured, is_premium, status
    const updates = { ...body, updated_at: new Date().toISOString() }

    // Translate frontend subscription_tier enum to backend db enum
    if (updates.subscription_tier) {
      const tierMap: Record<string, string> = {
        'bronze': 'basic',
        'silver': 'pro',
        'gold': 'premium',
        'free': 'free'
      }
      updates.subscription_tier = tierMap[updates.subscription_tier] || updates.subscription_tier
    }

    // ── Auto-geocode whenever address is being changed ───────────────────────
    // If the payload contains an address field, re-geocode and update coordinates
    // so the map pin always matches the displayed address.
    if ('address' in updates && updates.address) {
      try {
        // Fetch city/province names from the existing range record
        const supabaseAdmin = getSupabaseAdmin()
        const { data: existing } = await supabaseAdmin
          .from('ranges')
          .select('cities(name), provinces(name)')
          .eq('id', id)
          .single()

        const city = (existing as any)?.cities?.name ?? null
        const province = (existing as any)?.provinces?.name ?? null

        const coords = await geocodeAddress(updates.address, city, province)
        if (coords) {
          updates.latitude = coords.lat
          updates.longitude = coords.lng
          console.log(`📍 Auto-geocoded "${updates.address}" → ${coords.lat}, ${coords.lng}`)
        } else {
          console.warn(`⚠️  Could not geocode address: "${updates.address}, ${city}, ${province}"`)
        }
      } catch (geocodeErr) {
        // Don't block the save if geocoding fails — just log it
        console.error('⚠️  Geocoding error (save will continue):', geocodeErr)
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Use admin client since service role key bypasses RLS
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
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
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authClient = await createServerClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    // Use admin client since service role key bypasses RLS
    const supabase = getSupabaseAdmin()
    const { error } = await supabase
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
